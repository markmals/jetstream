export namespace ATProtocol {
    export type NSID = `${string}.${string}` | `${string}.${string}.*`;

    export type DID = DidWeb | DidPlc;
    export type DidWeb = `did:web:${string}`;
    export type DidPlc = `did:plc:${string}`;

    export namespace Jetstream {
        export type Event =
            | IdentityEvent
            | AccountEvent
            | CreateEvent
            | UpdateEvent
            | DeleteEvent;

        /**
         * An Identity update for a DID which indicates that you may want to
         * purge an identity cache and revalidate the DID doc and handle.
         */
        export interface IdentityEvent {
            did: string;
            time_us: number;
            kind: 'identity';
            identity: Identity;
        }

        /**
         * An Account event that indicates a change in account status i.e. from
         * active to deactivated, or to `takendown` if the PDS has taken down the repo.
         */
        export interface AccountEvent {
            did: string;
            time_us: number;
            kind: 'account';
            account: Account;
        }

        /**
         * Create a new record with the contents provided.
         */
        export interface CreateEvent {
            did: string;
            time_us: number;
            kind: 'commit';
            commit: CreateCommit;
        }

        /**
         * Update an existing record and replace it with the contents provided.
         */
        export interface UpdateEvent {
            did: string;
            time_us: number;
            kind: 'commit';
            commit: UpdateCommit;
        }

        /**
         * Delete an existing record with the DID, Collection, and Record Key provided.
         */
        export interface DeleteEvent {
            did: string;
            time_us: number;
            kind: 'commit';
            commit: DeleteCommit;
        }
    }

    export interface CreateCommit<R = Record<string, unknown>> {
        rev: string;
        operation: 'create';
        collection: string;
        rkey: string;

        cid: string;
        record: R;
    }

    export interface UpdateCommit<R = Record<string, unknown>> {
        rev: string;
        operation: 'update';
        collection: string;
        rkey: string;

        cid: string;
        record: R;
    }

    export interface DeleteCommit {
        rev: string;
        operation: 'delete';
        collection: string;
        rkey: string;
    }

    export interface Account {
        did: string;
        seq: number;
        time: Date;

        active: boolean;
    }

    export interface Identity {
        did: string;
        seq: number;
        time: Date;

        handle: string;
    }
}
