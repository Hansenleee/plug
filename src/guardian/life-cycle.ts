import Container, { Service } from 'typedi';
import { execSync } from 'child_process';
import { Exception } from './exception';
import { Storage } from '../storage';
import { Logger } from '../shared/log';

@Service()
export class LifeCycle {
  private logger = new Logger('LifeCycle');

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

    storage.runtime.changeState({ status: 'stopped' });

    if (state.pid === process.pid) {
      process.exit(Exception.MANUAL_EXIT_CODE);
    }

    try {
      execSync(`kill -9 ${state.pid}`);

      this.logger.info(`plug【PID: ${state.pid}】已停止运行`, { force: true });
    } catch (err) {
      this.logger.info(`plug【PID: ${state.pid}】已停止运行`, { force: true });
    }
  }
}
