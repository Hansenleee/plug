import { Service, Container } from 'typedi';
import { spawn, execSync } from 'child_process';
import ora from 'ora';
import { Logger } from '../shared/log';
import { isDarwin } from '../shared/platform';
import { Storage } from '../storage';
import { Exception } from './exception';
import { PlugSource } from '../configuration';

interface MessageType {
  type: 'lifeCycle' | 'error';
  data: 'afterStart' | 'startFail';
  extra?: any;
}

@Service()
export class Permanent {
  private spinner = ora();
  private logger = new Logger('Permanent');

  async createOrphan(command: string, args: string[]) {
    this.spinner.start('启动中...\n\n');

    const childProcess = spawn(command, args, {
      detached: true,
      env: {
        // 这里的 PATH 一定要加，有以下两个原因：
        // 1、通过 spawn 创建的子进程不会继承父进程的环境变量，
        // 2、通过 nvm 安装的 node，其 npm 指令不在 PATH 中
        PATH: process.env.PATH,
        PLUG_SOURCE: PlugSource.ORPHAN,
      },
    });

    childProcess.stdout.on('data', (message) => {
      let dataParse: MessageType | string;

      try {
        dataParse = JSON.parse(message.toString());
      } catch (error) {
        dataParse = message.toString();
      }

      if (typeof dataParse === 'string') {
        global.console.log(dataParse);
        return;
      }

      const { type, data, extra } = dataParse || {};

      if (type === 'lifeCycle') {
        if (data === 'afterStart') {
          const successMessage = `plug 启动成功 [PID: ${childProcess.pid}]\n\n`;

          this.spinner.succeed(successMessage);
          this.logger.info(successMessage);

          this.stop();
        }

        if (data === 'startFail' && extra === Exception.REPEAT_EXIT_CODE) {
          const successMessage = `plug 已经在运行中 [PID: ${childProcess.pid}]， 请先停止后再启动`;

          this.spinner.fail(successMessage);
          this.logger.info(successMessage);

          this.stop();
        }
      }
    });

    childProcess.unref();
  }

  private stop() {
    setTimeout(() => process.exit(0), 200);
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

  private emitMessage(message: MessageType) {
    if (
      typeof process.stdout.write === 'function' &&
      process.env.PLUG_SOURCE === PlugSource.ORPHAN
    ) {
      try {
        process.stdout.write(JSON.stringify(message));
      } catch (error) {
        process.stdout.write(JSON.stringify({ type: 'error', data: '通信数据序列化失败' }));
      }
    }
  }
}
