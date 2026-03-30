# Infratex Node.js SDK

Official Node.js / TypeScript SDK for the [Infratex](https://infratex.io) document intelligence API.

- Parse PDFs into structured markdown
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

// Index for search
await client.documents.index(doc.id, { method: 'vector' });

// Search
const { results } = await client.searches.create({
  query: 'quarterly revenue',
  method: 'vector',
  limit: 5,
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
const doc = await client.documents.upload('/path/to/file.pdf');
const doc = await client.documents.upload(buffer, { filename: 'report.pdf', method: 'standard' });

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
```

### Search

```typescript
const response = await client.searches.create({
  query: 'revenue growth',
  method: 'vector',   // or 'hybrid'
  limit: 10,
  document_ids: ['doc-1', 'doc-2'],  // optional scope
  collection_id: 'col-id',           // optional scope
});
```

### Responses (streaming)

```typescript
const stream = await client.responses.create({
  message: 'What are the key risks?',
  method: 'vector',
  limit: 5,
  conversation_id: 'conv-id',  // optional, for multi-turn
});

for await (const event of stream) {
  switch (event.type) {
    case 'text':
      process.stdout.write(event.content);
      break;
    case 'sources':
      console.log('Sources:', event.sources);
      break;
    case 'error':
      console.error(event.content);
      break;
    case 'done':
      break;
  }
}
```

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
const conv = await client.conversations.create({ title: 'Analysis' });
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
