import Container, { Service } from 'typedi';
import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import staticServer from 'koa-static';
import views from '@ladjs/koa-views';
import { useContainer as UC, useKoaServer as UKS } from 'routing-controllers/esm2015';
import { createServer, Server } from 'http';
import path from 'path';
import { execSync } from 'child_process';
import { errorMiddleware } from '../middleware/error';
import { Logger } from '../shared/log';
import { SocketIO } from '../shared/socket';
import { isDarwin } from '../shared/platform';
import { RequestParser } from '../shared/request-parser';
import { Configuration, PlugSource } from '../configuration';
import { Mock } from '../mock';

UC(Container);

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

    this.startSocketIO(server);

    server.listen(Configuration.MANAGEMENT_PORT, () => {
      logger.info(
        `management server start at ${Configuration.MANAGEMENT_PORT}, You can now view at: http://localhost:${Configuration.MANAGEMENT_PORT}/management`,
        { force: true }
      );

      if (
        process.env.NODE_ENV !== 'dev' &&
        process.env.PLUG_SOURCE !== PlugSource.APP &&
        isDarwin()
      ) {
        execSync(`osascript open "http://localhost:${Configuration.MANAGEMENT_PORT}/management"`, {
          cwd: path.join(__dirname, '..'),
          stdio: 'ignore',
        });
      }
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
    UKS(this.app, {
      routePrefix: '/api',
      validation: false,
      defaultErrorHandler: false,
    });
  }

  private startSocketIO(server: Server) {
    const socketIO = Container.get(SocketIO);

    socketIO.start(server);
    socketIO.on('MOCK_LLM_START', ({ mockItem, requestParams }, { socketId }) => {
      const mockServer = Container.get(Mock);

      mockServer.invoke(
        mockItem,
        RequestParser.create({
          url: `http://localhost:${Configuration.MANAGEMENT_PORT}/mock`,
          method: 'POST',
          body: requestParams || {},
          protocol: 'http',
          host: '',
        }),
        {
          stream: true,
          mockType: 'intelligent',
          socketId,
        }
      );
    });
  }

  private useMiddleware() {
    this.app.use(errorMiddleware());
    this.app.use(
      cors({
        origin: `http://localhost:${Configuration.MANAGEMENT_WEBPACK_DEV_PORT}`,
        credentials: true,
      })
    );
  }
}
