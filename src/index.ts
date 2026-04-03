export { Infratex } from './client.js';
export { InfratexError } from './http.js';
export { ResponseStream } from './resources/responses.js';
export { SDK_VERSION } from './version.js';

// Re-export all types
export type {
  InfratexConfig,
  InfratexErrorBody,
  ParseMethod,
  BasePipeline,
  DocStatus,
  DocumentRegion,
  DocumentExtractionPage,
  UploadResponse,
  Document,
  DocumentListResponse,
  UploadOptions,
  DocumentListOptions,
  IndexMethod,
  IndexCreateOptions,
  IndexResponse,
  SearchResult,
  SearchCreateOptions,
  SearchResponse,
  ScopeSelector,
  ResponseCreateOptions,
  ResponseSourceCitation,
  ResponseTextEvent,
  ResponseSourcesEvent,
  ResponseThinkingEvent,
  ResponseErrorEvent,
  ResponseDoneEvent,
  ResponseEvent,
  Collection,
  CollectionCreateOptions,
  CollectionUpdateOptions,
  ConversationMessage,
  Message,
  Conversation,
  ConversationDetail,
  ConversationCreateOptions,
  Tenant,
  AccountResponse,
  BillingTransaction,
  BillingUsageEvent,
  BillingServiceSpend,
  BillingDailySpend,
  BillingSummaryResponse,
} from './types.js';

// Default export for convenience: `import Infratex from 'infratex'`
export { Infratex as default } from './client.js';
