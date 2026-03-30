import { HttpClient } from '../http.js';
import type { ResponseCreateOptions, ResponseEvent } from '../types.js';

/**
 * Async-iterable SSE stream that yields `ResponseEvent` objects.
 *
 * Usage:
 * ```ts
 * const stream = await client.responses.create({ message: 'summarize', method: 'vector' });
 * for await (const event of stream) {
 *   if (event.type === 'text') process.stdout.write(event.content);
 * }
 * ```
 */
export class ResponseStream implements AsyncIterable<ResponseEvent> {
  private readonly response: Response;

  constructor(response: Response) {
    this.response = response;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<ResponseEvent> {
    const body = this.response.body;
    if (!body) return;

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines
        const lines = buffer.split('\n');
        // Keep the last (potentially incomplete) line in the buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const json = trimmed.slice(6); // strip `data: `
          try {
            const event = JSON.parse(json) as ResponseEvent;
            yield event;
            if (event.type === 'done') return;
          } catch {
            // skip malformed JSON lines
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim().startsWith('data: ')) {
        const json = buffer.trim().slice(6);
        try {
          const event = JSON.parse(json) as ResponseEvent;
          yield event;
        } catch {
          // skip
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export class Responses {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create an AI response that streams back via SSE.
   *
   * Returns a `ResponseStream` which is an async iterable of events.
   */
  async create(options: ResponseCreateOptions): Promise<ResponseStream> {
    const body: Record<string, unknown> = {
      method: options.method ?? 'vector',
      model: options.model ?? 'fast',
      message: options.message,
      limit: options.limit ?? 5,
    };
    if (options.reasoning) body.reasoning = true;
    if (options.document_ids) body.document_ids = options.document_ids;
    if (options.collection_id) body.collection_id = options.collection_id;
    if (options.conversation_id) body.conversation_id = options.conversation_id;

    const res = await this.http.postStream('/api/v1/responses', body);

    return new ResponseStream(res);
  }
}
