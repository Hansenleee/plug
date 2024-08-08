import { Inject, Service } from 'typedi';
import { MockStorage } from './mock';

@Service()
export class Storage {
  @Inject()
  mock: MockStorage;

  init() {
    this.mock.init();
  }
}
