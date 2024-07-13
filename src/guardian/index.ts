import { Service } from 'typedi';
import { Logger } from '../shared/log';

const logger = new Logger('guardian');

@Service()
export class Guardian {
  start() {
    this.exceptionGuardian();
  }

  private exceptionGuardian() {
    process.on('uncaughtException', (error) => {
      logger.warn(`uncaughtException: ${error.message}, ${error.stack}`);
    });

    process.on('unhandledRejection', (error) => {
      logger.warn(`unhandledRejection: ${error}`);
    });
  }
}
