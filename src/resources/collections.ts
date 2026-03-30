import { HttpClient } from '../http.js';
import type {
  Collection,
  CollectionCreateOptions,
  CollectionUpdateOptions,
} from '../types.js';

export class Collections {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new collection.
   */
  async create(options: CollectionCreateOptions): Promise<Collection> {
    return this.http.post<Collection>('/api/v1/collections', {
      name: options.name,
    });
  }

  /**
   * List all collections.
   */
  async list(): Promise<Collection[]> {
    return this.http.get<Collection[]>('/api/v1/collections');
  }

  /**
   * Get a single collection by ID.
   */
  async get(id: string): Promise<Collection> {
    return this.http.get<Collection>(`/api/v1/collections/${id}`);
  }

  /**
   * Update (rename) a collection.
   */
  async update(id: string, options: CollectionUpdateOptions): Promise<Collection> {
    return this.http.patch<Collection>(`/api/v1/collections/${id}`, {
      name: options.name,
    });
  }

  /**
   * Delete a collection. Documents within it are not deleted but unlinked.
   */
  async delete(id: string): Promise<void> {
    await this.http.delete(`/api/v1/collections/${id}`);
  }
}
