import { Service } from 'typedi';
import { spawn } from 'child_process';
import { Logger } from '../shared/log';

@Service()
export class Orphan {
  private logger = new Logger('Orphan');

  async createOrphan(command: string, args: string[]) {
    const childProcess = spawn(command, args, {
      detached: true,
    });

    this.logger.info(`plug 启动成功 [PID: ${childProcess.pid}]`, { force: true });

    process.exit(0);
  }
}
