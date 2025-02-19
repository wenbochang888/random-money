const fs = require('fs');
const https = require('https');

module.exports = {
  publicPath: '/wt/',
  devServer: {
    host: '0.0.0.0',
    port: 5656,
    https: {
      key: fs.readFileSync('/usr/local/nginx/key.pem'),
      cert: fs.readFileSync('/usr/local/nginx/cert.pem')
    },
    allowedHosts: 'all',
    proxy: {
      '^/wt': {
        target: 'http://www.gdufe888.top:5656',
        ws: true, // 启用 WebSocket 代理
        changeOrigin: true,
        secure: false
      }
    }
  }
};
