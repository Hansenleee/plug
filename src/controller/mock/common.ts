import http from 'http';
import { Service, Container } from 'typedi';
import { JsonController, Get, Post, Body, QueryParams, Req } from 'routing-controllers';
import { BaseController } from '../base';
import { Mock, MockOptions } from '../../mock';
import { RequestParser } from '../../shared/request-parser';

@Service()
@JsonController('/mock/common')
export class MockCommonController extends BaseController {
  @Get('/config')
  async getConfig() {
    return this.success(this.storage.mock.getConfig(BaseController.YAPI_NS));
  }

  @Post('/config')
  async setConfig(@Body() config: { host: string; mockHost: string[] }) {
    const { host, mockHost } = config;

    this.storage.mock.setConfig(BaseController.YAPI_NS, { host, mockHost });

    return this.success(true);
  }

  @Get('/data')
  async getMockData(
    @QueryParams() query: { apiId: string; mockType: MockOptions['mockType'] },
    @Req() request: http.IncomingMessage
  ) {
    const { apiId, mockType } = query;

    this.required(query, ['apiId']);

    const mockItem = this.storage.mock.getApi(apiId as string);
    const mockServer = Container.get(Mock);
    const mockData = await mockServer.invoke(
      mockItem,
      RequestParser.create({
        url: request.url,
        method: mockItem.method,
        body: '',
        protocol: 'http',
        host: request.headers.host,
      }),
      {
        mockType,
      }
    );

    return this.success(mockData.stringify());
  }

  @Post('/data')
  async insertOrUpdateMockData(@Body() info: { apiId: string; mockString: string }) {
    const { apiId, mockString } = info;

    this.required(info, ['mockString']);

    this.storage.mock.insertOrUpdateMockData({ apiId, mockString });
    this.storage.mock.updateApi({ id: apiId, dataType: 'define' });

    return this.success(true);
  }
}
