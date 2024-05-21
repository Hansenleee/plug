import forge from 'node-forge';
import https from 'https';
import fs from 'fs';
import tls from 'tls';
import url from 'url';

const pki = forge.pki;

var caCertPem = fs.readFileSync('./proxy/cert/my.crt');
var caKeyPem = fs.readFileSync('./proxy/cert/my.key.pem');
var caCert = forge.pki.certificateFromPem(caCertPem);
var caKey = forge.pki.privateKeyFromPem(caKeyPem);

/**
 * 根据域名生成一个伪造的https服务
 * @param  {[type]} domain     [description]
 * @param  {[type]} successFun [description]
 * @return {[type]}            [description]
 */
export default function createFakeHttpsWebSite(domain, successFun) {
  const fakeCertObj = createFakeCertificateByDomain(caKey, caCert, domain)
  var fakeServer = new https.Server({
      key: fakeCertObj.key,
      cert: fakeCertObj.cert,
      SNICallback: (hostname, done) => {
          let certObj = createFakeCertificateByDomain(caKey, caCert, hostname)
          done(null, tls.createSecureContext({
            key: certObj.key,
            cert: certObj.cert,
              // key: pki.privateKeyToPem(certObj.key),
              // cert: pki.certificateToPem(certObj.cert)
          }))
      }
  });
  fakeServer.listen(0, () => {
      var address = fakeServer.address();
      successFun(address.port);
  });
  fakeServer.on('request', (req, res) => {
      // 解析客户端请求
      var urlObject = url.parse(req.url);
      let options =  {
          protocol: 'https:',
          hostname: req.headers.host.split(':')[0],
          method: req.method,
          port: req.headers.host.split(':')[1] || 80,
          path: urlObject.path,
          headers: req.headers
      };
      res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8'});
      res.write(`<html><body>我是伪造的: ${options.protocol}//${options.hostname} 站点</body></html>`)
      res.end();
  });
  fakeServer.on('error', (e) => {
      console.error(e);
  });
}
/**
* 根据所给域名生成对应证书
* @param  {[type]} caKey  [description]
* @param  {[type]} caCert [description]
* @param  {[type]} domain [description]
* @return {[type]}        [description]
*/
function createFakeCertificateByDomain(caKey, caCert, domain) {
  var keys = pki.rsa.generateKeyPair(2046);
  var cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = (new Date()).getTime()+'';
  cert.validity.notBefore = new Date();
  cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 1);
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);
  var attrs = [{
    name: 'commonName',
    value: domain
  }, {
    name: 'countryName',
    value: 'CN'
  }, {
    shortName: 'ST',
    value: 'GuangDong'
  }, {
    name: 'localityName',
    value: 'ShengZhen'
  }, {
    name: 'organizationName',
    value: 'https-mitm-proxy-handbook'
  }, {
    shortName: 'OU',
    value: 'https://github.com/wuchangming/https-mitm-proxy-handbook'
  }];
  cert.setIssuer(caCert.subject.attributes);
  cert.setSubject(attrs);
  cert.setExtensions([{
      name: 'basicConstraints',
      critical: true,
      cA: false
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
      decipherOnly: true
  },
  {
      name: 'subjectAltName',
      altNames: [{
        type: 2,
        value: domain
      }]
  },
  {
      name: 'subjectKeyIdentifier'
  },
  {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
  },
  {
      name:'authorityKeyIdentifier'
  }]);
  cert.sign(caKey, forge.md.sha256.create());
  return {
      key: pki.privateKeyToPem(keys.privateKey),
      cert: pki.certificateToPem(cert)
  };
}