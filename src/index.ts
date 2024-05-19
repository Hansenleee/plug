import http from 'http';

const server = http.createServer(function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('request successfully proxied!');
  res.end();
});

server.listen(5050);
