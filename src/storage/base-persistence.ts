import { Service } from 'typedi';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { LocalStorage } from 'node-localstorage';

@Service()
export class PersistenceStorage {
  static BASE_DIR_ROOT = os.homedir();
  static BASE_STORAGE_ROOT = path.join(PersistenceStorage.BASE_DIR_ROOT, '.plug-cache', 'storage');

  private storage!: LocalStorage;

  init() {
    if (!fs.existsSync(PersistenceStorage.BASE_STORAGE_ROOT)) {
      fs.mkdirSync(PersistenceStorage.BASE_STORAGE_ROOT, { recursive: true });
    }

    this.storage = new LocalStorage(PersistenceStorage.BASE_STORAGE_ROOT);
  }

  get(namespace: string) {
    const originValue = this.storage.getItem(namespace);

    if (!originValue) {
      return {};
    }

    return JSON.parse(originValue) || {};
  }

  set(value: object, namespace: string) {
    const origin = this.get(namespace);
    const mergedValue = {
      ...origin,
      ...value,
    };

    this.storage.setItem(namespace, JSON.stringify(mergedValue));

    return mergedValue;
  }

  keys(): string[] {
    return this.storage._keys || [];
  }
}
