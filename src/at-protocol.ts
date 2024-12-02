export namespace ATProtocol {
    export type NSID = `${string}.${string}` | `${string}.${string}.*`;

    export namespace Jetstream {
        export type Event =
            | IdentityEvent
            | AccountEvent
            | CreateCommitEvent
            | UpdateCommitEvent
            | DeleteCommitEvent;

        export interface IdentityEvent {
            did: string;
            time_us: number;
            kind: 'identity';
            identity: Identity;
        }

        export interface AccountEvent {
            did: string;
            time_us: number;
            kind: 'account';
            account: Account;
        }

        export interface CreateCommitEvent {
            did: string;
            time_us: number;
            kind: 'commit';
            commit: Create;
        }

        export interface UpdateCommitEvent {
            did: string;
            time_us: number;
            kind: 'commit';
            commit: Update;
        }

        export interface DeleteCommitEvent {
            did: string;
            time_us: number;
            kind: 'commit';
            commit: Delete;
        }
    }

    export interface Create<R = Record<string, unknown>> {
        rev: string;
        operation: 'create';
        collection: string;
        rkey: string;

        cid: string;
        record: R;
    }

    export interface Update<R = Record<string, unknown>> {
        rev: string;
        operation: 'update';
        collection: string;
        rkey: string;

        cid: string;
        record: R;
    }

    export interface Delete {
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
