import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { HttpClient, InfratexError } from '../http.js';
import type {
  Document,
  DocumentListOptions,
  DocumentListResponse,
  IndexCreateOptions,
  IndexResponse,
  UploadOptions,
  UploadResponse,
} from '../types.js';

export class Documents {
  private readonly pollIntervalMs = 1000;

  constructor(private readonly http: HttpClient) {}

  /**
   * Upload and parse a PDF document.
   *
   * Accepts either a file path (string) or a Buffer.
   * When passing a Buffer, provide `options.filename`.
   *
   * @example
   * ```ts
   * const doc = await client.documents.upload('/path/to/report.pdf');
   * const doc = await client.documents.upload(buffer, { filename: 'report.pdf' });
   * ```
   */
  async upload(
    file: string | Buffer,
    options?: UploadOptions,
  ): Promise<UploadResponse> {
    const form = new FormData();

    let bytes: Uint8Array<ArrayBuffer>;
    let filename: string;

    if (typeof file === 'string') {
      const data = await readFile(file);
      filename = options?.filename ?? basename(file);
      // Copy into a clean ArrayBuffer to satisfy Blob constructor types
      bytes = new Uint8Array(data.byteLength);
      bytes.set(data);
    } else {
      filename = options?.filename ?? 'upload.pdf';
      bytes = new Uint8Array(file.byteLength);
      bytes.set(file);
    }

    form.append('file', new Blob([bytes], { type: 'application/pdf' }), filename);

    if (options?.method) form.append('method', options.method);
    if (options?.pipeline) form.append('pipeline', options.pipeline);
    if (options?.collection_id) form.append('collection_id', options.collection_id);

    const created = await this.http.postMultipart<Document>('/api/v1/documents', form);
    return this.waitForUploadedDocument(created.id);
  }

  /**
   * List documents with optional filtering and pagination.
   */
  async list(options?: DocumentListOptions): Promise<DocumentListResponse> {
    return this.http.get<DocumentListResponse>('/api/v1/documents', {
      status: options?.status,
      collection_id: options?.collection_id,
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  /**
   * Get a single document by ID.
   * Markdown is fetched separately through `markdown(id)`.
   */
  async get(id: string): Promise<Document> {
    return this.http.get<Document>(`/api/v1/documents/${id}`);
  }

  /**
   * Download the extracted markdown for a document.
   */
  async markdown(id: string): Promise<string> {
    return this.http.get<string>(`/api/v1/documents/${id}/markdown`);
  }

  /**
   * Delete a document.
   */
  async delete(id: string): Promise<void> {
    await this.http.delete(`/api/v1/documents/${id}`);
  }

  /**
   * Create or rebuild an index on a parsed document.
   */
  async index(id: string, options: IndexCreateOptions): Promise<IndexResponse> {
    return this.http.post<IndexResponse>(`/api/v1/documents/${id}/indexes`, {
      method: options.method,
    });
  }

  private async waitForUploadedDocument(id: string): Promise<UploadResponse> {
    const deadline = Date.now() + this.http.timeoutMs;

    while (true) {
      const document = await this.get(id);
      if (document.status === 'done' || document.status === 'parsed' || document.status === 'indexed') {
        return {
          id: document.id,
          status: document.status,
          method: document.method,
          filename: document.filename,
          pipeline: document.pipeline,
          page_count: document.page_count,
          markdown: await this.markdown(id),
          extraction_ms: document.processing_time_ms ?? 0,
          collection_id: document.collection_id,
          extraction_pages: document.extraction_pages,
        };
      }

      if (document.status === 'error') {
        throw new InfratexError(
          document.error_message ?? 'Document processing failed',
          409,
          'document_processing_failed',
        );
      }

      if (Date.now() >= deadline) {
        throw new InfratexError('Document processing timed out', 504, 'upload_timeout');
      }

      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }
  }
}
