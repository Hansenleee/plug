import { Service } from 'typedi';
import os from 'os';
import path from 'path';
import { LocalStorage } from 'node-localstorage';

@Service()
export class PersistenceStorage {
  static BASE_DIR_ROOT = os.homedir();
  static BASE_STORAGE_ROOT = path.join(PersistenceStorage.BASE_DIR_ROOT, '.plug-cache', 'storage');

  private storage: LocalStorage;

  constructor(namespace: string) {
    this.storage = new LocalStorage(path.join(PersistenceStorage.BASE_STORAGE_ROOT, namespace));
  }

  get(key: string, defaultValue = {}) {
    const originValue = this.storage.getItem(key);

    if (!originValue) {
      return defaultValue;
    }

    return JSON.parse(originValue) || defaultValue;
  }

  append(key: string, value: Record<string, any>) {
    const origin = this.get(key, []);
    const mergedValue = [...origin, value];

    this.storage.setItem(key, JSON.stringify(mergedValue));

    return mergedValue;
  }

  setMap(key: string, value: Record<string, any>) {
    const origin = this.get(key, {});
    const mergedValue = { ...origin, value };

    this.storage.setItem(key, JSON.stringify(mergedValue));

    return mergedValue;
  }

  keys(): string[] {
    return this.storage._keys || [];
  }
}
