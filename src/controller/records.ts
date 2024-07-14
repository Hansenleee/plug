import Container, { Service } from 'typedi';
import http from 'http';
import { nanoid } from 'nanoid';
import type { Context } from 'koa';
import { BaseController } from './base';
import { RecordsStorage } from '../storage';
import { SocketIO } from '../shared/socket';

@Service()
export class RecordController extends BaseController {
  saveRequestRecords(request: http.IncomingMessage) {
    const id = nanoid();
    const socket = Container.get(SocketIO);

    socket.emit('PROXY_REQUEST_RECORD', {
      id,
      url: request.url,
      method: request.method,
      headers: request.headers,
      startTime: request.headers.date || Date.now(),
    });

    return id;
  }

  saveResponseRecords(response: http.IncomingMessage, id: string) {
    if (!id) {
      return;
    }

    const socket = Container.get(SocketIO);

    socket.emit('PROXY_RESPONSE_RECORD', {
      id,
      status: response.statusCode,
      endTime: response.headers.date,
      size: response.headers['content-length'],
    });
  }

  getRecords(ctx: Context) {
    const recordsStorage = Container.get<RecordsStorage>(RecordsStorage);
    const records = recordsStorage.getRecords();

    ctx.body = this.success(records);
  }
}
