import { Inject, Service } from 'typedi';
import { MockStorage } from './mock';
import { SystemStorage } from './system';

@Service()
export class Storage {
  @Inject()
  mock: MockStorage;

  @Inject()
  system: SystemStorage;

  init() {
    this.mock.init();
    this.system.init();
  }
}
