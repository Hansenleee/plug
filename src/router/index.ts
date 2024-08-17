import { Inject, Service } from 'typedi';
import Router from '@koa/router';
import { YapiRouter } from './yapi';
import { BaseRouter } from './base';

@Service()
export class Routers {
  static readonly prefix = '/api';

  @Inject()
  yapi: YapiRouter;

  registry(koaRouter: Router) {
    const routersList: BaseRouter[] = [this.yapi];

    routersList.forEach((routerInstance) => {
      routerInstance.routers.forEach(([path, method, controller]) => {
        const fullPath = `${Routers.prefix}${routerInstance.prefix}${path}`;

        koaRouter[method as string](
          fullPath,
          (controller as Function).bind(routerInstance.controller)
        );
      });
    });
  }
}
