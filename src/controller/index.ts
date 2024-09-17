import { Inject, Service } from 'typedi';
import { RecordController } from './records';
import { MockController } from './mock';
import { SystemController } from './system';

@Service()
export class Controller {
  @Inject()
  record: RecordController;

  @Inject()
  mock: MockController;

  @Inject()
  system: SystemController;
}
