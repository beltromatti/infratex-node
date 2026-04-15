# Infratex Node.js SDK

Official Node.js / TypeScript SDK for the [Infratex](https://infratex.io) document intelligence API.

- Parse PDFs into structured markdown
- Parse ordered image batches into structured markdown
- Build vector and hybrid search indexes
- Semantic search across your documents
- Stream AI-generated responses grounded in your data

Requires **Node.js 18+**. Zero runtime dependencies -- uses the native `fetch` API.

## Install

```bash
npm install infratex
```

## Quick start

```typescript
import Infratex from 'infratex';

const client = new Infratex({ apiKey: 'infratex_sk_...' });

// Upload and parse a PDF
const doc = await client.documents.upload('./report.pdf');
console.log(doc.id, doc.page_count, 'pages');

// Upload an ordered image batch as document pages
const deck = await client.documents.uploadImages(['./page-1.png', './page-2.png'], {
  method: 'max',
});
console.log(deck.id, deck.page_count, 'pages');

// Index for search
// The SDK waits for the queued index by default.
await client.documents.index(doc.id, { method: 'vector' });

// Search
const { results } = await client.searches.create({
  query: 'quarterly revenue',
  method: 'vector',
  limit: 5,
  document_ids: [doc.id],
});

// Stream an AI response
const stream = await client.responses.create({
  message: 'Summarize the key findings',
  method: 'vector',
});

for await (const event of stream) {
  if (event.type === 'text') process.stdout.write(event.content);
}
```

## API reference

### `new Infratex(config)`

| Option    | Type     | Default                      | Description            |
|-----------|----------|------------------------------|------------------------|
| `apiKey`  | `string` | --                           | Your API key           |
| `baseUrl` | `string` | `https://api.infratex.io`    | API base URL override  |
| `timeout` | `number` | `300000`                     | Request timeout in ms  |

### Documents

```typescript
// Upload from file path or Buffer
// The SDK keeps this as a single awaited call even though the raw HTTP API
// now creates the document first and polls until parsing completes.
const doc = await client.documents.upload('/path/to/file.pdf');
const doc = await client.documents.upload(buffer, { filename: 'report.pdf', method: 'standard' });
const richDoc = await client.documents.upload('/path/to/deck.pdf', { method: 'max' });

// Upload ordered images instead of a PDF
const images = await client.documents.uploadImages(['/tmp/page-1.png', '/tmp/page-2.png']);
const richImages = await client.documents.uploadImages(['/tmp/page-1.png', '/tmp/page-2.png'], {
  method: 'max',
  collection_id: 'col-id',
});

// Queue-first upload if you want to manage the parse lifecycle yourself
const queued = await client.documents.upload('/path/to/file.pdf', { wait: false });
const ready = await client.documents.get(queued.id, { wait: true });

// Queue-first image upload follows the same pattern
const queuedImages = await client.documents.uploadImages(['/tmp/page-1.png', '/tmp/page-2.png'], { wait: false });
const readyImages = await client.documents.get(queuedImages.id, { wait: true });

// List with pagination and filters
const { documents, total } = await client.documents.list({ limit: 50, status: 'parsed' });

// Get a single document
const doc = await client.documents.get('doc-id');

// Download extracted markdown
const markdown = await client.documents.markdown('doc-id');

// Delete
await client.documents.delete('doc-id');

// Create a search index
const index = await client.documents.index('doc-id', { method: 'vector' });

// Queue-first behavior if you want to manage polling yourself
const queued = await client.documents.index('doc-id', { method: 'hybrid', wait: false });
const indexes = await client.documents.listIndexes('doc-id');
const ready = await client.documents.getIndex('doc-id', 'hybrid', { wait: true });
```

### Search

```typescript
const response = await client.searches.create({
  query: 'revenue growth',
  method: 'vector',   // or 'hybrid'
  limit: 10,
  document_ids: ['doc-1', 'doc-2'],
});
```

### Responses (streaming)

```typescript
const stream = await client.responses.create({
  message: 'What are the key risks?',
  method: 'vector',
  limit: 5,
  document_ids: ['doc-id'],
});

for await (const event of stream) {
  switch (event.type) {
    case 'text':
      process.stdout.write(event.content);
      break;
    case 'sources':
      console.log('Sources:', event.content);
      break;
    case 'error':
      console.error(event.content);
      break;
    case 'done':
      break;
  }
}
```

```typescript
const conv = await client.conversations.create({
  title: 'Quarterly Analysis',
  collection_id: 'col-id',
});

const stream = await client.responses.create({
  conversation_id: conv.id,
  message: 'How does that compare with the previous quarter?',
  method: 'hybrid',
  model: 'pro',
});
```

`documents.upload(...)`, `documents.uploadImages(...)`, and `documents.index(...)` now follow the same contract: they wait by default, support queue-first behavior with `wait: false`, and expose a matching getter with `wait: true` if you want to resume later.

Use `method: 'max'` when you want the Gemini parser to preserve the normal extracted text while also appending brief `[visual-note: ...]` lines for meaningful charts, figures, screenshots, and photos.

### Collections

```typescript
const col = await client.collections.create({ name: 'Q3 Reports' });
const cols = await client.collections.list();
const col = await client.collections.get('col-id');
await client.collections.update('col-id', { name: 'Q4 Reports' });
await client.collections.delete('col-id');
```

### Conversations

```typescript
const conv = await client.conversations.create({ title: 'Analysis', collection_id: 'col-id' });
const convs = await client.conversations.list();
const full = await client.conversations.get('conv-id');  // includes messages
await client.conversations.delete('conv-id');
```

### Account & Billing

```typescript
const { tenant } = await client.account.get();
console.log(tenant.credit_balance_micros);

const billing = await client.billing.get();
console.log(billing.balance_micros, billing.totals);
```

## Error handling

All API errors throw an `InfratexError`:

```typescript
import { InfratexError } from 'infratex';

try {
  await client.documents.get('nonexistent');
} catch (err) {
  if (err instanceof InfratexError) {
    console.error(err.status);   // 404
    console.error(err.code);     // 'not_found'
    console.error(err.message);  // 'Document not found'
  }
}
```

## License

MIT
