import { Inject, Service } from 'typedi';
import { BaseController } from '../base';
import { MockCommonController } from './common';
import { MockInterfaceController } from './interface';
import { MockProjectController } from './project';

@Service()
export class MockController extends BaseController {
  @Inject()
  common: MockCommonController;

  @Inject()
  interface: MockInterfaceController;

  @Inject()
  project: MockProjectController;
}
