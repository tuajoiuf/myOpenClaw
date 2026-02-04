// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/stock',
    createProxyMiddleware({
      target: 'https://hq.sinajs.cn',
      changeOrigin: true,
      pathRewrite: {
        '^/api/stock': '/', // 移除 /api/stock 前缀
      },
      onProxyReq: function (proxyReq, req, res) {
        proxyReq.setHeader('Referer', 'https://finance.sina.com.cn/');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      }
    })
  );
  
  app.use(
    '/api/eastmoney',
    createProxyMiddleware({
      target: 'http://push2.eastmoney.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/eastmoney': '/', // 移除 /api/eastmoney 前缀
      },
      onProxyReq: function (proxyReq, req, res) {
        proxyReq.setHeader('Referer', 'https://quote.eastmoney.com/');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      }
    })
  );
};