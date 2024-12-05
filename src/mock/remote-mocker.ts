import fetch from 'node-fetch';
import { BaseMocker } from './base-mocker';

export class RemoteMocker extends BaseMocker {
  static async fetchMockData(mockUrl: string, { method, body }: { method: string; body?: any }) {
    const mockFetchResult = await fetch(mockUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const jsonMockData = await mockFetchResult.json();

    return jsonMockData;
  }

  async invoke() {
    const requestSearch = this.request.url.split('?')?.[1] || '';
    const searchString = requestSearch ? `?${requestSearch}` : '';

    this.mockData = await RemoteMocker.fetchMockData(`${this.mockItem.mockUrl}${searchString}`, {
      method: this.request.method,
      body: this.request.body,
    });
  }
}
