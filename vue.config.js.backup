const fs = require('fs');

module.exports = {
  publicPath: '/wt/',
  devServer: {
    host: '0.0.0.0',
    port: 5656,
    https: {
      key: fs.readFileSync('/usr/local/nginx/key.pem'),
      cert: fs.readFileSync('/usr/local/nginx/cert.pem')
    },
    allowedHosts: 'all'
  }
};
