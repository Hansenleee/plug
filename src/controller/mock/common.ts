import { Service, Container } from 'typedi';
import { JsonController, Get, Post, Body, QueryParams } from 'routing-controllers';
import { BaseController } from '../base';
import { Mock } from '../../mock';

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
  async getMockData(@QueryParams() query: { apiId: string }) {
    const { apiId } = query;

    this.required(query, ['apiId']);

    // const mockItem = this.storage.mock.getMockData(apiId as string);
    const mockItem = this.storage.mock.getApi(apiId as string);
    const mockServer = Container.get(Mock);
    const mockData = await mockServer.invoke(mockItem, {
      url: '',
      method: mockItem.method,
      body: '',
    });

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
