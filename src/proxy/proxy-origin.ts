import { Service } from 'typedi';
import http from 'http';
import { Logger } from '../shared/log';
import { RequestHelper } from './request-helper';

const log = new Logger('proxy-origin');

@Service()
export class ProxyOrigin {
  proxy(request: http.IncomingMessage, response: http.ServerResponse) {
    const requestHelper = new RequestHelper(request, response, {
      parser: request.parser,
      extraResHeader: {
        'x-plug-proxy': 'true',
      },
    });

    requestHelper
      .on('beforeRequest', () => {
        log.info(`代理请求 ${request.parser.completeUrl.pathname} 准备代理到原地址`);
      })
      .on('errorRequest', (error) => {
        log.warn(`代理请求 ${request.parser.completeUrl.pathname} 转发异常: ${error.message}`, {
          force: true,
        });
      });

    return requestHelper.invokeRequest();
  }
}
