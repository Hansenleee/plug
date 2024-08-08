import { Service } from 'typedi';
import { BaseStorage } from './base';

interface MockApiItem {
  id: string;
  path: string;
  method: string;
  title: string;
  resBody: string;
  enable: boolean;
}

@Service()
export class MockStorage extends BaseStorage {
  private static readonly NS = 'mock';

  // 单独用来存储 api 接口的
  private static readonly API_PREFIX = 'api-';

  constructor() {
    super(MockStorage.NS);
  }

  init() {
    const totalPath = this.persistence
      .keys()
      .filter((key) => key.startsWith(MockStorage.API_PREFIX))
      .reduce((total, key) => {
        const value = this.persistence.get(key) || [];
        const valuePathList = value
          .filter((valueItem) => valueItem.enable)
          .map((valueItem) => valueItem.path);

        return [...total, ...valuePathList];
      }, []);

    this.memory.set('allPath', totalPath);
  }

  setMap(key: string, item: Record<string, unknown>) {
    return this.persistence.setMap(key, item);
  }

  appendApi(key: string, item: MockApiItem) {
    return this.persistence.append(
      `${MockStorage.API_PREFIX}${key}`,
      item as unknown as Record<string, unknown>
    );
  }

  getItem(key: string) {
    return this.persistence.get(key);
  }
}
