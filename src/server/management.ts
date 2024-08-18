import Container, { Service } from 'typedi';
import Koa from 'koa';
import Router from '@koa/router';
import { bodyParser } from '@koa/bodyparser';
import cors from '@koa/cors';
import staticServer from 'koa-static';
import views from '@ladjs/koa-views';
import { createServer } from 'http';
import { execSync } from 'child_process';
import { errorMiddleware } from '../middleware/error';
import { Logger } from '../shared/log';
import { SocketIO } from '../shared/socket';
import { Configuration } from '../configuration';
import { Routers } from '../router';

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

      execSync(`osascript open "http://localhost:${Configuration.MANAGEMENT_PORT}/management"`, {
        cwd: process.cwd(),
        stdio: 'ignore',
      });
    });
  }

  private renderView() {
    const render = views(Configuration.UI_BUILD_DIR, {
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
    this.app.use(staticServer(Configuration.UI_BUILD_DIR));
  }

  private registerRouter() {
    const routers = Container.get(Routers);

    routers.registry(this.router);
  }

  private useMiddleware() {
    this.app.use(errorMiddleware());
    this.app.use(bodyParser());
    this.app.use(
      cors({
        origin: `http://localhost:${Configuration.MANAGEMENT_WEBPACK_DEV_PORT}`,
        credentials: true,
      })
    );
  }
}
