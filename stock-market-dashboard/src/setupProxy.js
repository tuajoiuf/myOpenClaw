// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 代理新浪财经API
  app.use(
    '/api/sina',
    createProxyMiddleware({
      target: 'https://hq.sinajs.cn',
      changeOrigin: true,
      pathRewrite: {
        '^/api/sina': '', // 移除 /api 前缀
      },
      onProxyReq: function(proxyReq, req, res) {
        proxyReq.setHeader('Referer', 'https://finance.sina.com.cn/');
        proxyReq.setHeader('Origin', 'https://finance.sina.com.cn');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        // 添加额外的请求头以模拟浏览器行为
        proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        proxyReq.setHeader('Accept-Language', 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3');
        proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
        proxyReq.setHeader('Connection', 'keep-alive');
        proxyReq.setHeader('Upgrade-Insecure-Requests', '1');
      },
      onProxyRes: function(proxyRes, req, res) {
        // 添加CORS头
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Authorization';
        proxyRes.headers['Access-Control-Max-Age'] = '86400'; // 缓存预检请求24小时
        
        // 性能优化头部
        proxyRes.headers['Cache-Control'] = 'public, max-age=60'; // 缓存1分钟
        proxyRes.headers['X-Content-Type-Options'] = 'nosniff';
        proxyRes.headers['X-Frame-Options'] = 'DENY';
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
        proxyReq.setHeader('Referer', 'https://quote.eastmoney.com/');
        proxyReq.setHeader('Origin', 'https://quote.eastmoney.com');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
        proxyReq.setHeader('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8');
      },
      onProxyRes: function(proxyRes, req, res) {
        // 添加CORS头
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Authorization';
        proxyRes.headers['Access-Control-Max-Age'] = '86400';
        
        // 性能优化头部
        proxyRes.headers['Cache-Control'] = 'public, max-age=60';
        proxyRes.headers['X-Content-Type-Options'] = 'nosniff';
      }
    })
  );
};