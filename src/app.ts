import Container, { Inject, Service } from 'typedi';
import { Http } from './server/http';
import { Https } from './server/https';
import { BaseStorage } from './storage';
import { ManagementServer } from './server/management';
import { Certificat } from './shared/certificat';
import { Guardian } from './guardian';

@Service()
export class CoreApp {
  @Inject()
  http: Http;

  @Inject()
  https: Https;

  @Inject()
  managementServer: ManagementServer;

  @Inject()
  guards: Guardian;

  start() {
    this.guards.start();
    this.http.start();
    this.https.start();
    this.managementServer.start();

    const certificat = Container.get<Certificat>(Certificat);

    BaseStorage.init();
    certificat.initBaseCertificat();

    return { var: '11111111111111111111111111111111111111111111111111111111111111111111111111111111111'}
  }
}
