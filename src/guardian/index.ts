import { Service, Inject } from 'typedi';
import { OTA } from './ota';
import { Logger } from '../shared/log';

const logger = new Logger('guardian');

@Service()
export class Guardian {
  @Inject()
  ota: OTA;

  start() {
    this.exceptionGuardian();
    this.ota.checkAndUpgrade();
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
