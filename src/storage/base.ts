import { Inject, Service } from 'typedi';
import { PersistenceStorage } from './base-persistence';
import { MemoryStorage } from './base-memory';

@Service()
export class BaseStorage {
  @Inject()
  protected persistence: PersistenceStorage;

  @Inject()
  protected memory: MemoryStorage;

  init() {}
}
