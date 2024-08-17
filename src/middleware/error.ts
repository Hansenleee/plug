import { HttpException } from '../shared/exception';
import { Logger } from '../shared/log';

const logger = new Logger('error-middleware');

export const errorMiddleware = () => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err: unknown) {
      const error = err as HttpException;

      logger.warn(error as unknown as string, { force: true });
      ctx.body = error.errorContent;
    }
  };
};
