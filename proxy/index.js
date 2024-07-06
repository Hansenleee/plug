import http from 'http';
import url from 'url';
import net from 'net';
import createFakeHttpsWebSite from './createFakeHttpsWebSite.js';

let httpTunnel = new http.Server();
// 启动端口
let port = 8001;
httpTunnel.listen(port, () => {
    console.log(`简易HTTPS中间人代理启动成功，端口：${port}`);
});
httpTunnel.on('error', (e) => {
    if (e.code == 'EADDRINUSE') {
        console.error('HTTP中间人代理启动失败！！');
        console.error(`端口：${port}，已被占用。`);
    } else {
        console.error(e);
    }
});
// https的请求通过http隧道方式转发
httpTunnel.on('connect', (req, cltSocket, head) => {
  // connect to an origin server
  var srvUrl = url.parse(`http://${req.url}`);
  console.log(`CONNECT ${srvUrl.hostname}:${srvUrl.port}`);
  // 根据域名生成对应的https服务
  createFakeHttpsWebSite(srvUrl.hostname, (port) => {
      var srvSocket = net.connect(port, '127.0.0.1', () => {
        cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                        'Proxy-agent: MITM-proxy\r\n' +
                        '\r\n');
        srvSocket.write(head);
        srvSocket.pipe(cltSocket);
        cltSocket.pipe(srvSocket);
      });
      srvSocket.on('error', (e) => {
          console.error(e);
      });
  })
});