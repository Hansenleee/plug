import { Inject, Service } from 'typedi';
import { Http } from './server/http';
import { Https } from './server/https';

@Service()
export class CoreApp {
  @Inject()
  http: Http;

  @Inject()
  https: Https;

  start() {
    this.http.start();
    this.https.start();
  }
}
