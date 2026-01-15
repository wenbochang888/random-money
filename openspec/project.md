# Project Context

## Purpose
概率与决策互动体验平台 - 一个基于 Vue 3 的趣味性与教育性并重的互动项目集合。主要功能包括：
- **死亡概率模拟器**：在不同死亡概率下模拟存活时间，使用几何分布算法精确计算，展示理论收益
- **风险抉择抽奖**：对比稳定收益（方案A：100%获得200万）与高风险博弈（方案B：99%获得2亿），支持多次抽奖和统计分析
- **随机点名器**：真随机算法实现的公平点名工具，适合课堂教学场景

项目目标是通过互动体验帮助用户理解概率、期望值和决策理论。

## Tech Stack
- **前端框架**：Vue 3.2.13（使用 Options API）
- **构建工具**：Vue CLI 5.0.0
- **开发工具**：Cursor IDE + AI辅助开发
- **样式方案**：原生 CSS3 + 渐变效果 + CSS 动画
- **状态管理**：组件内部状态管理（无 Vuex/Pinia）
- **路由方案**：自定义页面切换逻辑（不使用 vue-router）
- **数据持久化**：localStorage（可切换为后端 API）
- **HTTP 客户端**：原生 fetch API
- **部署方案**：Node.js + Nginx 反向代理

## Project Conventions

### Code Style
- **API 风格**：使用 Vue Options API（data, methods, components），而非 Composition API
- **命名规范**：
  - 组件文件：PascalCase（如 `HomePage.vue`, `DeathSimulator.vue`）
  - 服务文件：camelCase（如 `rankingService.js`）
  - 工具文件：camelCase（如 `sign.js`）
- **注释语言**：中文注释，用于说明业务逻辑和算法原理
- **代码格式**：ES6+ JavaScript，使用 const/let，箭头函数
- **变量命名**：中文变量名和英文变量名混合使用（根据上下文选择）
- **文件组织**：按功能模块组织（components/, services/, utils/）

### Architecture Patterns
- **组件化架构**：每个功能模块独立为 Vue 组件
- **服务层模式**：API 调用和数据持久化逻辑封装在 service 层（如 `rankingService.js`）
- **工具函数分离**：通用工具函数放在 utils 目录（如签名验证工具）
- **自定义路由**：在根组件 `App.vue` 中通过 `currentPage` 状态管理页面切换
- **事件通信**：使用 Vue 事件系统（`$emit`, `@event`）进行父子组件通信
- **数据适配器模式**：在 `rankingService.js` 中使用适配器模式将风险抉择抽奖数据转换为死亡模拟器格式，实现接口复用

### Testing Strategy
- 当前项目未配置测试框架
- 建议：可考虑添加 Vue Test Utils 进行组件测试
- 算法验证：通过实际运行和结果验证数学算法的正确性

### Git Workflow
- 主分支：main（根据项目结构推断）
- 提交规范：未明确指定，建议使用语义化提交信息
- 分支策略：功能开发建议使用 feature 分支

## Domain Context
- **概率计算**：使用几何分布逆变换采样方法（公式：`X = ceil(log(U) / log(1-p))`）进行死亡概率模拟
- **期望值计算**：方案A期望值200万，方案B期望值1.98亿（99% × 2亿）
- **排行榜系统**：支持按概率分组存储和查询排行榜数据，每个概率保留最多10条记录
- **API 安全**：使用签名验证机制（通过 `sign.js` 工具生成签名），防止接口被恶意调用
- **数据格式**：概率值使用科学计数法字符串标识（"1e-9", "1e-8", "1e-7", "1e-6"）
- **金额格式化**：支持中文单位格式化（元、万元、亿元、万亿元等）

## Important Constraints
- **HTTPS 要求**：生产环境必须使用 HTTPS，证书文件路径为 `/usr/local/nginx/key.pem` 和 `/usr/local/nginx/cert.pem`
- **部署路径**：生产环境 publicPath 为 `/wt/`，需要配置 Nginx 反向代理
- **端口配置**：生产环境使用端口 5656，开发环境使用端口 8080
- **API 切换**：通过 `USE_BACKEND_API` 配置项在 localStorage 和后端 API 之间切换
- **浏览器兼容性**：需要支持 ES6+ 和现代 CSS 特性（渐变、动画等）
- **数据限制**：每个概率的排行榜最多保留 10 条记录

## External Dependencies
- **后端 API**：`https://www.gdufe888.top/api/v1`
  - 接口包括：排行榜插入、查询（按概率、按用户、全部查询）
  - 所有 API 请求需要签名验证（通过 `sign.js` 生成）
  - 请求格式：签名参数放在 URL query string，数据放在 Request Body
- **Nginx**：用于生产环境反向代理和 HTTPS 配置
- **Node.js**：用于运行 Vue CLI 开发服务器和生产构建
