import http from 'http';
import Container, { Service } from 'typedi';
import { Storage } from '../storage';
import { MockApiItem } from '../types';
import { getPath, getHost } from '../shared/request-meta';
import { Mock } from '../mock';

@Service()
export class ProxyMock {
  check(request: http.IncomingMessage) {
    const storage = Container.get(Storage);
    const mockHostList = storage.mock.getMemoryMockHost() || [];
    const requestHost = getHost(request);

    const isMatchMock = mockHostList.some((mockHost) => {
      if (mockHost === requestHost) {
        return true;
      }

      if (mockHost === '127.0.0.1') {
        // 如果 mock host 包含本地地址，则自动适配
        return /^\d{0,4}\.\d{0,4}\.\d{0,4}\.\d{0,4}:\d{0,6}$/.test(requestHost);
      }

      return false;
    });

    if (!isMatchMock) {
      return false;
    }

    const mockApiList = storage.mock.getApiList();
    const pathname = getPath(request);
    const availableMockApi = mockApiList.find((item) => {
      const wholePath = item.prefix ? `${item.prefix}${item.path}` : item.path;

      return (
        item.enable && wholePath === pathname && (!item.method || item.method === request.method)
      );
    });

    if (availableMockApi) {
      return availableMockApi;
    }

    return false;
  }

  async mock(mockItem: MockApiItem, request: http.IncomingMessage, response: http.ServerResponse) {
    const mockServer = Container.get(Mock);
    const mockData = await mockServer.invoke(mockItem, request.parser);
    const stringifyMockData = mockData.stringify();

    response.setHeader('Content-Type', 'application/json');
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-length': Buffer.byteLength(stringifyMockData),
      'x-plug-mock-id': mockItem.id,
      'x-plug-mock-type': mockItem.apiType,
    });
    response.end(stringifyMockData);

    return {
      statusCode: response.statusCode,
      headers: response.getHeaders(),
      data: stringifyMockData,
    };
  }
}
