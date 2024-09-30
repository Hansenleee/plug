import Container, { Inject, Service } from 'typedi';
import { Http } from './server/http';
import { Https } from './server/https';
import { Storage } from './storage';
import { ManagementServer } from './server/management';
import { Certificate } from './shared/certificate';
import { Guardian } from './guardian';
import { RootPlugin } from './plugins';

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

  async start() {
    await this.guards.beforeStart();

    const storage = Container.get<Storage>(Storage);
    const certificate = Container.get<Certificate>(Certificate);
    const rootPlugin = Container.get<RootPlugin>(RootPlugin);

    certificate.init();
    storage.init();

    this.guards.start();
    this.http.start();
    this.https.start();
    this.managementServer.start();

    // TODO: 后续优化
    rootPlugin.init();
    this.guards.afterStart();
  }

  stop() {
    this.guards.lifeCycle.stop();
  }
}
