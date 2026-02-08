#!/usr/bin/env node

const http = require('http');

// 创建一个简单的代理服务器，将请求转发到React开发服务器
const server = http.createServer((req, res) => {
  // 设置目标服务器（React开发服务器）
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, {
      end: true
    });
  });

  req.pipe(proxyReq, {
    end: true
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('Proxy error');
  });
});

const PORT = 3005;
server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}, forwarding to port 3000`);
});