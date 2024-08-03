import http from 'http';
import { Service } from 'typedi';

@Service()
export class Mock {
  mock(response: http.ServerResponse) {
    response.setHeader('Content-Type', 'application/json');
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(
      JSON.stringify({
        data: 'Hello World!',
      })
    );

    return Promise.resolve({
      statusCode: response.statusCode,
      headers: response.getHeaders(),
      data: JSON.stringify({
        data: 'Hello World!',
      }),
    });
  }
}
