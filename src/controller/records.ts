import Container, { Service } from 'typedi';
import http from 'http';
import { nanoid } from 'nanoid';
import type { Context } from 'koa';
import { URL } from 'url';
import { BaseController } from './base';
import { RecordsStorage } from '../storage';
import { Protocol } from '../types';
import { SocketIO } from '../shared/socket';
import { getContentType } from '../shared/request-meta';

@Service()
export class RecordController extends BaseController {
  saveRequestRecords(request: http.IncomingMessage, protocol: Protocol) {
    const id = nanoid();
    const socket = Container.get(SocketIO);
    const pathname = request.url.startsWith('/') ? request.url : new URL(request.url).pathname;

    socket.emit('PROXY_REQUEST_RECORD', {
      id,
      url: `${protocol}://${request.headers.host}${pathname}`,
      method: request.method,
      requestHeaders: request.headers,
      startTime: Date.now(),
      status: 'pending',
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
      endTime: Date.now(),
      size: response.headers['content-length'],
      type: getContentType(response.headers['content-type']),
      responseHeader: response.headers,
    });
  }

  getRecords(ctx: Context) {
    const recordsStorage = Container.get<RecordsStorage>(RecordsStorage);
    const records = recordsStorage.getRecords();

    ctx.body = this.success(records);
  }
}
