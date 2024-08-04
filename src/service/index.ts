import { Inject, Service } from 'typedi';
import { YapiService } from './yapi';

@Service()
export class Services {
  @Inject()
  yapi: YapiService;
}
