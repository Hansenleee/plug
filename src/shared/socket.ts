import { Service } from 'typedi';
import { Server } from 'socket.io';
import http from 'http';
import { Configuration } from '../configuration';
import { Logger } from './log';

const logger = new Logger('socket');

@Service()
export class SocketIO {
  static readonly NS = 'PLUG_SOCKET';

  private io?: Server;

  start(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: `http://localhost:(${Configuration.MANAGEMENT_WEBPACK_DEV_PORT}|${Configuration.MANAGEMENT_PORT})`,
      },
    });

    this.io.on('connect', (socket) => {
      logger.info(`socket[${socket.id}] 连接已建立`);
    });

    this.io.on('disconnect', (reason) => {
      logger.info(`socket 连接已关闭: ${reason}`);
    });
  }

  emit(event: string, payload: unknown) {
    if (this.io) {
      this.io.emit(SocketIO.NS, {
        name: event,
        payload: [payload],
      });
    }
  }
}
