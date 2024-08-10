import { HttpException } from '../shared/exception';

export const errorMiddleware = () => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err: unknown) {
      const error = err as HttpException;

      ctx.body = error.errorConent;
    }
  };
};
