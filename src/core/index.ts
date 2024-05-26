import { Inject, Service } from 'typedi';
import { Http } from './server/http';
import { Https } from './server/https';
import { Storage } from './storage';
import { ManagementServer } from './server/management';

@Service()
export class CoreApp {
  @Inject()
  http: Http;

  @Inject()
  https: Https;

  @Inject()
  managementServer: ManagementServer;

  @Inject()
  storage: Storage;

  start() {
    this.http.start();
    this.https.start();
    this.managementServer.start();
    this.storage.init();
  }
}
