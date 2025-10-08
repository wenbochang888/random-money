# 排行榜功能使用说明

## 🎉 功能概述

死亡概率模拟器现已支持排行榜功能！你可以：

1. ✅ 输入自己的名字（或留空使用"匿名用户"）
2. ✅ 选择概率进行模拟
3. ✅ 自动保存记录到排行榜
4. ✅ 查看当前概率下的TOP 10排行
5. ✅ 切换概率自动加载对应排行榜

---

## 📁 新增文件

### 1. `src/services/rankingService.js`
排行榜服务层，负责数据存储和查询。

**核心功能：**
- `insertRanking(recordData)` - 插入排行记录
- `getRankingByProbability(probability, limit)` - 查询特定概率的排行榜
- `getAllRankings(limit)` - 查询所有概率的排行榜
- `getRankingsByUser(userName)` - 查询用户的所有记录

**配置项：**
```javascript
const USE_BACKEND_API = false;  // false=使用localStorage, true=使用后端API
const API_BASE_URL = 'https://your-api.com/api/v1';  // 后端API地址
```

### 2. `API_DESIGN.md`
后端API接口文档，包含：
- 完整的API接口规范
- 数据模型定义
- 数据库设计建议
- 切换到后端的步骤
- 测试用例

---

## 🔧 修改文件

### `src/components/DeathSimulator.vue`

**新增功能：**
1. 用户名输入框（在概率选择器上方）
2. 排行榜展示区域（在页面底部）
3. 自动保存模拟结果到排行榜
4. 切换概率时自动加载对应排行榜

**新增数据字段：**
- `userName` - 用户输入的名字
- `rankings` - 当前概率的排行榜数据

**新增方法：**
- `loadRankings()` - 加载排行榜数据
- `saveToRanking()` - 保存记录到排行榜
- `formatDate()` - 格式化日期显示
- `getRankClass()` - 获取排名样式类

**新增生命周期钩子：**
- `mounted()` - 组件加载时获取排行榜
- `watch: selectedProbability.key` - 监听概率变化，重新加载排行榜

---

## 🎮 使用方法

### 1. 启动项目

```bash
npm run serve
```

### 2. 使用排行榜

1. 打开死亡概率模拟器页面
2. 在"请输入你的名字"输入框中输入你的名字（可留空）
3. 选择一个概率（默认：十亿分之一）
4. 点击"开始模拟"
5. 查看结果和获得的金额
6. 自动保存到排行榜，页面底部显示TOP 10

### 3. 查看不同概率的排行榜

- 点击不同的概率按钮，排行榜会自动切换显示对应概率的TOP 10
- 每个概率维护独立的排行榜

---

## 💾 数据存储

### 当前方案：localStorage

**优点：**
- ✅ 无需后端，快速实现
- ✅ 数据持久化，刷新页面不丢失
- ✅ 完全免费，无需服务器

**限制：**
- ❌ 数据存储在浏览器本地
- ❌ 每个用户只能看到自己浏览器的排行榜
- ❌ 换浏览器/设备后看不到之前的数据
- ❌ 无法与其他用户共享排行榜

**存储位置：**
- 浏览器 localStorage
- 键名：`death_simulator_rankings`
- 每个概率保留TOP 10记录

**查看存储数据（浏览器控制台）：**
```javascript
// 查看所有排行数据
console.log(JSON.parse(localStorage.getItem('death_simulator_rankings')));

// 清空排行数据
localStorage.removeItem('death_simulator_rankings');
```

---

## 🚀 切换到后端API

如果你想实现全局共享的排行榜，需要部署后端服务。

### 快速切换步骤

1. **部署后端服务**
   - 参考 `API_DESIGN.md` 实现4个API接口
   - 创建数据库表
   - 部署到服务器（如：Vercel、Railway、Heroku）

2. **修改前端配置**
   
   编辑 `src/services/rankingService.js`：
   ```javascript
   const USE_BACKEND_API = true;  // 启用后端API
   const API_BASE_URL = 'https://your-api.com/api/v1';  // 替换为实际后端地址
   ```

3. **重新构建前端**
   ```bash
   npm run build
   ```

4. **部署并测试**

### 免费后端方案推荐

#### 方案1：Vercel + Vercel Postgres
- ✅ 完全免费
- ✅ 部署简单
- ✅ 自动HTTPS
- 📖 教程：https://vercel.com/docs/storage/vercel-postgres

#### 方案2：Supabase（推荐）
- ✅ 免费额度足够个人使用
- ✅ 提供REST API和客户端SDK
- ✅ 自带管理界面
- 📖 教程：https://supabase.com/docs

#### 方案3：Railway + PostgreSQL
- ✅ 免费额度 $5/月
- ✅ 支持多种数据库
- ✅ 部署简单
- 📖 教程：https://docs.railway.app/

---

## 🎨 排行榜UI

### 排行榜表格

| 排名 | 用户名 | 存活时间 | 获得金额 | 记录时间 |
|------|--------|----------|----------|----------|
| 🥇 | 小李 | 25.67 年 (9370 天) | 810.2万亿元 | 2025-10-08 14:30 |
| 🥈 | 小张 | 22.45 年 (8194 天) | 708.5万亿元 | 2025-10-08 14:15 |
| 🥉 | 小王 | 18.90 年 (6899 天) | 596.6万亿元 | 2025-10-08 14:00 |

### 设计特点

- 🥇 前三名使用金银铜牌图标
- 🎨 前三名行背景高亮（金色渐变）
- 📱 响应式设计，移动端自适应
- 🌈 紫色渐变主题，与整体风格统一

---

## 🧪 测试

### 测试场景

1. **测试插入记录**
   - 输入名字：小李
   - 选择概率：十亿分之一
   - 运行模拟
   - ✅ 检查排行榜是否出现记录

2. **测试匿名用户**
   - 不输入名字（留空）
   - 运行模拟
   - ✅ 检查排行榜显示"匿名用户"

3. **测试切换概率**
   - 选择"一亿分之一"
   - ✅ 检查排行榜是否切换到对应数据

4. **测试数据持久化**
   - 运行模拟并保存记录
   - 刷新页面
   - ✅ 检查排行榜数据是否保留

5. **测试TOP 10限制**
   - 运行超过10次模拟
   - ✅ 检查排行榜是否只显示前10名

---

## 📊 数据示例

### localStorage存储格式

```json
{
  "1e-9": [
    {
      "id": "1728393000000_abc123def",
      "userName": "小李",
      "probability": "1e-9",
      "probabilityLabel": "十亿分之一",
      "survivalYears": 25.67,
      "survivalDays": 9370,
      "earnedMoney": "810.2万亿元",
      "earnedMoneyValue": 8102000000000000,
      "timestamp": "2025-10-08T14:30:00.000Z",
      "createdAt": 1728393000000
    }
  ],
  "1e-8": [],
  "1e-7": [],
  "1e-6": []
}
```

---

## ⚠️ 注意事项

1. **浏览器兼容性**
   - 需要支持localStorage的现代浏览器
   - 建议使用Chrome、Firefox、Safari、Edge

2. **隐私模式**
   - 浏览器隐私/无痕模式下，关闭浏览器后localStorage会被清空

3. **存储限制**
   - localStorage通常限制为5-10MB
   - 当前实现每个概率最多10条记录，远低于限制

4. **数据清理**
   - 如需清空排行榜，在浏览器控制台执行：
     ```javascript
     localStorage.removeItem('death_simulator_rankings');
     ```

---

## 🐛 故障排查

### 问题1：排行榜不显示

**可能原因：**
- 浏览器不支持localStorage
- localStorage被禁用
- 数据损坏

**解决方法：**
1. 打开浏览器控制台（F12）
2. 查看是否有错误信息
3. 尝试清空localStorage重新测试

### 问题2：保存记录失败

**可能原因：**
- localStorage已满
- 浏览器权限限制

**解决方法：**
1. 清理浏览器缓存和localStorage
2. 检查浏览器隐私设置
3. 尝试其他浏览器

### 问题3：切换概率后排行榜不更新

**可能原因：**
- Vue响应式数据未更新

**解决方法：**
1. 刷新页面
2. 检查浏览器控制台错误
3. 如问题持续，提交issue

---

## 🔮 未来规划

### 短期计划
- [ ] 添加搜索功能（按用户名搜索）
- [ ] 添加筛选功能（按时间范围筛选）
- [ ] 添加分享功能（分享自己的记录）

### 长期计划
- [ ] 接入真实后端API
- [ ] 实现全球排行榜
- [ ] 添加用户系统
- [ ] 添加成就系统
- [ ] 添加社交功能

---

## 📞 联系方式

如有疑问或建议，请联系：
- **GitHub:** https://github.com/wenbochang888/random-money
- **微信公众号:** 程序员博博

---

**版本:** 1.0.0  
**更新日期:** 2025-10-08  
**作者:** AI Assistant

