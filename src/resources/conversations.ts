import { HttpClient } from '../http.js';
import { validateScope } from '../scope.js';
import type {
  Conversation,
  ConversationCreateOptions,
  ConversationDetail,
} from '../types.js';

export class Conversations {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new conversation thread.
   */
  async create(options?: ConversationCreateOptions): Promise<Conversation> {
    const scope = validateScope({
      document_ids: options?.document_ids,
      collection_id: options?.collection_id,
    });

    return this.http.post<Conversation>('/api/v1/conversations', {
      title: options?.title ?? 'New Chat',
      document_ids: scope.document_ids,
      collection_id: scope.collection_id,
    });
  }

  /**
   * List conversations (most recently updated first).
   */
  async list(options?: { limit?: number; offset?: number }): Promise<Conversation[]> {
    return this.http.get<Conversation[]>('/api/v1/conversations', {
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  /**
   * Get a conversation with its full message history.
   */
  async get(id: string): Promise<ConversationDetail> {
    return this.http.get<ConversationDetail>(`/api/v1/conversations/${id}`);
  }

  /**
   * Delete a conversation and all its messages.
   */
  async delete(id: string): Promise<void> {
    await this.http.delete(`/api/v1/conversations/${id}`);
  }
}
