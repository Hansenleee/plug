import { Inject, Service } from 'typedi';
import http from 'http';
import { Request } from './request';
import { Mock } from './mock';
import { Protocol } from '../types';

@Service()
export class Proxy {
  @Inject()
  private request: Request;

  @Inject()
  private mock: Mock;

  // 请求代理转发的核心入口
  proxy(request: http.IncomingMessage, response: http.ServerResponse, protocol: Protocol) {
    // if (1) {
    //   return this.mock.mock(response);
    // }

    return this.request.request(request, response, protocol);
  }
}
