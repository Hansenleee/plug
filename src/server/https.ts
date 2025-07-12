import https from 'https';
import tls from 'tls';
import { Service, Container } from 'typedi';
import { BaseServer } from './base';
import { Certificate } from '../shared/certificate';
import { Configuration } from '../configuration';

@Service()
export class Https extends BaseServer {
  server: https.Server;

  constructor() {
    super('https');
  }

  async start() {
    await this.checkHttps();
    this.createSecureServer();
    this.serverHandler();
  }

  private async checkHttps() {
    const isPortUsed = await this.checkPortIsUsed(Configuration.HTTPS_PROXY_PORT);

    if (isPortUsed) {
      this.logger.warn(`Https server 端口 ${Configuration.HTTPS_PROXY_PORT} 被占用!`);

      throw Error('Https EADDRINUSE');
    }
  }

  private createSecureServer() {
    const certificate = Container.get<Certificate>(Certificate);
    const serverCert = certificate.createCertificateByDomain(Certificate.BASE_HTTPS_DOMAIN);

    this.server = new https.Server({
      key: serverCert.key,
      cert: serverCert.cert,
      SNICallback: (hostname, done) => {
        const currentCert = certificate.createCertificateByDomain(hostname);
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
      this.logger.info(`https server start at ${Configuration.HTTPS_PROXY_PORT}`);
    });
  }
}
