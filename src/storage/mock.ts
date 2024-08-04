import { Service } from 'typedi';
import { BaseStorage } from './base';

interface MockItem {
  title: string;
}

interface SetItemOptions {
  namespace?: string;
}

@Service()
export class MockStorage extends BaseStorage {
  private static readonly DEFAULT_NS = 'DEFAULT';

  setItem(item: MockItem, options: SetItemOptions = {}) {
    const nameSpace = `mock-${options.namespace || MockStorage.DEFAULT_NS}`;

    this.setMapItem(item, nameSpace);
  }
}
