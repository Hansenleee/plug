import { Service, Container } from 'typedi';
import { spawn } from 'child_process';
import { Logger } from '../shared/log';
import { Storage } from '../storage';

@Service()
export class Orphan {
  private logger = new Logger('Orphan');

  async createOrphan(command: string, args: string[]) {
    const childProcess = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
    });

    this.logger.info(`plug 启动成功 [PID: ${childProcess.pid}]`, { force: true });

    process.exit(0);
  }

  async status() {
    const storage = Container.get(Storage);
    const state = storage.runtime.getState();

    let statusText = `plug 执行状态: ${state.status}`;

    if (state.status === 'running') {
      statusText += ` [PID: ${state.pid}]`;
    }

    this.logger.info(statusText, { force: true });
  }
}
