const fs = require('fs');

try {
      const key = fs.readFileSync('/usr/local/nginx/key.pem');
        const cert = fs.readFileSync('/usr/local/nginx/cert.pem');
          console.log('Key and Cert read successfully');
} catch (err) {
      console.error('Error reading key or cert:', err);
}

module.exports = {
  publicPath: './',
  devServer: {
    host: '0.0.0.0',
    port: 5656,
    allowedHosts: 'all',
    https: {
        key: fs.readFileSync('/usr/local/nginx/key.pem'),
        cert: fs.readFileSync('/usr/local/nginx/cert.pem'),
    },
    proxy: {
      '/wt': {
        target: 'https://localhost:5656',
        ws: true,
        changeOrigin: true
      }
    }
  }
};
