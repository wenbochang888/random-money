module.exports = {
  publicPath: './',
  devServer: {
    port: 5656,
    proxy: {
      '/wt': {
        target: 'http://127.0.0.1:5656',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/wt': ''
        }
      }
    }
  }
};
