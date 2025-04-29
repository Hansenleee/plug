import { Inject, Service } from 'typedi';
import fs from 'fs';
import { MockStorage } from './mock';
import { SystemStorage } from './system';
import { RuntimeStorage } from './runtime';
import { ProxyStorage } from './proxy';
import { PersistenceStorage } from './base-persistence';

@Service()
export class Storage {
  @Inject()
  mock: MockStorage;

  @Inject()
  system: SystemStorage;

  @Inject()
  runtime: RuntimeStorage;

  @Inject()
  proxy: ProxyStorage;

  init() {
    this.mock.init();
    this.system.init();
  }

  clear() {
    fs.rmSync(PersistenceStorage.BASE_STORAGE_ROOT, { recursive: true });
  }
}
