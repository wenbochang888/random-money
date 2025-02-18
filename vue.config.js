const fs = require('fs');
module.exports = {
  publicPath: '/wt/',
  devServer: {
    host: '0.0.0.0',
    port: 5656,
    allowedHosts: 'all'}
  // },
  // https: {
  //   key: fs.readFileSync('/usr/local/nginx/key.pem'),
  //   cert: fs.readFileSync('/usr/local/nginx/cert.pem'),
  // },
  // proxy: {
  //   '/wt': {
  //     target: 'http://101.33.233.214:5656/',
  //     ws: true,
  //     changeOrigin: true
  //   }
  // }
};
