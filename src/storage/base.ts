import { Inject, Service } from 'typedi';
import { PersistenceStorage } from './base-persistence';
import { MemoryStorage } from './base-memory';

@Service()
export class BaseStorage {
  protected persistence: PersistenceStorage;

  @Inject()
  protected memory: MemoryStorage;

  constructor(namespace: string) {
    this.persistence = new PersistenceStorage(namespace);
  }
}
