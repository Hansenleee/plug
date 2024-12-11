import { Service, Inject } from 'typedi';
import { OTA } from './ota';
import { Exception } from './exception';
import { LifeCycle } from './life-cycle';
import { Orphan, Permanent } from './orphan';

@Service()
export class Guardian {
  @Inject()
  ota: OTA;

  @Inject()
  exception: Exception;

  @Inject()
  lifeCycle: LifeCycle;

  @Inject()
  orphan: Orphan;

  @Inject()
  permanent: Permanent;

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
