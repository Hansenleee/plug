import Container, { Service } from 'typedi';
import http from 'http';
import { nanoid } from 'nanoid';
import type { Context } from 'koa';
import { URL } from 'url';
import { BaseController } from './base';
import { RecordsStorage } from '../storage';
import { Protocol } from '../types';
import { SocketIO } from '../shared/socket';
import { getContentType, getRequestParams } from '../shared/request-meta';

@Service()
export class RecordController extends BaseController {
  async saveRequestRecords(request: http.IncomingMessage, protocol: Protocol) {
    const id = nanoid();
    const socket = Container.get(SocketIO);
    const pathname = request.url.startsWith('/') ? request.url : new URL(request.url).pathname;
    const url = `${protocol}://${request.headers.host}${pathname}`;
    const params = await getRequestParams(request, url);

    socket.emit('PROXY_REQUEST_RECORD', {
      id,
      url,
      method: request.method,
      requestHeaders: request.headers,
      startTime: Date.now(),
      status: 'pending',
      params,
    });

    return id;
  }

  saveResponseRecords(response: http.IncomingMessage, { requestId, responseData }) {
    if (!requestId) {
      return;
    }

    const socket = Container.get(SocketIO);

    socket.emit('PROXY_RESPONSE_RECORD', {
      id: requestId,
      status: response.statusCode,
      endTime: Date.now(),
      size: response.headers['content-length'],
      type: getContentType(response.headers['content-type']),
      responseHeader: response.headers,
      responseData,
    });
  }

  getRecords(ctx: Context) {
    const recordsStorage = Container.get<RecordsStorage>(RecordsStorage);
    const records = recordsStorage.getRecords();

    ctx.body = this.success(records);
  }
}
