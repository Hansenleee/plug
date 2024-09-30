import { Service, Inject } from 'typedi';
import { OTA } from './ota';
import { Exception } from './exception';
import { LifeCycle } from './life-cycle';

@Service()
export class Guardian {
  @Inject()
  ota: OTA;

  @Inject()
  exception: Exception;

  @Inject()
  lifeCycle: LifeCycle;

  async beforeStart() {
    this.exception.beforeStart();
    this.lifeCycle.beforeStart();
    await this.ota.checkAndUpgrade();
  }

  start() {
    this.lifeCycle.start();
  }

  afterStart() {
    this.lifeCycle.afterStart();
  }
}
