// 本地开发配置
module.exports = {
  publicPath: '/', // 本地开发使用根路径，而不是 '/wt/'
  devServer: {
    host: 'localhost', // 本地访问
    port: 8080, // 使用常规端口
    https: false, // 本地不使用HTTPS
    open: true, // 自动打开浏览器
    allowedHosts: 'all'
  }
};
