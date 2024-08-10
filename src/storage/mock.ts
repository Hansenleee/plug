import { Service } from 'typedi';
import { BaseStorage } from './base';

export interface MockApiItem {
  id: string;
  path: string;
  method: string;
  title: string;
  dataType: 'url' | 'define';
  apiType: 'default' | 'yapi' | (string & {});
  mockUrl?: string;
  enable: boolean;
}

@Service()
export class MockStorage extends BaseStorage {
  private static readonly NS = 'mock';

  // 用来存储 mock-api meta 信息的 key
  private static readonly API_META_KEY = 'api-meta';

  constructor() {
    super(MockStorage.NS);
  }

  init() {}

  setMap(key: string, item: Record<string, unknown>) {
    return this.persistence.setMap(key, item);
  }

  appendApi(item: MockApiItem) {
    return this.persistence.append(
      MockStorage.API_META_KEY,
      item as unknown as Record<string, unknown>
    );
  }

  deleteApi(id: string) {
    const apiList = this.persistence.get(MockStorage.API_META_KEY, []) as MockApiItem[];

    this.persistence.set(
      MockStorage.API_META_KEY,
      apiList.filter((item) => item.id !== id)
    );
  }

  getApiList() {
    return this.persistence.get(MockStorage.API_META_KEY, []) as MockApiItem[];
  }

  get(key: string) {
    return this.persistence.get(key);
  }
}
