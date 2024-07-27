import { Container, Service } from 'typedi';
import http from 'http';
import { Controller } from '../controller';
import { ProxyRequest } from '../proxy';
import { Logger } from '../shared/log';
import { Protocol } from '../types';

@Service()
export class BaseServer {
  protected logger!: Logger;

  constructor(private protocol: Protocol) {
    this.logger = new Logger(this.protocol);
  }

  protected requestHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    const controller = Container.get<Controller>(Controller);
    const proxyRequest = Container.get<ProxyRequest>(ProxyRequest);
    const requestId = controller.record.saveRequestRecords(request, this.protocol);

    const proxyHandler =
      this.protocol === 'http'
        ? proxyRequest.httpHandler.bind(proxyRequest)
        : proxyRequest.httpsHandler.bind(proxyRequest);

    return proxyHandler(request, response).then((proxyResult) => {
      controller.record.saveResponseRecords(proxyResult, requestId);
    });
  }

  protected closeHandler() {
    this.logger.info(`${this.protocol} server closed`);
  }

  protected errorHandler(error) {
    this.logger.info(`${this.protocol} server error occured: ${error.message}`);
  }
}
