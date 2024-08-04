import { Service } from 'typedi';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { LocalStorage } from 'node-localstorage';

@Service()
export class BaseStorage {
  static BASE_DIR_ROOT = os.homedir();
  static BASE_STORAGE_ROOR = path.join(BaseStorage.BASE_DIR_ROOT, '.plug-cache', 'storage');

  private storage!: LocalStorage;
  private memory: Record<string, any> = {};

  init() {
    if (!fs.existsSync(BaseStorage.BASE_STORAGE_ROOR)) {
      fs.mkdirSync(BaseStorage.BASE_STORAGE_ROOR, { recursive: true });
    }

    this.storage = new LocalStorage(BaseStorage.BASE_STORAGE_ROOR);
  }

  protected getMapItem(namespace: string) {
    const originValue = this.storage.getItem(namespace);

    if (!originValue) {
      return {};
    }

    return JSON.parse(originValue);
  }

  protected setMapItem(value: object, namespace: string) {
    const origin = this.getMapItem(namespace);
    const mergedValue = {
      ...origin,
      ...value,
    };

    this.storage.setItem(namespace, JSON.stringify(mergedValue));

    return mergedValue;
  }

  protected appendMemory<T = any>(key: string, ...values: T[]) {
    if (!this.memory[key]) {
      this.memory[key] = [];
    }

    this.memory[key] = this.memory[key].concat(values || []);
  }

  protected getMemory<T = any>(key: string) {
    return this.memory[key] as T;
  }
}
