import { Inject, Service } from 'typedi';
import { Http } from './server/http';
import { Https } from './server/https';
import { BaseStorage } from './storage';
import { ManagementServer } from './server/management';

@Service()
export class CoreApp {
  @Inject()
  http: Http;

  @Inject()
  https: Https;

  @Inject()
  managementServer: ManagementServer;

  start() {
    this.http.start();
    this.https.start();
    this.managementServer.start();

    BaseStorage.init();
  }
}
