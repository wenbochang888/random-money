## [体验地址点我](https://www.gdufe888.top/wt/)


## 前言
> 女朋友：你看看人家男朋友，用deepseek给她做了一个随机点名，积分统计系统你呢？
> 
> 我：啊，就这，她这个视频也太简单了吧。我给你做一个更高大上的，可以导入，增加，删除，还给你部署到服务器上面，还把**你的名字无处不在的印到上面**
> 
> 女朋友：别bb，那你做啊
> 
> 我：啊，你在质疑我，虽然我是后端，但前端使用cursor还是可以搞定的吧

持续了一个下午，vue第一次部署还不简单，整了挺久的，先看效果

![1.png](src/assets/img/1.png)

![2.png](src/assets/img/2.png)

## cursor为主，deepseek为辅
基本大部分代码是cursor开发，毕竟我对前端还不是很熟悉。
1. 首先第一步使用cursor的compose把整个vue的框架搭建起来
2. 使用cursor的chat功能，一直和他提问让他修改即可(吐槽一句，一直让他改界面配色，一直修改不过来，有点笨)
3. cursor不能解决的问题，这时候就deepseek出场了，把代码给deepseek或者chatGPT，让他帮你修改，最终成品


## 部署发布
1. 将代码传到linux服务器上面
2. 使用node部署，vue的https限制真多，搞了好多才搞定，第一次真心难搞定
3. 配置nginx反向代理
4. 最终发布部署


## 最后
1. [体验地址点我](https://www.gdufe888.top/wt/
2. [源代码点我](https://www.gdufe888.top/wt/)


--------------------------------------------------------

发布部署
1. nohup npm run serve > /root/logs/vue/dm.log 2>&1 &
2. npm run serve 
3. 验证配置文件  /usr/local/nginx/sbin/nginx -t
4. 重新加载配置文件  /usr/local/nginx/sbin/nginx -s reload
