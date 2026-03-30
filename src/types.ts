// ---------------------------------------------------------------------------
// Client configuration
// ---------------------------------------------------------------------------

export interface InfratexConfig {
  /** API key starting with `infratex_sk_...` */
  apiKey: string;
  /** Base URL override. Defaults to `https://api.infratex.io`. */
  baseUrl?: string;
  /** Default request timeout in milliseconds. Defaults to 300_000 (5 min). */
  timeout?: number;
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export interface InfratexErrorBody {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export type ParseMethod = 'legacy' | 'experimental' | 'standard' | 'cost-efficient';
export type BasePipeline = 'traditional' | 'math';
export type DocStatus = 'pending' | 'processing' | 'done' | 'parsed' | 'indexed' | 'error';

export interface DocumentRegion {
  id: number;
  label: string;
  bbox: number[];
  content: string;
  page: number;
}

export interface DocumentExtractionPage {
  page: number;
  width: number;
  height: number;
  markdown: string;
  regions: DocumentRegion[];
  images: Record<string, string>;
}

export interface UploadResponse {
  id: string;
  status: string;
  method: ParseMethod;
  filename: string;
  pipeline: string | null;
  page_count: number | null;
  markdown: string | null;
  extraction_ms: number;
  collection_id: string | null;
  extraction_pages: DocumentExtractionPage[] | null;
}

export interface Document {
  id: string;
  filename: string;
  upload_time: string;
  status: string;
  method: ParseMethod;
  pipeline: string | null;
  page_count: number | null;
  processing_time_ms: number | null;
  error_message: string | null;
  markdown_size_bytes: number | null;
  chunk_count: number | null;
  index_method: string | null;
  collection_id: string | null;
  markdown: string | null;
  extraction_pages: DocumentExtractionPage[] | null;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

export interface UploadOptions {
  /** Original filename. Required when uploading a Buffer. */
  filename?: string;
  /** Parse method. Defaults to `standard`. */
  method?: ParseMethod;
  /** Pipeline (only for method `legacy`). */
  pipeline?: BasePipeline;
  /** Assign to a collection on upload. */
  collection_id?: string;
}

export interface DocumentListOptions {
  status?: DocStatus;
  collection_id?: string;
  limit?: number;
  offset?: number;
}

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

export type IndexMethod = 'vector' | 'hybrid';

export interface IndexCreateOptions {
  method: IndexMethod;
}

export interface IndexResponse {
  document_id: string;
  filename: string;
  method: IndexMethod;
  status: string;
  node_count: number;
  chunk_count: number;
  has_ast: boolean;
  has_description: boolean;
  processing_ms: number;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchResult {
  document_id: string;
  document_name: string | null;
  score: number;
  content: string;
  title: string;
  summary: string;
  node_id: string | null;
  chunk_index: number | null;
  metadata: Record<string, unknown> | null;
  source: string;
}

export interface SearchCreateOptions {
  method?: IndexMethod;
  query: string;
  limit?: number;
  document_ids?: string[];
  collection_id?: string;
}

export interface SearchResponse {
  method: IndexMethod;
  query: string;
  results: SearchResult[];
}

// ---------------------------------------------------------------------------
// Responses (AI generation, SSE)
// ---------------------------------------------------------------------------

export interface ResponseCreateOptions {
  method?: IndexMethod;
  message: string;
  limit?: number;
  document_ids?: string[];
  collection_id?: string;
  conversation_id?: string;
}

export interface ResponseTextEvent {
  type: 'text';
  content: string;
}

export interface ResponseSourcesEvent {
  type: 'sources';
  sources: SearchResult[];
}

export interface ResponseErrorEvent {
  type: 'error';
  content: string;
}

export interface ResponseDoneEvent {
  type: 'done';
}

export type ResponseEvent =
  | ResponseTextEvent
  | ResponseSourcesEvent
  | ResponseErrorEvent
  | ResponseDoneEvent;

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export interface Collection {
  id: string;
  name: string;
  created_at: string;
}

export interface CollectionCreateOptions {
  name: string;
}

export interface CollectionUpdateOptions {
  name: string;
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface ConversationCreateOptions {
  title?: string;
}

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

export interface Tenant {
  id: string;
  name: string;
  email: string | null;
  credit_balance_micros: number;
  is_admin: boolean;
  is_frozen: boolean;
  frozen_reason: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface AccountResponse {
  tenant: Tenant;
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export interface BillingTransaction {
  id: string;
  transaction_type: string;
  status: string;
  amount_micros: number;
  balance_after_micros: number;
  currency: string;
  source_type: string | null;
  source_id: string | null;
  description: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

export interface BillingUsageEvent {
  id: string;
  service_key: string;
  status: string;
  unit_count: number;
  unit_label: string;
  unit_price_micros: number;
  total_cost_micros: number;
  document_id: string | null;
  request_id: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

export interface BillingServiceSpend {
  service_key: string;
  total_cost_micros: number;
  total_units: number;
}

export interface BillingDailySpend {
  day: string;
  total_cost_micros: number;
  total_units: number;
  by_service: Record<string, number>;
}

export interface BillingSummaryResponse {
  balance_micros: number;
  recent_transactions: BillingTransaction[];
  recent_credit_transactions: BillingTransaction[];
  recent_usage: BillingUsageEvent[];
  spend_by_service: BillingServiceSpend[];
  daily_spend: BillingDailySpend[];
  totals: Record<string, number>;
}
