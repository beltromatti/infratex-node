import { HttpClient } from '../http.js';
import type { AccountResponse } from '../types.js';

export class Account {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get the current account (tenant) details.
   */
  async get(): Promise<AccountResponse> {
    return this.http.get<AccountResponse>('/api/v1/account');
  }
}
