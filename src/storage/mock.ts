import { Service } from 'typedi';
import { BaseStorage } from './base';

export interface MockApiItem {
  id: string;
  path: string;
  method: string;
  title: string;
  dataType: 'url' | 'define';
  apiType: 'default' | 'yapi' | (string & {});
  mockUrl?: string;
  enable: boolean;
  projectId?: string;
}

export interface ProjectItem {
  id: string;
  token: string;
  projectName: string;
  projectId: string;
  enable: boolean;
}

@Service()
export class MockStorage extends BaseStorage {
  private static readonly NS = 'mock';

  // 用来存储 mock-api meta 信息的 key
  private static readonly API_META_KEY = 'api-meta';

  // 用来存储 mock 相关的基础配置
  private static readonly CONFIG_KEY = 'config';

  // 用来存储 project 相关的信息的 key
  private static readonly PROJECT_KEY = 'project';

  constructor() {
    super(MockStorage.NS);
  }

  init() {}

  appendApi(item: MockApiItem | MockApiItem[]) {
    const items = Array.isArray(item) ? item : [item];

    return this.persistence.batchAppend(MockStorage.API_META_KEY, items);
  }

  updateApi(item: Partial<MockApiItem> & { id: string }) {
    const apiList = this.persistence.get(MockStorage.API_META_KEY, []) as MockApiItem[];
    const apiItemIndex = apiList.findIndex((api) => api.id === item.id);

    if (apiItemIndex >= 0) {
      apiList[apiItemIndex] = { ...apiList[apiItemIndex], ...item };
    }

    this.persistence.set(MockStorage.API_META_KEY, apiList);
  }

  deleteApi(id: string) {
    const apiList = this.persistence.get(MockStorage.API_META_KEY, []) as MockApiItem[];

    this.persistence.set(
      MockStorage.API_META_KEY,
      apiList.filter((item) => item.id !== id)
    );
  }

  getApi(id: string) {
    const apiList = this.persistence.get(MockStorage.API_META_KEY, []) as MockApiItem[];

    return apiList.find((api) => api.id === id);
  }

  getApiList() {
    return this.persistence.get(MockStorage.API_META_KEY, []) as MockApiItem[];
  }

  setConfig(key: string, item: Record<string, unknown>) {
    return this.persistence.setMap(MockStorage.CONFIG_KEY, { [key]: item });
  }

  getConfig(key: string) {
    const config = this.persistence.get(MockStorage.CONFIG_KEY, {});

    return config[key];
  }

  appendProject(item: ProjectItem) {
    return this.persistence.append(MockStorage.PROJECT_KEY, item);
  }

  updateProject(item: Partial<ProjectItem> & { id: string }) {
    const projectList = this.persistence.get(MockStorage.PROJECT_KEY, []) as MockApiItem[];
    const projectItemIndex = projectList.findIndex((project) => project.id === item.id);

    if (projectItemIndex >= 0) {
      projectList[projectItemIndex] = { ...projectList[projectItemIndex], ...item };
    }

    this.persistence.set(MockStorage.PROJECT_KEY, projectList);
  }

  deleteProject(id: string) {
    const apiList = this.persistence.get(MockStorage.PROJECT_KEY, []) as ProjectItem[];

    this.persistence.set(
      MockStorage.PROJECT_KEY,
      apiList.filter((item) => item.id !== id)
    );
  }

  getProjectList() {
    return this.persistence.get(MockStorage.PROJECT_KEY, []) as MockApiItem[];
  }
}