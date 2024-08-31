import { Inject, Service } from 'typedi';
import { Storage } from '../storage';
import { MockApiItem } from '../types';

type AsyncFN = () => Promise<void>;
type MockFn = (mockData: any, config: Pick<MockApiItem, 'dataType'>) => Promise<any>;

@Service({ transient: true })
export class PluginApp {
  @Inject()
  storage: Storage;

  startQueue: AsyncFN[] = [];
  mockQueue: MockFn[] = [];

  afterStart(fn: AsyncFN) {
    this.startQueue.push(fn);
  }

  defineMock(fn: MockFn) {
    this.mockQueue.push(fn);
  }
}
