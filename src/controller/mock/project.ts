import { Service } from 'typedi';
import { nanoid } from 'nanoid';
import { JsonController, Post, Body, Get } from 'routing-controllers';
import { BaseController } from '../base';
import { MockApiItem } from '../../types';

interface ProjectAddBody {
  token: string;
  projectName: string;
  dataType: MockApiItem['dataType'];
}

interface ProjectUpdateBody {
  id: string;
  projectName: string;
  enable: boolean;
  [key: string]: unknown;
}

interface ProjectUpgradeBody {
  id: string;
  projectId: string;
  token: string;
  [key: string]: unknown;
}

@Service()
@JsonController('/mock/project')
export class MockProjectController extends BaseController {
  @Post('/add')
  async add(@Body() info: ProjectAddBody) {
    const { token, projectName, dataType } = info;
    const projectInfo = await this.service.yapi.fetchProjectInfo(token);

    const interfaceListResult = await this.service.yapi.fetchInterfaceList({
      token,
      project_id: projectInfo._id,
    });
    const interfaceList = interfaceListResult?.list || [];

    if (!interfaceList?.length) {
      return this.error(10020, '当前项目下的接口为空');
    }

    const config = this.storage.mock.getConfig(BaseController.YAPI_NS);
    const innerProjectId = nanoid();
    const storageInterfaceList = interfaceList.map((item) => {
      return this.assembleInterfaceItem(item, {
        host: config.host,
        yapiProjectId: projectInfo._id,
        projectId: innerProjectId,
        dataType,
      });
    });

    this.storage.mock.appendProject({
      id: innerProjectId,
      token,
      projectId: projectInfo._id,
      projectName: projectName || projectInfo.name,
      enable: true,
    });
    this.storage.mock.appendApi(storageInterfaceList);

    return this.success(interfaceList);
  }

  @Post('/update')
  async update(@Body() info: ProjectUpdateBody) {
    const { id, projectName, enable } = info;

    this.required(info, ['id']);
    this.storage.mock.updateProject({ id, projectName, enable });

    // 批量更新下面的所有接口状态
    const yapiList = this.storage.mock.getApiList().filter((item) => {
      return item.projectId === id;
    });

    this.storage.mock.batchUpdateApi(yapiList.map((api) => ({ id: api.id, enable })));

    return this.success(true);
  }

  @Post('/delete')
  async delete(@Body() info: { id: string }) {
    const { id } = info;

    this.required(info, ['id']);
    this.storage.mock.deleteProject(id);

    return this.success(true);
  }

  @Post('/upgrade')
  async upgrade(@Body() info: ProjectUpgradeBody) {
    const { id, projectId, token } = info;

    this.required(info, ['id', 'projectId', 'token']);
    this.storage.mock.deleteApiByProject(id);

    const interfaceListResult = await this.service.yapi.fetchInterfaceList({
      token,
      project_id: projectId,
    });
    const interfaceList = interfaceListResult?.list || [];
    const config = this.storage.mock.getConfig(BaseController.YAPI_NS);

    const storageInterfaceList = interfaceList.map((item) => {
      return this.assembleInterfaceItem(item, {
        host: config.host,
        yapiProjectId: projectId,
        projectId: id,
        dataType: 'url',
      });
    });
    this.storage.mock.appendApi(storageInterfaceList);

    return this.success(true);
  }

  @Get('/list')
  async getProjectList() {
    return this.success(this.storage.mock.getProjectList());
  }

  private assembleInterfaceItem(originInterfaceItem, { host, yapiProjectId, projectId, dataType }) {
    return {
      id: nanoid(),
      title: originInterfaceItem.title,
      path: originInterfaceItem.path,
      method: originInterfaceItem.method,
      dataType: dataType || 'url',
      apiType: 'yapi',
      enable: true,
      mockUrl: `${host}/mock/${yapiProjectId}${originInterfaceItem.path}`,
      projectId,
      yapiId: originInterfaceItem._id,
    };
  }
}
