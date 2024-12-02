import { Firehose } from './firehose.ts';

const firehose = new Firehose({
    service: 'jetstream1.us-east.bsky.network',
    selectCollections: ['app.bsky.graph.starterpack'],
});

// firehose.addEventListener('identity', (event) => console.log('[IDENTITY]:', event.data));
// firehose.addEventListener('account', (event) => console.log('[ACCOUNT]:', event.data));
firehose.addEventListener('create', (event) => console.log('[CREATE]:', event.data));
firehose.addEventListener('update', (event) => console.log('[UPDATE]:', event.data));
firehose.addEventListener('delete', (event) => console.log('[DELETE]:', event.data));
