import { Container, Service } from 'typedi';
import http from 'http';
import { Controller } from '../controller';
import { ProxyRequest } from '../proxy';

@Service()
export class BaseServer {
  protected requestHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    const controller = Container.get<Controller>(Controller);
    const proxyRequest = Container.get<ProxyRequest>(ProxyRequest);
    const requestId = controller.record.saveRequestRecords(request);

    return proxyRequest.httpsHandler(request, response).then((proxyResult) => {
      controller.record.saveResponseRecords(proxyResult, requestId);
    });
  }
}
