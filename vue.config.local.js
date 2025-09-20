module.exports = {
  publicPath: '/', // 本地开发使用根路径
  devServer: {
    host: 'localhost',
    port: 8080,
    https: false, // 本地不使用HTTPS
    open: true // 自动打开浏览器
  }
};
