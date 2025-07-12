import forge, { pki } from 'node-forge';
import { Service } from 'typedi';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { LRUCache } from 'lru-cache';
import parseDomain from 'parse-domain';
import { Logger } from './log';
import { isDarwin } from './platform';

const logger = new Logger('cert');
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
export class Certificate {
  static readonly NAME = 'plug-proxy';
  static readonly BASE_HTTPS_DOMAIN = 'BASE_HTTPS_DOMAIN';
  static readonly BASE_DIR = path.join(__dirname, '..', 'resources', 'certificate');
  // TODO: 改成自动上传
  static readonly CRT_OSS_URL = 'https://g.gumingnc.com/u/dRdbm7D/plug-proxy.crt';
  static readonly CRT_QR_CODE = 'https://g.gumingnc.com/u/RRdryxC/crt-qrcode.png';

  private get crtPath() {
    return path.join(Certificate.BASE_DIR, `${Certificate.NAME}.crt`);
  }

  private get keyPath() {
    return path.join(Certificate.BASE_DIR, `${Certificate.NAME}.key.pem`);
  }

  private cache = new LRUCache<
    string,
    | CertInfo
    | {
        key: string;
        cert: string;
      }
  >({
    max: 100,
    ttl: 1000 * 60 * 60 * 24,
  });

  init() {
    this.initBaseCert();
    if (isDarwin()) {
      this.checkAndInsertBaseCert();
    }
  }

  createCertificateByDomain(host: string) {
    const rootCert = this.getRootCert();

    let domain = host;
    const parsed = parseDomain(host);

    if (parsed && parsed.subdomain) {
      const subdomainList = parsed.subdomain.split('.');
      subdomainList.shift();

      if (subdomainList.length > 0) {
        domain = `*.${subdomainList.join('.')}.${parsed.domain}.${parsed.tld}`;
      }
    }

    if (this.cache.has(domain)) {
      return this.cache.get(domain) as {
        key: string;
        cert: string;
      };
    }

    const certInfo = this.createCert({
      notBeforeYear: 1,
      notAfterYear: 1,
      domain,
      extensions: [
        {
          name: 'basicConstraints',
          critical: true,
          cA: false,
        },
        {
          name: 'keyUsage',
          critical: true,
          digitalSignature: true,
          contentCommitment: true,
          keyEncipherment: true,
          dataEncipherment: true,
          keyAgreement: true,
          keyCertSign: true,
          cRLSign: true,
          encipherOnly: true,
          decipherOnly: true,
        },
        {
          name: 'subjectAltName',
          altNames: [
            {
              type: 2,
              value: domain,
            },
          ],
        },
        {
          name: 'subjectKeyIdentifier',
        },
        {
          name: 'extKeyUsage',
          serverAuth: true,
          clientAuth: true,
          codeSigning: true,
          emailProtection: true,
          timeStamping: true,
        },
        {
          name: 'authorityKeyIdentifier',
        },
      ],
      rootKey: rootCert.key,
      rootCert: rootCert.cert,
    });

    this.cache.set(domain, certInfo);

    return certInfo;
  }

  private initBaseCert() {
    // TODO: 优化下目录不存在的报错问题
    const hasCert = fs.existsSync(this.crtPath);

    if (hasCert) {
      return;
    }

    const { cert, key } = this.createCert({
      notBeforeYear: 5,
      notAfterYear: 20,
      domain: Certificate.NAME,
      extensions: [
        {
          name: 'basicConstraints',
          critical: true,
          cA: true,
        },
        {
          name: 'keyUsage',
          critical: true,
          keyCertSign: true,
        },
        {
          name: 'subjectKeyIdentifier',
        },
      ],
    });

    fs.writeFileSync(this.crtPath, cert);
    fs.writeFileSync(this.keyPath, key);

    logger.info(`根证书创建完成,证书地址：${Certificate.BASE_DIR}`, { force: true });
  }

  private checkAndInsertBaseCert() {
    try {
      execSync(`security find-certificate -c ${Certificate.NAME}`, {
        encoding: 'utf-8',
      });
    } catch (err) {
      if (err.message.includes('not be found')) {
        return this.insertBaseCert();
      }

      logger.warn('根证书安装失败，请手动安装', { force: true });
    }
  }

  private insertBaseCert() {
    try {
      execSync(
        `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${this.crtPath}`,
        {
          encoding: 'utf-8',
        }
      );

      logger.info('根证书自动安装成功', { force: true });
    } catch (err) {
      logger.warn('根证书安装失败，请手动安装', { force: true });
    }
  }

  private getRootCert(): CertInfo {
    if (this.cache.has(ROOT_CERT_KEY)) {
      return this.cache.get(ROOT_CERT_KEY) as CertInfo;
    }

    const rootCertFile = fs.readFileSync(this.crtPath);
    const rootKeyFile = fs.readFileSync(this.keyPath);

    const rootCert = forge.pki.certificateFromPem(rootCertFile as unknown as string);
    const rootKey = forge.pki.privateKeyFromPem(rootKeyFile as unknown as string);

    const rootCertInfo: CertInfo = {
      cert: rootCert,
      key: rootKey,
    };

    this.cache.set(ROOT_CERT_KEY, rootCertInfo);

    return rootCertInfo;
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
        value: Certificate.NAME,
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
