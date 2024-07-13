import { Service } from 'typedi';
import { BaseStorage } from './base';

@Service()
export class RecordsStorage extends BaseStorage {
  static readonly RECORD_MEMORY_KEY = 'RECORD_MEMORY_KEY';

  storeRecord(record: { url: string }) {
    this.appendMemory(RecordsStorage.RECORD_MEMORY_KEY, record);
  }

  getRecords() {
    return this.getMemory(RecordsStorage.RECORD_MEMORY_KEY);
  }
}
