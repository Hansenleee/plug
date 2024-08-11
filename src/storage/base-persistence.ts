import { Service } from 'typedi';
import os from 'os';
import path from 'path';
import { LocalStorage } from 'node-localstorage';
import { Logger } from '../shared/log';

@Service()
export class PersistenceStorage {
  static BASE_DIR_ROOT = os.homedir();
  static BASE_STORAGE_ROOT = path.join(PersistenceStorage.BASE_DIR_ROOT, '.plug-cache', 'storage');

  private storage: LocalStorage;
  private log = new Logger('persistence');

  constructor(namespace: string) {
    this.storage = new LocalStorage(path.join(PersistenceStorage.BASE_STORAGE_ROOT, namespace));
  }

  get(key: string, defaultValue = {}) {
    try {
      const originValue = this.storage.getItem(key);

      if (!originValue) {
        return defaultValue;
      }

      return JSON.parse(originValue) || defaultValue;
    } catch (err) {
      return defaultValue;
    }
  }

  set(key: string, value: unknown) {
    this.storage.setItem(key, JSON.stringify(value));
  }

  append(key: string, value: Record<string, any>) {
    this.batchAppend(key, [value]);
  }

  batchAppend(key: string, valueList: Array<Record<string, any>>) {
    const origin = this.get(key, []);
    const mergedValue = [...origin, ...valueList];

    this.storage.setItem(key, JSON.stringify(mergedValue));

    return mergedValue;
  }

  setMap(key: string, value: Record<string, any>) {
    const origin = this.get(key, {});
    const mergedValue = { ...origin, ...value };

    try {
      this.storage.setItem(key, JSON.stringify(mergedValue));
    } catch (err) {
      this.log.warn(`持久化存储 setMap 出错: ${err}`, { force: true });
    }

    return mergedValue;
  }

  keys(): string[] {
    return this.storage._keys || [];
  }
}
