import { Service } from 'typedi';
import http from 'http';
import url from 'url';

@Service()
export class Proxy {
  httpHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    const { hostname, port, path } = url.parse(request.url);
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
