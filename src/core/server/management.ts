import Container, { Service } from 'typedi';
import Koa from 'koa';
import Router from '@koa/router';
import views from '@ladjs/koa-views';
import { Configuration } from '../../configuration';
import { Controller } from '../controller';
import path from 'path';

@Service()
export class ManagementServer {
  private app = new Koa();
  private router = new Router();

  start() {
    this.renderView();
    this.registerRouter();

    this.app.use(this.router.routes()).use(this.router.allowedMethods());
    this.app.listen(Configuration.MANAGEMENT_PORT);
  }

  private renderView() {
    const viewPath = path.join(process.cwd(), 'src/ui/build');
    const render = views(viewPath, {});

    this.app.use(render);
  }

  private registerRouter() {
    const controller = Container.get<Controller>(Controller);

    this.router.get('/api/records', controller.record.getRecords);
  }
}
