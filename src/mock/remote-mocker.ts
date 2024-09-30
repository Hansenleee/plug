import fetch from 'node-fetch';
import { BaseMocker } from './base-mocker';
import { MockApiItem } from '../types';

export class RemoteMocker extends BaseMocker {
  static async fetchMockData(mockItem: MockApiItem, { method }) {
    const mockFetchResult = await fetch(mockItem.mockUrl, {
      method,
      // TODO: 完善下请求头信息
      headers: { 'Content-Type': 'application/json' },
      body: null,
    });
    const jsonMockData = await mockFetchResult.json();

    return jsonMockData;
  }

  async invoke() {
    this.mockData = await RemoteMocker.fetchMockData(this.mockItem, {
      method: this.request.method,
    });
  }
}
