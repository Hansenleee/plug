import Container, { Service } from 'typedi';
import { Logger } from '../shared/log';
import { Storage } from '../storage';

const logger = new Logger('event');

@Service()
export class Exception {
  static readonly REPEAT_EXIT_CODE = -1000;
  static readonly MANUAL_EXIT_CODE = -2000;
  static readonly OTHER_EXIT_CODE = -3000;

  beforeStart() {
    process.on('uncaughtException', (error) => {
      logger.warn(`uncaughtException: ${error.message}, ${error.stack}`);
    });

    process.on('unhandledRejection', (error) => {
      logger.warn(`unhandledRejection: ${error}`);
    });

    process.on('exit', (code) => {
      if (code === Exception.REPEAT_EXIT_CODE) {
        logger.warn('程序已启动，请勿重复启动');

        return;
      }

      if (code === Exception.MANUAL_EXIT_CODE) {
        logger.info('程序已手动退出', { force: true });
      } else {
        logger.info('程序异常退出', { force: true });
      }

      const storage = Container.get(Storage);

      storage.runtime.changeState({ status: 'stopped' });
    });

    process.on('SIGINT', () => {
      process.exit(Exception.OTHER_EXIT_CODE);
    });

    process.on('SIGTERM', () => {
      process.exit(Exception.OTHER_EXIT_CODE);
    });
  }
}
