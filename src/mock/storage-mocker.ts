import Container from 'typedi';
import { Storage } from '../storage';
import { BaseMocker } from './base-mocker';

export class StorageMocker extends BaseMocker {
  async invoke() {
    this.mockData = this.fetchDefineMockData();
  }

  private fetchDefineMockData() {
    const storage = Container.get(Storage);
    const defineMockData = storage.mock.getMockData(this.mockItem.id);

    try {
      return JSON.parse(defineMockData.mockString);
    } catch (_) {
      return defineMockData.mockString;
    }
  }
}
