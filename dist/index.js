import httpProxy from 'http-proxy';
import http from 'http';
const proxy = httpProxy.createProxyServer({});
const server = http.createServer(function (req, res) {
    proxy.web(req, res, { target: 'http://127.0.0.1:5050' });
});
server.listen(5050);
