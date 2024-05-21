import http from 'http';
// var httpProxy = require('http-proxy');
// const url = require('url');
//
// Create your proxy server and set the target in the options.
//
// var proxy = httpProxy.createProxyServer({})

//
// Create your target server
//
http.createServer(function (req, res) {
  // console.log(11111, req.url);
  // // proxy.web(req, res, { target: 'http://jsonplaceholder.typicode.com/posts' });
  // res.writeHead(200, { 'Content-Type': 'text/plain' });
  // res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
  // res.end();
  console.log(`HTTP request: ${req.method} ${req.url}`);
  res.end('o hai! http');
  // 解析请求 URL
  // const { hostname, port, path } = url.parse(req.url);
  // // 创建一个向目标服务器的 HTTP 请求
  // const proxyReq = http.request({
  //   hostname,
  //   port,
  //   path,
  //   method: req.method,
  //   headers: req.headers,
  // }, (proxyRes) => {
  //   console.log(`HTTP response: ${proxyRes.statusCode}`);
  //   res.writeHead(proxyRes.statusCode, proxyRes.headers);
  //   proxyRes.pipe(res);
  // });
  // req.pipe(proxyReq);
}).listen(9000);