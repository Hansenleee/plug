import http from 'http';
import Container, { Service } from 'typedi';
import fetch from 'node-fetch';
import { Storage } from '../storage';
import { MockApiItem } from '../types';
import { getPath, getHost } from '../shared/request-meta';

@Service()
export class Mock {
  check(request: http.IncomingMessage) {
    const storage = Container.get(Storage);
    const mockHostList = storage.mock.getMemoryMockHost();
    const requestHost = getHost(request);

    if (!mockHostList.includes(requestHost)) {
      return false;
    }

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

  async fetchMockData(mockItem: MockApiItem, { method }) {
    const mockFetchResult = await fetch(mockItem.mockUrl, {
      method,
      // TODO: 完善下请求头信息
      // headers: request.headers as HeadersInit,
      headers: { 'Content-Type': 'application/json' },
      body: null,
    });
    const jsonMockData = await mockFetchResult.json();

    return jsonMockData;
  }

  fetchDefineMockData(mockItem: MockApiItem): string {
    const storage = Container.get(Storage);
    const defineMockData = storage.mock.getMockData(mockItem.id);

    return defineMockData.mockString;
  }

  async mock(mockItem: MockApiItem, request: http.IncomingMessage, response: http.ServerResponse) {
    let responseData = '';

    response.setHeader('Content-Type', 'application/json');
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'x-plug-mock-id': mockItem.id,
    });

    if (mockItem.dataType === 'url') {
      const jsonMockData = await this.fetchMockData(mockItem, { method: request.method });

      // TODO: 临时先将返回 code 为成 0
      (jsonMockData as any).code = 0;

      responseData = JSON.stringify(jsonMockData);
      response.end(responseData);
    } else if (mockItem.dataType === 'define') {
      const defineMockData = this.fetchDefineMockData(mockItem);

      responseData = defineMockData;
      response.end(defineMockData);
    } else {
      // TODO: 待完善
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
