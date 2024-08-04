import { Inject, Service } from 'typedi';
import { RecordController } from './records';
import { YapiController } from './yapi';

@Service()
export class Controller {
  @Inject()
  record: RecordController;

  @Inject()
  yapi: YapiController;
}
