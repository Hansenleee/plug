import { Service } from 'typedi';
import { BaseStorage } from './base';
import { MockApiItem, MockDataItem, ProjectItem, MockConfig } from '../types';

@Service()
export class MockStorage extends BaseStorage {
  private static readonly NS = 'mock';

  // 用来存储 mock 相关的基础配置
  private static readonly CONFIG_KEY = 'config';

  // 用来存储 mock-api meta 信息的 key
  private static readonly API_META_KEY = 'api-meta';

  // 用来存储自定义 mock 信息的 key
  private static readonly CUSTOM_MOCK_KEY = 'custom-mock';

  // 用来存储 project 相关的信息的 key
  private static readonly PROJECT_KEY = 'project';

  // 内存中储存 mockHost 的 key
  private static readonly MEM_MOCK_HOST_KEY = 'mockHost';

  constructor() {
    super(MockStorage.NS);
  }

  init() {
    this.memoryMockHost();
  }

  setConfig(key: string, item: Partial<MockConfig>) {
    this.persistence.setMap(MockStorage.CONFIG_KEY, { [key]: item });
    this.memoryMockHost();
  }

  getConfig(key?: string): Partial<MockConfig> {
    const config = this.persistence.get(MockStorage.CONFIG_KEY, {});

    return key ? config[key] : config;
  }

  appendApi(item: MockApiItem | MockApiItem[]) {
    const items = Array.isArray(item) ? item : [item];

    return this.persistence.batchAppend(
      MockStorage.API_META_KEY,
      items.map((_) => ({ ..._, updateTime: Date.now() }))
    );
  }

  batchUpdateApi(items: Array<Partial<MockApiItem> & { id: string }>) {
    const itemIds = items.map((_) => _.id);
    const apiList = this.persistence.get(MockStorage.API_META_KEY, []) as MockApiItem[];

    apiList.forEach((api, index) => {
      const targetIndex = itemIds.indexOf(api.id);

      if (targetIndex >= 0) {
        apiList[index] = { ...apiList[index], ...items[targetIndex], updateTime: Date.now() };
      }
    });

    this.persistence.set(MockStorage.API_META_KEY, apiList);
  }

  updateApi(item: Partial<MockApiItem> & { id: string }) {
    this.batchUpdateApi([item]);
  }

  deleteApi(id: string) {
    const apiList = this.persistence.get(MockStorage.API_META_KEY, []) as MockApiItem[];

    this.persistence.set(
      MockStorage.API_META_KEY,
      apiList.filter((item) => item.id !== id)
    );
  }

  deleteApiByProject(projectId: string, filter?: (item: MockApiItem) => boolean) {
    const apiList = this.persistence.get(MockStorage.API_META_KEY, []) as MockApiItem[];
    let leftApiList = [];

    if (typeof filter !== 'function') {
      leftApiList = apiList.filter((item) => item.projectId !== projectId);
    } else {
      leftApiList = apiList.filter(
        // 其他 project 的 api 或者当前 project 的 api 且不满足 filter 的都被留下来
        (item) => item.projectId !== projectId || (item.projectId === projectId && !filter(item))
      );
    }

    this.persistence.set(MockStorage.API_META_KEY, leftApiList);
  }

  getApi(id: string) {
    const apiList = this.persistence.get(MockStorage.API_META_KEY, []) as MockApiItem[];

    return apiList.find((api) => api.id === id);
  }

  getApiList() {
    return this.persistence.get(MockStorage.API_META_KEY, []) as MockApiItem[];
  }

  getMockData(apiId: string) {
    return this.persistence.get(`${MockStorage.CUSTOM_MOCK_KEY}_${apiId}`, {});
  }

  insertOrUpdateMockData(mockItem: MockDataItem) {
    const originMockItem = this.persistence.get(
      `${MockStorage.CUSTOM_MOCK_KEY}_${mockItem.apiId}`,
      {}
    );
    const mockKey = `${MockStorage.CUSTOM_MOCK_KEY}_${mockItem.apiId}`;

    if (originMockItem) {
      return this.persistence.set(mockKey, {
        ...originMockItem,
        ...mockItem,
      });
    }

    return this.persistence.set(mockKey, mockItem);
  }

  deleteMockData(apiId: string) {
    return this.persistence.delete(`${MockStorage.CUSTOM_MOCK_KEY}_${apiId}`);
  }

  appendProject(item: ProjectItem) {
    return this.persistence.append(MockStorage.PROJECT_KEY, { ...item, updateTime: Date.now() });
  }

  updateProject(item: Partial<ProjectItem> & { id: string }) {
    const projectList = this.persistence.get(MockStorage.PROJECT_KEY, []) as MockApiItem[];
    const projectItemIndex = projectList.findIndex((project) => project.id === item.id);

    if (projectItemIndex >= 0) {
      projectList[projectItemIndex] = {
        ...projectList[projectItemIndex],
        ...item,
        updateTime: Date.now(),
      };
    }

    this.persistence.set(MockStorage.PROJECT_KEY, projectList);
  }

  deleteProject(id: string) {
    const projectList = this.persistence.get(MockStorage.PROJECT_KEY, []) as ProjectItem[];

    this.persistence.set(
      MockStorage.PROJECT_KEY,
      projectList.filter((item) => item.id !== id)
    );
    this.deleteApiByProject(id);
  }

  getProject(id: string) {
    const projectList = this.getProjectList();

    return projectList.find((_) => _.id === id);
  }

  getProjectList() {
    return this.persistence.get(MockStorage.PROJECT_KEY, []) as MockApiItem[];
  }

  getMemoryMockHost(): string[] {
    return this.memory.get(MockStorage.MEM_MOCK_HOST_KEY);
  }

  private memoryMockHost() {
    const allConfig = this.getConfig() as Record<string, Partial<MockConfig>>;
    let mockHostList = [];

    Object.values(allConfig).forEach((eachConfig) => {
      if (eachConfig.mockHost?.length) {
        mockHostList = [...mockHostList, ...eachConfig.mockHost];
      }
    });

    this.memory.set(MockStorage.MEM_MOCK_HOST_KEY, mockHostList);
  }
}
