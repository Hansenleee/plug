import { Service } from 'typedi';
import { BaseStorage } from './base';

interface RuntimeState {
  status: 'stopped' | 'starting' | 'running';
  pid?: number;
}

@Service()
export class RuntimeStorage extends BaseStorage {
  private static readonly NS = 'runtime';
  private static readonly STATE_KEY = 'state';

  constructor() {
    super(RuntimeStorage.NS);
  }

  getState(): Partial<RuntimeState> {
    return this.persistence.get(RuntimeStorage.STATE_KEY, {});
  }

  changeState(state: Partial<RuntimeState>) {
    this.persistence.setMap(RuntimeStorage.STATE_KEY, state);
  }
}
