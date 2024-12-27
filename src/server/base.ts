import { Container, Service } from 'typedi';
import http from 'http';
import { Response } from 'node-fetch';
import { Controller } from '../controller';
import { Proxy } from '../proxy';
import { Logger } from '../shared/log';
import { Protocol } from '../types';

@Service()
export class BaseServer {
  protected logger!: Logger;

  constructor(private protocol: Protocol) {
    this.logger = new Logger(this.protocol);
  }

  protected async requestHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    await this.parseBodyMiddleware(request);
    await this.proxyAndRecordMiddleware(request, response);
  }

  protected closeHandler() {
    this.logger.info(`${this.protocol} server closed`);
  }

  protected errorHandler(error) {
    this.logger.info(`${this.protocol} server error occurred: ${error.message}`);
  }

  private async parseBodyMiddleware(request: http.IncomingMessage) {
    const rawBody = new Response(request, {
      headers: request.headers as Record<string, any>,
    });

    if (request.headers['content-type']?.includes('multipart/form-data')) {
      request.formData = await rawBody.formData();

      // const ext = rawBody.type;

      // console.log(22222, rawBody.body);

      // request.formData.forEach((value, key) => {
      //   console.log(666, value, key);
      // });
    } else {
      request.body = await rawBody.text();
    }
  }

  private async proxyAndRecordMiddleware(
    request: http.IncomingMessage,
    response: http.ServerResponse
  ) {
    const controller = Container.get<Controller>(Controller);
    const proxy = Container.get<Proxy>(Proxy);
    const requestId = await controller.record.saveRequestRecords(request, this.protocol);
    const proxyResponseData = await proxy.proxy(request, response, this.protocol);

    return controller.record.saveResponseRecords(proxyResponseData, {
      requestId,
    });
  }
}
