// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 代理腾讯财经API
  app.use(
    '/api/stock',
    createProxyMiddleware({
      target: 'https://proxy.finance.qq.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/stock': '', // 移除 /api 前缀
      },
      onProxyReq: function(proxyReq, req, res) {
        proxyReq.setHeader('Referer', 'https://finance.qq.com/');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
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
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      }
    })
  );
};