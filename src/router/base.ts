import { BaseController } from '../controller/base';
import Koa from 'koa';

export type RoutersType = Array<[string, 'post' | 'get', (ctx: Koa.Context) => Promise<void>]>;

export abstract class BaseRouter {
  readonly prefix: string;
  readonly controller: BaseController;

  routers: RoutersType;
}
