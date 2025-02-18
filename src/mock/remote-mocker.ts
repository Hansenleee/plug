import fetch from 'node-fetch';
import { BaseMocker } from './base-mocker';

export class RemoteMocker extends BaseMocker {
  static async fetchMockData(mockUrl: string, { method, body }: { method: string; body?: any }) {
    const mockFetchResult = await fetch(mockUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const stringMockData = await mockFetchResult.text();
    let jsonMockData = {};

    try {
      jsonMockData = JSON.parse(stringMockData);
      // eslint-disable-next-line no-empty
    } catch (_) {}

    return {
      text: stringMockData,
      json: jsonMockData,
    };
  }

  async invoke() {
    this.mockData = (
      await RemoteMocker.fetchMockData(
        `${this.mockItem.mockUrl}${this.requestParser.completeUrl.search}`,
        {
          method: this.requestParser.method,
          body: this.requestParser.body,
        }
      )
    ).json;
  }
}
