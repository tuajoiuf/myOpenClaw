// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 代理新浪财经API
  app.use(
    '/api/sina',
    createProxyMiddleware({
      target: 'https://vip.stock.finance.sina.com.cn',
      changeOrigin: true,
      pathRewrite: {
        '^/api/sina': '', // 移除 /api 前缀
      },
      onProxyReq: function(proxyReq, req, res) {
        // 设置更真实的浏览器请求头
        proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
        proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
        proxyReq.setHeader('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8');
        proxyReq.setHeader('Cache-Control', 'no-cache');
        proxyReq.setHeader('Pragma', 'no-cache');
        proxyReq.setHeader('Connection', 'keep-alive');
        proxyReq.setHeader('Upgrade-Insecure-Requests', '1');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        proxyReq.setHeader('Referer', 'https://finance.sina.com.cn/');
        proxyReq.setHeader('Origin', 'https://finance.sina.com.cn');
      },
      onProxyRes: function(proxyRes, req, res) {
        // 添加CORS头
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Authorization';
        proxyRes.headers['Access-Control-Max-Age'] = '86400';
        
        // 移除可能的安全头以避免冲突
        delete proxyRes.headers['X-Frame-Options'];
        delete proxyRes.headers['X-Content-Type-Options'];
        
        // 设置缓存头以提高性能（短时间缓存）
        proxyRes.headers['Cache-Control'] = 'public, max-age=30'; // 缓存30秒
      },
      onError: function(err, req, res) {
        console.error('Proxy error for sina API:', err);
        // 发送降级响应
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Proxy error for sina API', fallback: true }));
      }
    })
  );

  // 代理东财API
  app.use(
    '/api/eastmoney',
    createProxyMiddleware({
      target: 'https://push2.eastmoney.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/eastmoney': '', // 移除 /api 前缀
      },
      onProxyReq: function(proxyReq, req, res) {
        proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
        proxyReq.setHeader('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        proxyReq.setHeader('Referer', 'https://quote.eastmoney.com/');
        proxyReq.setHeader('Origin', 'https://quote.eastmoney.com');
        proxyReq.setHeader('Cache-Control', 'no-cache');
      },
      onProxyRes: function(proxyRes, req, res) {
        // 添加CORS头
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Authorization';
        proxyRes.headers['Access-Control-Max-Age'] = '86400';
        
        // 设置缓存头
        proxyRes.headers['Cache-Control'] = 'public, max-age=30';
      },
      onError: function(err, req, res) {
        console.error('Proxy error for eastmoney API:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Proxy error for eastmoney API', fallback: true }));
      }
    })
  );
  
  // 添加一个健康检查端点
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
};