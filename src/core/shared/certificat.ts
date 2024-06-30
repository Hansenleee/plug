import forge, { pki } from 'node-forge';
import { Service } from 'typedi';
import path from 'path';
import fs from 'fs';
import { LRUCache } from 'lru-cache';
import { Logger } from './log';

const log = new Logger('cert');
const ROOT_CERT_KEY = '__ROOT_CERT_KEY';

interface CertInfo {
  key: pki.rsa.PrivateKey;
  cert: pki.Certificate;
}

interface CertOption {
  notBeforeYear: number;
  notAfterYear: number;
  domain: string;
  extensions: any[];
  rootKey?: pki.rsa.PrivateKey;
  rootCert?: pki.Certificate;
}

@Service()
export class Certificat {
  static readonly BASE_DIR = path.join(process.cwd(), 'resource', 'certificat');

  private get crtPath() {
    return path.join(Certificat.BASE_DIR, 'my.crt');
  }

  private get keyPath() {
    return path.join(Certificat.BASE_DIR, 'my.key.pem');
  }

  private cache = new LRUCache<string, CertInfo>({
    max: 100,
    ttl: 1000 * 60 * 60 * 24,
  });

  initBaseCertificat() {
    const hasCert = fs.existsSync(this.crtPath);

    if (hasCert) {
      return;
    }

    const { cert, key } = this.createCert({
      notBeforeYear: 5,
      notAfterYear: 20,
      domain: 'plug-proxy',
      extensions: [],
    });

    fs.writeFileSync(this.crtPath, cert);
    fs.writeFileSync(this.keyPath, key);
    log.info('根证书创建完成');
  }

  createCertificatByDomain() {}

  private getRootCert() {
    if (this.cache.get(ROOT_CERT_KEY)) {
      return this.cache.get(ROOT_CERT_KEY);
    }

    const rootCert = fs.readFileSync(this.crtPath);
    const rootKey = fs.readFileSync(this.keyPath);
  }

  private createCert(option: CertOption) {
    const keys = pki.rsa.generateKeyPair(2046);
    const cert = pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = `${new Date().getTime()}`;

    cert.validity.notBefore = new Date();
    cert.validity.notBefore.setFullYear(
      cert.validity.notBefore.getFullYear() - option.notBeforeYear
    );
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + option.notAfterYear);

    const attrs = [
      {
        name: 'commonName',
        value: option.domain,
      },
      {
        name: 'countryName',
        value: 'CN',
      },
      {
        shortName: 'ST',
        value: 'ZheJiang',
      },
      {
        name: 'localityName',
        value: 'HangZhou',
      },
      {
        name: 'organizationName',
        value: 'plug-proxy',
      },
      {
        shortName: 'OU',
        value: 'https://github.com/Hansenleee/plug',
      },
    ];

    cert.setIssuer(option.rootCert?.subject?.attributes || attrs);
    cert.setSubject(attrs);
    cert.setExtensions(option.extensions);
    cert.sign(option.rootKey || keys.privateKey, forge.md.sha256.create());

    return {
      key: pki.privateKeyToPem(keys.privateKey),
      cert: pki.certificateToPem(cert),
    };
  }
}
