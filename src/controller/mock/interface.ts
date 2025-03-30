import { Service } from 'typedi';
import { nanoid } from 'nanoid';
import { JsonController, Post, Get, Body, QueryParams } from 'routing-controllers';
import { BaseController } from '../base';
import { MockApiItem } from '../../types';

interface addInfo extends Pick<MockApiItem, 'apiType' | 'token' | 'title'> {
  yapiId: string;
  url: string;
  dataType?: MockApiItem['dataType'];
  intelligent?: boolean;
}

interface ListSearchBody {
  page: { pageNo: number; pageSize: number };
  name: string;
  project: string;
  [key: string]: unknown;
}

@Service()
@JsonController('/mock/interface')
export class MockInterfaceController extends BaseController {
  @Post('/add')
  async add(@Body() info: addInfo) {
    if (info.apiType === 'default') {
      return this.addByDefine(info);
    }

    return this.addByYapi(info);
  }

  @Post('/upgrade')
  async upgrade(@Body() info: { id: string }) {
    const { id } = info;

    this.required(info, ['id']);

    const interfaceInfo = this.storage.mock.getApi(id);
    let token;

    if (!interfaceInfo) {
      return this.error(-10011, '接口不存在');
    }

    if (interfaceInfo.projectId && !interfaceInfo.token) {
      const projectInfo = this.storage.mock.getProject(interfaceInfo.projectId);

      token = projectInfo.token;
    } else {
      token = interfaceInfo.token;
    }

    if (!token || !interfaceInfo.yapiId) {
      return this.error(-10012, '更新失败，请删除接口后重新添加');
    }

    const updatedInterfaceInfo = await this.service.yapi.fetchInterface({
      id: interfaceInfo.yapiId,
      token,
    });

    const config = this.storage.mock.getConfig(BaseController.YAPI_NS);
    const projectInfo = await this.service.yapi.fetchProjectInfo(token);

    this.storage.mock.updateApi({
      id,
      title: updatedInterfaceInfo.title,
      path: updatedInterfaceInfo.path,
      method: updatedInterfaceInfo.method,
      token,
      dataType: 'url',
      mockUrl: `${config.host}/mock/${projectInfo._id}${interfaceInfo.path}`,
    });
    this.storage.mock.deleteMockData(id);

    return this.success(true);
  }

  @Post('/toggle')
  async toggle(@Body() info: { id: string }) {
    const { id } = info;

    this.required(info, ['id']);

    const mockApi = this.storage.mock.getApi(id);

    this.storage.mock.updateApi({ id, enable: !mockApi.enable });

    return this.success(true);
  }

  @Post('/delete')
  async delete(@Body() info: { id: string }) {
    const { id } = info;

    this.required(info, ['id']);
    this.storage.mock.deleteApi(id);

    return this.success(true);
  }

  @Get('/detail/request')
  async getInterfaceDetail(@QueryParams() query: { yapiId: string; token: string }) {
    const { yapiId, token } = query;
    const interfaceInfo = await this.service.yapi.fetchInterface({ id: yapiId, token });
    const rawReqBody = interfaceInfo.req_body_other;
    const jsonReqBody = JSON.parse(rawReqBody);

    return this.success(
      Object.keys(jsonReqBody.properties).reduce((total, currentKey) => {
        return {
          ...total,
          [currentKey]: '',
        };
      }, {})
    );
  }

  @Post('/list/page')
  async getYapiListByPage(@Body() info: ListSearchBody) {
    const { page, name, project } = info;
    const isValidName = !!name || (name as unknown as number) === 0;

    this.required(info, ['page']);

    const yapiList = this.storage.mock
      .getApiList()
      .filter((item) => {
        const wholePath = (item.prefix || '') + item.path;
        const isMatchName = !isValidName || wholePath.includes(name) || item.title.includes(name);
        const isMatchProject = !project || item.projectId === project;

        return isMatchName && isMatchProject;
      })
      .sort((pre, cur) => cur.updateTime - pre.updateTime);

    return this.page(yapiList, page);
  }

  private async addByDefine(info: addInfo) {
    this.storage.mock.appendApi({
      id: nanoid(),
      title: info.title || info.url,
      path: info.url,
      dataType: 'define',
      apiType: 'default',
      enable: true,
      intelligent: !!info.intelligent,
    });

    return this.success(true);
  }

  private async addByYapi(info: addInfo) {
    const { dataType, yapiId, token, intelligent = false } = info;

    const interfaceInfo = await this.service.yapi.fetchInterface({ id: yapiId, token });
    const commonData = {
      id: nanoid(),
      title: interfaceInfo.title,
      path: interfaceInfo.path,
      method: interfaceInfo.method,
      dataType,
      apiType: 'yapi',
      enable: true,
      intelligent,
    };
    const yapiList = this.storage.mock.getApiList();
    const exist = yapiList.find((yapi) => yapi.path === interfaceInfo.path && yapi.token === token);

    if (exist) {
      return this.error(10010, '当前项目下的 yapi 接口已存在，请不用重复添加');
    }

    const config = this.storage.mock.getConfig(BaseController.YAPI_NS);
    const projectInfo = await this.service.yapi.fetchProjectInfo(token);

    this.storage.mock.appendApi({
      ...commonData,
      token,
      mockUrl: `${config.host}/mock/${projectInfo._id}${interfaceInfo.path}`,
    });

    return this.success(true);
  }
}
