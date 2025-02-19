const fs = require('fs');
const express = require('express');
const https = require('https');
const http = require('http');

const app = express();
const httpsOptions = {
  key: fs.readFileSync('/usr/local/nginx/key.pem'),
  cert: fs.readFileSync('/usr/local/nginx/cert.pem')
};

module.exports = {
  publicPath: '/wt/',
  devServer: {
    host: '0.0.0.0',
    port: 5656,
    https: httpsOptions,
    allowedHosts: 'all',
    before: function(app, server, compiler) {
      // Create an HTTP server
      http.createServer(app).listen(5657, () => {
        console.log('HTTP server running on port 5657');
      });
    }
  }
};
