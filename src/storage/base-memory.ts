import { Service } from 'typedi';

@Service()
export class MemoryStorage {
  private memory: Record<string, any> = {};

  set(key: string, value: unknown) {
    this.memory[key] = value;
  }

  get(key: string) {
    return this.memory[key];
  }
}
