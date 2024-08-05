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
  private static readonly PREFIX = 'mock-';
  private static readonly DEFAULT_NS = 'DEFAULT';

  init() {
    return this.persistence.keys().filter((key) => key.startsWith(MockStorage.PREFIX));
  }

  setItem(item: MockItem, options: SetItemOptions = {}) {
    const nameSpace = `${MockStorage.PREFIX}${options.namespace || MockStorage.DEFAULT_NS}`;

    this.persistence.set(item, nameSpace);
  }
}
