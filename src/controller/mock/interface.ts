import { Service } from 'typedi';
import { nanoid } from 'nanoid';
import { JsonController, Post, Body } from 'routing-controllers';
import { BaseController } from '../base';
import { MockApiItem, MockDataType } from '../../types';

interface addInfo extends Pick<MockApiItem, 'dataType' | 'token' | 'title'> {
  yapiId: string;
  url: string;
}

interface ListSeachBody {
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
    if (info.dataType === MockDataType.DEFINE) {
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

  @Post('/list/page')
  async getYapiListByPage(@Body() info: ListSeachBody) {
    const { page, name, project } = info;
    const isValidName = !!name || (name as unknown as number) === 0;

    this.required(info, ['page']);

    const yapiList = this.storage.mock
      .getApiList()
      .filter((item) => {
        const isMatchName = !isValidName || item.path.includes(name) || item.title.includes(name);
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
      dataType: info.dataType,
      apiType: 'default',
      enable: true,
    });

    return this.success(true);
  }

  private async addByYapi(info: addInfo) {
    const { dataType, yapiId, token } = info;

    const interfaceInfo = await this.service.yapi.fetchInterface({ id: yapiId, token });
    const commonData = {
      id: nanoid(),
      title: interfaceInfo.title,
      path: interfaceInfo.path,
      method: interfaceInfo.method,
      dataType,
      apiType: 'yapi',
      enable: true,
    };
    const yapiList = this.storage.mock.getApiList();
    const exist = yapiList.find((yapi) => yapi.path === interfaceInfo.path);

    if (exist) {
      return this.error(10010, '当前 yapi 接口已存在，请不用重复添加');
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