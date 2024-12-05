type Events = {
    [key: string]: Event;
};

export class EventDispatcher<EventMap extends Events> extends EventTarget {
    /* @ts-ignore */
    override addEventListener<Key extends keyof EventMap & string>(
        type: Key,
        listener: ((event: EventMap[Key]) => void) | null,
        options?: EventListenerOptions | boolean,
    ): void {
        /* @ts-ignore */
        super.addEventListener(type, listener, options);
    }

    /* @ts-ignore */
    override removeEventListener<Key extends keyof EventMap & string>(
        type: Key,
        listener: ((event: EventMap[Key]) => void) | null,
        options?: boolean | EventListenerOptions,
    ): void {
        /* @ts-ignore */
        super.removeEventListener(type, listener, options);
    }

    override dispatchEvent<Key extends keyof EventMap>(event: EventMap[Key]): boolean {
        return super.dispatchEvent(event);
    }
}
