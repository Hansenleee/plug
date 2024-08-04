import Container, { Service } from 'typedi';
import Koa from 'koa';
import Router from '@koa/router';
import { bodyParser } from '@koa/bodyparser';
import cors from '@koa/cors';
import staticServer from 'koa-static';
import views from '@ladjs/koa-views';
import path from 'path';
import { createServer } from 'http';
import { Logger } from '../shared/log';
import { SocketIO } from '../shared/socket';
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
    this.useMiddleware();
    this.registerRouter();

    this.app.use(this.router.routes()).use(this.router.allowedMethods());

    const server = createServer(this.app.callback());
    const socketIO = Container.get(SocketIO);

    socketIO.start(server);

    server.listen(Configuration.MANAGEMENT_PORT, () => {
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
    this.router.post('/api/mock/yapi/addById', controller.yapi.addById.bind(controller.record));
  }

  private useMiddleware() {
    this.app.use(bodyParser());
    this.app.use(
      cors({
        origin: `http://localhost:${Configuration.MANAGEMENT_WEBPACK_DEV_PORT}`,
        credentials: true,
      })
    );
  }
}
