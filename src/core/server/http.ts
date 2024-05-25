import { Service } from 'typedi';
import http from 'http';
import { Logger } from '../shared/log';
import { Configuration } from '../../configuration';

const logger = new Logger('http');

@Service()
export class Http {
  httpServer: http.Server = new http.Server();

  start() {
    this.httpServer.listen(Configuration.PROXY_PORT, () => {
      logger.info(`http server start at ${Configuration.PROXY_PORT}`);
    });
  }
}
