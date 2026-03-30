import { HttpClient } from '../http.js';
import type { SearchCreateOptions, SearchResponse } from '../types.js';

export class Searches {
  constructor(private readonly http: HttpClient) {}

  /**
   * Search across indexed documents.
   *
   * @example
   * ```ts
   * const results = await client.searches.create({
   *   query: 'revenue growth',
   *   method: 'vector',
   *   limit: 10,
   * });
   * ```
   */
  async create(options: SearchCreateOptions): Promise<SearchResponse> {
    return this.http.post<SearchResponse>('/api/v1/searches', {
      method: options.method ?? 'vector',
      query: options.query,
      limit: options.limit ?? 5,
      document_ids: options.document_ids,
      collection_id: options.collection_id,
    });
  }
}
