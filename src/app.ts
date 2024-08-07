import Container, { Inject, Service } from 'typedi';
import { Http } from './server/http';
import { Https } from './server/https';
import { Storage } from './storage';
import { ManagementServer } from './server/management';
import { Certificate } from './shared/certificate';
import { Guardian } from './guardian';

@Service()
export class CoreApp {
  @Inject()
  private http: Http;

  @Inject()
  private https: Https;

  @Inject()
  private managementServer: ManagementServer;

  @Inject()
  private guards: Guardian;

  start() {
    this.guards.start();
    this.http.start();
    this.https.start();
    this.managementServer.start();

    const storage = Container.get<Storage>(Storage);
    const certificate = Container.get<Certificate>(Certificate);

    storage.init();
    certificate.initBaseCertificate();
  }
}
