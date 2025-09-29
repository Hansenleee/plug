import { Inject, Service } from 'typedi';
import { BaseController } from '../base';
import { SystemConfigController } from './config';
import { SystemProxyController } from './proxy';
import { SystemLogsController } from './logs';

@Service()
export class SystemController extends BaseController {
  @Inject()
  config: SystemConfigController;

  @Inject()
  proxy: SystemProxyController;

  @Inject()
  logs: SystemLogsController;
}
