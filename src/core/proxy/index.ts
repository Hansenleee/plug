import { Service } from 'typedi';
import http from 'http';
import url from 'url';
import { Logger } from '../shared/log';
// import httpProxy from 'http-proxy';

// const proxy = httpProxy.createProxyServer();

const log = new Logger('http-proxy');

@Service()
export class Proxy {
  httpHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    const { hostname, port, path } = url.parse(request.url);

    // proxy.web(request, response, {
    //   target: `http:${hostname}`,
    // });
    log.info(`origin request url ${request.url}`);

    const proxyToOriginRequest = http.request(
      {
        hostname,
        port,
        path,
        method: request.method,
        headers: request.headers,
      },
      (proxyRes) => {
        response.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(response);
      }
    );

    request.pipe(proxyToOriginRequest);
  }
}
