import { ATProtocol } from './at-protocol.ts';
import { EventDispatcher } from './event-dispatcher.ts';

export class FirehoseEvent<Data extends ATProtocol.Jetstream.Event> extends Event {
    data: Data;

    constructor(message: string) {
        const event = JSON.parse(message) as ATProtocol.Jetstream.Event;
        super(event.kind === 'commit' ? event.commit.operation : event.kind);
        this.data = event as Data;
    }
}

type FirehoseEvents = {
    identity: FirehoseEvent<ATProtocol.Jetstream.IdentityEvent>;
    account: FirehoseEvent<ATProtocol.Jetstream.AccountEvent>;
    create: FirehoseEvent<ATProtocol.Jetstream.CreateEvent>;
    update: FirehoseEvent<ATProtocol.Jetstream.UpdateEvent>;
    delete: FirehoseEvent<ATProtocol.Jetstream.DeleteEvent>;
};

type SpecializedEvent = FirehoseEvents[keyof FirehoseEvents];

export interface FirehoseOptions {
    /**
     * Any URL (subdomain, domain, and TLD only) to a hosted Jetstream service.
     * To connect to one of the Bluesky Jetstream instances, you can use one
     * of these values:
     *
     * - jetstream1.us-east.bsky.network
     * - jetstream2.us-east.bsky.network
     * - jetstream1.us-west.bsky.network
     * - jetstream2.us-west.bsky.network
     */
    service: string;
    /**
     * An array of collection NSIDs to filter which records you receive on
     * your stream. If you don't pass anything for this parameter, you will
     * recieve all collections.
     *
     * `selectCollections` supports NSID path prefixes i.e. `app.bsky.graph.*`,
     * or `app.bsky.*`. The prefix before the `.*` must pass NSID validation
     * and Jetstream does not support incomplete prefixes i.e. `app.bsky.graph.fo*`.
     */
    selectCollections?: ATProtocol.NSID[];
    /**
     * An array of repo DIDs to filter which records you receive on your stream.
     * If you don't pass anything for this parameter, you will recieve all repos.
     * You can specify at most 10,000 wanted DIDs.
     */
    selectRepos?: ATProtocol.DID[];
    /**
     * A unix microseconds timestamp cursor from which to begin playback.
     *
     * An absent cursor or a cursor from the future will result in live-tail operation.
     *
     * When reconnecting, use the `time_us` from your most recently processed event and
     * maybe provide a negative buffer (i.e. subtract a few seconds) to ensure gapless
     * playback.
     */
    cursor?: number;
}

/**
 * Client for connecting to an AT Protocol Firehose (Jetstream) service.
 * Provides a WebSocket-based event stream of repository events like creates, updates, and deletes.
 *
 * Events can be filtered by collection NSID and/or repository DID.
 * Supports cursor-based playback for historical events and live-tailing.
 *
 * @example
 * ```ts
 * const firehose = new Firehose({
 *   service: 'jetstream1.us-east.bsky.network',
 *   selectCollections: ['app.bsky.feed.post']
 * });
 *
 * firehose.addEventListener('create', (event) => {
 *   console.log('New post:', event.data.commit.record);
 * });
 * ```
 */
export class Firehose extends EventDispatcher<FirehoseEvents> {
    readonly #socket: WebSocketStream;

    constructor({ service, cursor, selectCollections = [], selectRepos = [] }: FirehoseOptions) {
        super();

        const url = new URL(`wss://${service}/subscribe`);

        if (cursor) {
            url.searchParams.append('cursor', cursor.toString());
        }

        for (const collection of selectCollections) {
            url.searchParams.append('wantedCollections', collection);
        }

        for (const repo of selectRepos) {
            url.searchParams.append('wantedDids', repo);
        }

        const socket = new WebSocketStream(url.toString());

        (async () => {
            const { readable } = await socket.opened;

            for await (const message of readable) {
                this.dispatchEvent(
                    new FirehoseEvent(message as string) as SpecializedEvent,
                );
            }
        })();

        this.#socket = socket;
    }

    close() {
        this.#socket.close();
    }

    // TODO: Subscriber Sourced messages
    // https://github.com/bluesky-social/jetstream#subscriber-sourced-messages
}
