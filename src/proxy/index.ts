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
  async proxy(request: http.IncomingMessage, response: http.ServerResponse, protocol: Protocol) {
    const mockCheckResult = this.mock.check(request);

    if (mockCheckResult) {
      return this.mock.mock(mockCheckResult, request, response);
    }

    return this.request.request(request, response, protocol);
  }
}
