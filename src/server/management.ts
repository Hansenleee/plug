import Container, { Service } from 'typedi';
import Koa from 'koa';
import Router from '@koa/router';
import staticServer from 'koa-static';
import views from '@ladjs/koa-views';
import path from 'path';
import { Logger } from '../shared/log';
import { Configuration } from '../configuration';
import { Controller } from '../controller';

const logger = new Logger('management');

@Service()
export class ManagementServer {
  private app = new Koa();
  private router = new Router();

  start() {
    this.renderStatic();
    this.renderView();
    this.registerRouter();

    this.app.use(this.router.routes()).use(this.router.allowedMethods());
    this.app.listen(Configuration.MANAGEMENT_PORT, () => {
      logger.info(`management server start at ${Configuration.MANAGEMENT_PORT}`);
    });
  }

  private renderView() {
    const viewPath = path.join(process.cwd(), 'ui/build');
    const render = views(viewPath, {
      extension: 'html',
    });

    this.app.use(render).use((ctx, next) => {
      if (ctx.url.startsWith('/management')) {
        return ctx.render('./index');
      }

      return next();
    });
  }

  private renderStatic() {
    const staticPath = path.join(process.cwd(), 'ui/build');

    this.app.use(staticServer(staticPath));
  }

  private registerRouter() {
    const controller = Container.get<Controller>(Controller);

    this.router.get('/api/records', controller.record.getRecords.bind(controller.record));
  }
}
