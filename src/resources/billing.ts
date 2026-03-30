import { HttpClient } from '../http.js';
import type { BillingSummaryResponse } from '../types.js';

export class Billing {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get the billing summary including balance, recent transactions, usage, and spend.
   */
  async get(): Promise<BillingSummaryResponse> {
    return this.http.get<BillingSummaryResponse>('/api/v1/billing');
  }
}
