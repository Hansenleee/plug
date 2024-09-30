import Container, { Service } from 'typedi';
import { execSync } from 'child_process';
import { Exception } from './exception';
import { Storage } from '../storage';

@Service()
export class LifeCycle {
  beforeStart() {}

  start() {
    const storage = Container.get(Storage);
    const runtimeState = storage.runtime.getState();

    if (runtimeState.status && runtimeState.status !== 'stopped') {
      process.exit(Exception.REPEAT_EXIT_CODE);
    }

    storage.runtime.changeState({ status: 'starting' });
  }

  afterStart() {
    const storage = Container.get(Storage);

    storage.runtime.changeState({ status: 'running', pid: process.pid });
  }

  stop() {
    const storage = Container.get(Storage);
    const state = storage.runtime.getState();

    if (state.pid === process.pid) {
      process.exit(Exception.MANUAL_EXIT_CODE);
    }

    execSync(`kill ${state.pid}`);
  }
}
