import https from 'https';
import tls from 'tls';
import { Service, Container } from 'typedi';
import { BaseServer } from './base';
import { Logger } from '../shared/log';
import { Certificat } from '../shared/certificat';
import { Configuration } from '../configuration';

const logger = new Logger('https');

@Service()
export class Https extends BaseServer {
  server: https.Server;

  start() {
    this.createSecureServer();
    this.serverHandler();
  }

  private createSecureServer() {
    const certificat = Container.get<Certificat>(Certificat);
    const serverCert = certificat.createCertificatByDomain(Certificat.BASE_HTTPS_DOMAIN);

    this.server = new https.Server({
      key: serverCert.key,
      cert: serverCert.cert,
      SNICallback: (hostname, done) => {
        const currentCert = certificat.createCertificatByDomain(hostname);
        const secureContext = tls.createSecureContext({
          key: currentCert.key,
          cert: currentCert.cert,
        });

        done(null, secureContext);
      },
    });
  }

  private serverHandler() {
    this.server.on('request', this.requestHandler.bind(this));
    this.server.on('close', this.closeHandler.bind(this));
    this.server.on('error', this.errorHandler.bind(this));

    this.server.listen(Configuration.HTTPS_PROXY_PORT, () => {
      logger.info(`https server start at ${Configuration.HTTPS_PROXY_PORT}`);
    });
  }

  private closeHandler() {
    logger.info(`https server closed`);
  }

  private errorHandler(error) {
    logger.info(`https server error occured: ${error.message}`);
  }
}