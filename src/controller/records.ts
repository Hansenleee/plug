import Container, { Service } from 'typedi';
import http from 'http';
import { nanoid } from 'nanoid';
import { URL } from 'url';
import { BaseController } from './base';
import { Protocol, ResponseDataInfo } from '../types';
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
      origin: `${protocol}://${request.headers.host}`,
      path: pathname,
      method: request.method,
      requestHeaders: request.headers,
      startTime: Date.now(),
      status: 'pending',
      params,
    });

    return id;
  }

  saveResponseRecords(response: ResponseDataInfo, { requestId }) {
    if (!requestId) {
      return;
    }

    const socket = Container.get(SocketIO);

    socket.emit('PROXY_RESPONSE_RECORD', {
      id: requestId,
      status: response.statusCode,
      endTime: Date.now(),
      size: response.headers['content-length'],
      type: getContentType(response.headers['content-type'] as string),
      responseHeader: response.headers,
      responseData: response.data,
    });
  }
}
