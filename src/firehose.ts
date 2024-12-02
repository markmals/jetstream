import { ATProtocol } from './at-protocol.ts';
import { GenericEventTarget } from './generic-event-target.ts';

export class FirehoseEvent<Data extends ATProtocol.Jetstream.Event> extends Event {
    data: Data;

    constructor(message: string) {
        const event = JSON.parse(message) as ATProtocol.Jetstream.Event;
        super(event.kind === 'commit' ? event.commit.operation : event.kind);
        this.data = event as Data;
    }
}

type FirehoseEventMap = {
    identity: FirehoseEvent<ATProtocol.Jetstream.IdentityEvent>;
    account: FirehoseEvent<ATProtocol.Jetstream.AccountEvent>;
    create: FirehoseEvent<ATProtocol.Jetstream.CreateCommitEvent>;
    update: FirehoseEvent<ATProtocol.Jetstream.UpdateCommitEvent>;
    delete: FirehoseEvent<ATProtocol.Jetstream.DeleteCommitEvent>;
};

export interface FirehoseOptions {
    // jetstream1.us-east.bsky.network
    // jetstream2.us-east.bsky.network
    // jetstream1.us-west.bsky.network
    // jetstream2.us-west.bsky.network
    service: string;
    selectCollections?: ATProtocol.NSID[];
    selectDids?: string[];
    cursor?: number;
}

export class Firehose extends GenericEventTarget<FirehoseEventMap> implements Disposable {
    #service: string;
    #socketStream: WebSocketStream;

    #selectedCollections: ATProtocol.NSID[];
    #selectedDids: string[];
    #cursor?: number;

    get #url() {
        const url = new URL(`wss://${this.#service}/subscribe`);

        if (this.#cursor) {
            url.searchParams.append('cursor', this.#cursor.toString());
        }

        for (const collection of this.#selectedCollections) {
            url.searchParams.append('wantedCollections', collection);
        }

        for (const did of this.#selectedDids) {
            url.searchParams.append('wantedDids', did);
        }

        return url;
    }

    constructor(options: FirehoseOptions) {
        super();

        this.#service = options.service;
        this.#selectedCollections = options.selectCollections ?? [];
        this.#selectedDids = options.selectDids ?? [];
        this.#cursor = options.cursor;

        this.#socketStream = new WebSocketStream(this.#url.toString());

        this.#start();
    }

    async #start() {
        const connection = await this.#socketStream.opened;

        for await (const message of connection.readable) {
            this.dispatchEvent(
                new FirehoseEvent<any>(message as string),
            );
        }
    }

    [Symbol.dispose]() {
        this.#socketStream.close();
    }
}
