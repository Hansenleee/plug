import { Inject, Service } from 'typedi';
import { BaseStorage } from './base';
import { MockStorage } from './mock';

@Service()
export class Storage extends BaseStorage {
  @Inject()
  mock: MockStorage;

  init() {
    super.init();
  }
}
