const fs = require('fs');
const path = require('path');

// 检查是否为生产环境或证书文件是否存在
const isProduction = process.env.NODE_ENV === 'production';
const certKeyPath = '/usr/local/nginx/key.pem';
const certPath = '/usr/local/nginx/cert.pem';
const hasCerts = fs.existsSync(certKeyPath) && fs.existsSync(certPath);

module.exports = {
  publicPath: isProduction ? '/wt/' : '/',
  devServer: {
    host: isProduction ? '0.0.0.0' : 'localhost',
    port: isProduction ? 5656 : 8080,
    https: hasCerts && isProduction ? {
      key: fs.readFileSync(certKeyPath),
      cert: fs.readFileSync(certPath)
    } : false,
    allowedHosts: 'all',
    open: !isProduction // 本地开发时自动打开浏览器
  }
};
