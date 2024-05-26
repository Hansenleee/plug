import Container, { Service } from 'typedi';
import Koa from 'koa';
import Router from '@koa/router';
import { Configuration } from '../../configuration';
import { Controller } from '../controller';

@Service()
export class ManagementServer {
  private app = new Koa();
  private router = new Router();

  start() {
    this.registerRouter();

    this.app.use(this.router.routes()).use(this.router.allowedMethods());
    this.app.listen(Configuration.MANAGEMENT_PORT);
  }

  private registerRouter() {
    const controller = Container.get<Controller>(Controller);

    this.router.get('/api/records', controller.record.getRecords);
  }
}
