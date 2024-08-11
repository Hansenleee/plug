import http from 'http';
import Container, { Service } from 'typedi';
import fetch from 'node-fetch';
import { Storage } from '../storage';
import type { MockApiItem } from '../storage/mock';
import { getPath } from '../shared/request-meta';

@Service()
export class Mock {
  check(request: http.IncomingMessage) {
    const storage = Container.get(Storage);
    const mockApiList = storage.mock.getApiList();
    const pathname = getPath(request);
    const availableMockApi = mockApiList.find(
      (item) => item.enable && item.path === pathname && item.method === request.method
    );

    if (availableMockApi) {
      return availableMockApi;
    }

    return false;
  }

  async mock(mockItem: MockApiItem, request: http.IncomingMessage, response: http.ServerResponse) {
    let responseData = '';

    response.setHeader('Content-Type', 'application/json');
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'x-plug-mock-id': mockItem.id,
    });

    if (mockItem.dataType === 'url') {
      const mockFetchResult = await fetch(mockItem.mockUrl, {
        method: request.method,
        // headers: request.headers as HeadersInit,
        headers: { 'Content-Type': 'application/json' },
        body: null,
      });
      const jsonMockData = await mockFetchResult.json();

      // 临时先将返回 code 为成 0
      (jsonMockData as any).code = 0;

      responseData = JSON.stringify(jsonMockData);

      response.end(responseData);
    } else {
      responseData = JSON.stringify({
        data: 'Hello World!',
      });

      // 待实现
      response.end(responseData);
    }

    return {
      statusCode: response.statusCode,
      headers: response.getHeaders(),
      data: responseData,
    };
  }
}
