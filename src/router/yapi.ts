import { Service, Container } from 'typedi';
import { BaseRouter, RoutersType } from './base';
import { Controller } from '../controller';

@Service()
export class YapiRouter implements BaseRouter {
  readonly prefix = '/mock/yapi';
  readonly controller = Container.get(Controller).yapi;

  routers = [
    ['/config', 'get', this.controller.getConfig],
    ['/config', 'post', this.controller.getConfig],
    ['/addById', 'post', this.controller.addById],
    ['/mock/data', 'get', this.controller.getMockData],
    ['/mock/update', 'post', this.controller.insertOrUpdateMockData],
    ['/yapi/delete', 'post', this.controller.delete],
    ['/list/page', 'post', this.controller.getYapiListByPage],
    ['/status/toggle', 'post', this.controller.statusToggle],
    ['/project/add', 'post', this.controller.addByProject],
    ['/project/update', 'post', this.controller.updateProject],
    ['/project/upgrade', 'post', this.controller.upgradeProject],
    ['/project/delete', 'post', this.controller.deleteProject],
    ['/project/list', 'get', this.controller.getProjectList],
  ] as RoutersType;
}
