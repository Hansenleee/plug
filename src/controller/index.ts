import { Inject, Service } from 'typedi';
import { RecordController } from './records';
import { MockController } from './mock';
import { SystemController } from './system';
import { ProxyController } from './proxy';

@Service()
export class Controller {
  @Inject()
  record: RecordController;

  @Inject()
  mock: MockController;

  @Inject()
  system: SystemController;

  @Inject()
  proxy: ProxyController;
}
