import { Service } from 'typedi';
import { Server, Socket } from 'socket.io';
import http from 'http';
import { Configuration } from '../configuration';
import { Logger } from './log';

type ListenFun = (args: any, options: { socketId: string }) => void;

const logger = new Logger('socket');

@Service()
export class SocketIO {
  static readonly NS = 'PLUG_SOCKET';

  private io?: Server;
  // 目前仅支持同时一个 socket 连接的形式
  private socket?: Socket;
  private handlerMap: Record<string, ListenFun[]> = {};

  start(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: `http://localhost:(${Configuration.MANAGEMENT_WEBPACK_DEV_PORT}|${Configuration.MANAGEMENT_PORT})`,
      },
    });

    this.io.on('connect', (socket) => {
      logger.info(`socket[${socket.id}] 连接已建立`);
      this.socket = socket;

      socket.on(SocketIO.NS, ({ name, payload }) => {
        const handlerList = this.handlerMap[name] || [];

        handlerList.forEach((handler) => {
          try {
            handler(payload, { socketId: socket.id });
          } catch (_err) {
            // 不处理事件报错
          }
        });
      });

      socket.on('disconnect', () => {
        this.socket = undefined;
      });
    });

    this.io.on('disconnect', (reason) => {
      logger.info(`socket 连接已关闭: ${reason}`);
    });
  }

  emit(event: string, payload: unknown, options: { socketId?: string } = {}) {
    if (
      this.socket &&
      this.socket.connected &&
      (!options.socketId || options.socketId === this.socket.id)
    ) {
      this.socket.emit(SocketIO.NS, {
        name: event,
        payload: [payload],
      });
    }
  }

  // 默认监听 SocketIO.NS 事件
  on(event: string, handler: ListenFun) {
    this.handlerMap[event] = this.handlerMap[event] || [];
    this.handlerMap[event].push(handler);
  }
}
