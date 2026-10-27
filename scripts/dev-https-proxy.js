const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const LISTEN_PORT = 9443;
const TARGET_PORT = 9002;
const TARGET_HOST = '127.0.0.1';

const keyPath = path.join(__dirname, '../.certs/dev.key');
const certPath = path.join(__dirname, '../.certs/dev.crt');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('[HTTPS Proxy] Error: SSL cert or key not found in .certs/');
  process.exit(1);
}

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const server = https.createServer(options, (req, res) => {
  const clientHost = req.headers['host'] || '192.168.1.190:9443';
  const proxyReq = http.request(
    {
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        'host': clientHost,
        'x-forwarded-host': clientHost,
        'x-forwarded-proto': 'https',
        'x-forwarded-port': clientHost.split(':')[1] || '9443',
        'x-forwarded-for': req.socket.remoteAddress || '127.0.0.1',
      },
    },
    (proxyRes) => {
      const headers = { ...proxyRes.headers };
      if (headers.location) {
        headers.location = headers.location
          .replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, `https://${clientHost}`)
          .replace(/^http:\/\//i, 'https://');
      }
      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  proxyReq.on('error', (err) => {
    console.error('[HTTPS Proxy Request Error]:', err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('502 Bad Gateway: Local Next.js dev server (port 9002) is not responding.');
    }
  });

  req.pipe(proxyReq, { end: true });
});

// 支持 WebSocket (HMR / 热更新)
server.on('upgrade', (req, clientSocket, head) => {
  const serverSocket = net.connect(TARGET_PORT, TARGET_HOST, () => {
    clientSocket.write('HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n\r\n');
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', () => {
    clientSocket.destroy();
  });
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`[HTTPS Proxy] Listening on 0.0.0.0:${LISTEN_PORT} -> forwarding to ${TARGET_HOST}:${TARGET_PORT}`);
  console.log(`[HTTPS Proxy] Test URL on Mobile / HarmonyOS: https://172.25.85.178:${LISTEN_PORT}`);
});
