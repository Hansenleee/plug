import { Service, Container } from 'typedi';
import { spawn, execSync } from 'child_process';
import ora from 'ora';
import { Logger } from '../shared/log';
import { isDarwin } from '../shared/platform';
import { Storage } from '../storage';
import { Exception } from './exception';

@Service()
export class Permanent {
  private spinner = ora();
  private logger = new Logger('Permanent');

  async createOrphan(command: string, args: string[]) {
    this.spinner.start('启动中...');

    const childProcess = spawn(command, args, {
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    });

    childProcess.on('message', (payload: { type: string; data: string; extra: unknown }) => {
      const { type, data, extra } = payload || {};

      if (type === 'lifeCycle') {
        if (data === 'afterStart') {
          const successMessage = `plug 启动成功 [PID: ${childProcess.pid}]`;

          this.spinner.succeed(successMessage);
          this.logger.info(successMessage);

          process.exit(0);
        }

        if (data === 'startFail' && extra === Exception.REPEAT_EXIT_CODE) {
          const successMessage = `plug 已经在运行中 [PID: ${childProcess.pid}]， 请先停止后再启动`;

          this.spinner.fail(successMessage);
          this.logger.info(successMessage);

          process.exit(0);
        }
      }
    });

    childProcess.unref();
  }
}

@Service()
export class Orphan {
  private logger = new Logger('Orphan');

  async status() {
    const storage = Container.get(Storage);
    const state = storage.runtime.getState();

    let statusText = `plug 执行状态: ${state.status}`;

    if (state.status === 'running') {
      statusText += ` [PID: ${state.pid}]`;

      if (isDarwin()) {
        try {
          const topResult = execSync(
            `top -pid ${state.pid} -l 1  | tail -n 1 | awk '{print $3,$8}'`,
            {
              encoding: 'utf-8',
            }
          );
          const [cpuUsage = '0.0', memoUsage = 0] = topResult.replace('\n', '').split(' ');

          statusText += ` [CPU: ${cpuUsage}%, MEMO: ${memoUsage}]`;
        } catch (error) {
          /* empty */
        }
      }
    }

    this.logger.info(statusText, { force: true });
  }

  afterStart() {
    this.emitMessage({
      type: 'lifeCycle',
      data: 'afterStart',
    });
  }

  startFail(exception: number) {
    this.emitMessage({
      type: 'lifeCycle',
      data: 'startFail',
      extra: exception,
    });
  }

  private emitMessage(message: Record<string, any>) {
    if (typeof process.send === 'function') {
      process.send(message);
    }
  }
}
