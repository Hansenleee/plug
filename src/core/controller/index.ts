import { Inject, Service } from 'typedi';
import { RecordController } from './records';

@Service()
export class Controller {
  @Inject()
  record: RecordController;
}
