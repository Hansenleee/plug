import Container, { Service } from 'typedi';
import type { Context } from 'koa';
import { nanoid } from 'nanoid';
import { BaseController } from './base';
import { Proxy } from '../proxy';

@Service()
export class YapiController extends BaseController {
  private static readonly NS = 'yapi';

  async getConfig(ctx: Context) {
    const config = this.storage.mock.getConfig(YapiController.NS);

    ctx.body = this.success(config);
  }

  async setConfig(ctx: Context) {
    const { host, mockHost } = ctx.request.body;

    this.storage.mock.setConfig(YapiController.NS, { host, mockHost });

    ctx.body = this.success(true);
  }

  async addById(ctx: Context) {
    const { yapiId, token, dataType } = ctx.request.body;
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
      ctx.body = this.error(10010, '当前 yapi 接口已存在，请不用重复添加');

      return;
    }

    const config = this.storage.mock.getConfig(YapiController.NS);
    const projectInfo = await this.service.yapi.fetchProjectInfo(token);

    this.storage.mock.appendApi({
      ...commonData,
      mockUrl: `${config.host}/mock/${projectInfo._id}${interfaceInfo.path}`,
    });

    ctx.body = this.success(true);
  }

  async getMockData(ctx: Context) {
    const { apiId } = ctx.query;

    this.required(ctx.query, ['apiId']);

    const mockData = this.storage.mock.getMockData(apiId as string);

    if (mockData?.apiId) {
      ctx.body = this.success(JSON.parse(mockData.mockString));

      return;
    }

    const mockApi = this.storage.mock.getApi(apiId as string);
    const proxy = Container.get(Proxy);

    const jsonMockData = await proxy.mock.fetchMockData(mockApi, {
      method: mockApi.method,
    });

    ctx.body = this.success(jsonMockData);
  }

  async insertOrUpdateMockData(ctx: Context) {
    const { apiId, mockString } = ctx.request.body;

    this.required(ctx.request.body, ['mockString']);

    this.storage.mock.insertOrUpdateMockData({ apiId, mockString });
    this.storage.mock.updateApi({ id: apiId, dataType: 'define' });

    ctx.body = this.success(true);
  }

  async addByProject(ctx: Context) {
    const { token, projectName, dataType } = ctx.request.body;
    const projectInfo = await this.service.yapi.fetchProjectInfo(token);

    const interfaceListResult = await this.service.yapi.fetchInterfaceList({
      token,
      project_id: projectInfo._id,
    });
    const interfaceList = interfaceListResult?.list || [];

    if (!interfaceList?.length) {
      ctx.body = this.error(10020, '当前你项目下的接口为空');

      return;
    }

    const config = this.storage.mock.getConfig(YapiController.NS);
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

    ctx.body = this.success(interfaceList);
  }

  async updateProject(ctx: Context) {
    const { id, projectName, enable } = ctx.request.body;

    this.required(ctx.request.body, ['id']);
    this.storage.mock.updateProject({ id, projectName, enable });

    ctx.body = this.success(true);
  }

  async deleteProject(ctx: Context) {
    const { id } = ctx.request.body;

    this.required(ctx.request.body, ['id']);
    this.storage.mock.deleteProject(id);

    ctx.body = this.success(true);
  }

  async upgradeProject(ctx: Context) {
    const { id, projectId, token } = ctx.request.body;

    this.required(ctx.request.body, ['id', 'projectId', 'token']);
    this.storage.mock.deleteApiByProject(id);

    const interfaceListResult = await this.service.yapi.fetchInterfaceList({
      token,
      project_id: projectId,
    });
    const interfaceList = interfaceListResult?.list || [];
    const config = this.storage.mock.getConfig(YapiController.NS);

    const storageInterfaceList = interfaceList.map((item) => {
      return this.assembleInterfaceItem(item, {
        host: config.host,
        yapiProjectId: projectId,
        projectId: id,
        dataType: 'url',
      });
    });
    this.storage.mock.appendApi(storageInterfaceList);

    ctx.body = this.success(true);
  }

  async statusToggle(ctx: Context) {
    const { id } = ctx.request.body;

    this.required(ctx.request.body, ['id']);

    const mockApi = this.storage.mock.getApi(id);

    this.storage.mock.updateApi({ id, enable: !mockApi.enable });

    ctx.body = this.success(true);
  }

  async delete(ctx: Context) {
    const { id } = ctx.request.body;

    this.required(ctx.request.body, ['id']);
    this.storage.mock.deleteApi(id);

    ctx.body = this.success(true);
  }

  async getYapiListByPage(ctx: Context) {
    const { apiType, page, name, project } = ctx.request.body;
    const isValidName = !!name || name === 0;

    this.required(ctx.request.body, ['page']);

    const yapiList = this.storage.mock.getApiList().filter((item) => {
      const isMatchName = !isValidName || item.path.includes(name) || item.title.includes(name);
      const isMatchProject = !project || item.projectId === project;

      return item.apiType === apiType && isMatchName && isMatchProject;
    });

    ctx.body = this.page(yapiList, page);
  }

  async getProjectList(ctx: Context) {
    ctx.body = this.success(this.storage.mock.getProjectList());
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
    };
  }
}
