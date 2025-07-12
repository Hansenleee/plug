import { Container, Service } from 'typedi';
import http from 'http';
import net from 'net';
import { Response } from 'node-fetch';
import { Controller } from '../controller';
import { Proxy } from '../proxy';
import { Logger } from '../shared/log';
import { RequestParser } from '../shared/request-parser';
import { Protocol } from '../types';

@Service()
export class BaseServer {
  protected logger!: Logger;

  constructor(private protocol: Protocol) {
    this.logger = new Logger(this.protocol);
  }

  protected checkPortIsUsed(port: number) {
    return new Promise((resolve, reject) => {
      const server = net
        .createServer()
        .once('error', (err: Error & { code?: string }) => {
          if (err.code === 'EADDRINUSE') {
            resolve(true);
          } else {
            reject(err);
          }
        })
        .once('listening', () => {
          server.close();
          resolve(false);
        })
        .listen(port);
    });
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

    request.parser = new RequestParser(request, this.protocol);

    if (request.headers['content-type']?.includes('multipart/form-data')) {
      request.formData = await rawBody.formData();
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
    const proxyResponseData = await proxy.proxy(request, response);

    return controller.record.saveResponseRecords(proxyResponseData, {
      requestId,
    });
  }
}
