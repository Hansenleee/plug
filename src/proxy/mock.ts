import http from 'http';
import Container, { Service } from 'typedi';
import fetch from 'node-fetch';
import { Storage } from '../storage';
import { MockApiItem } from '../types';
import { RootPlugin } from '../plugins';
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

    try {
      return JSON.parse(defineMockData.mockString);
    } catch (_) {
      return defineMockData.mockString;
    }
  }

  async mock(mockItem: MockApiItem, request: http.IncomingMessage, response: http.ServerResponse) {
    let responseData;

    if (mockItem.dataType === 'url') {
      responseData = await this.fetchMockData(mockItem, { method: request.method });
    } else if (mockItem.dataType === 'define') {
      responseData = this.fetchDefineMockData(mockItem);
    } else {
      // TODO: 待完善
      responseData = {
        data: 'Hello World!',
      };
    }

    const rootPlugin = Container.get(RootPlugin);

    rootPlugin.mockData(responseData, { dataType: mockItem.dataType });

    const stringfyResponseData = JSON.stringify(responseData);

    response.setHeader('Content-Type', 'application/json');
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-length': stringfyResponseData?.length,
      'x-plug-mock-id': mockItem.id,
      'x-plug-mock-type': mockItem.apiType,
    });
    response.end(stringfyResponseData);

    return {
      statusCode: response.statusCode,
      headers: response.getHeaders(),
      data: stringfyResponseData,
    };
  }
}
