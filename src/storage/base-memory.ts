import { Service } from 'typedi';

@Service()
export class MemoryStorage {
  private memory: Record<string, any> = {};
}
