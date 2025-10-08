# 排行榜功能调试指南

## 🐛 问题：模拟完成后没有插入记录

### ✅ 已完成的修复

1. ✅ 在 `insertRankingAPI` 中添加了详细的请求日志
2. ✅ 在 `insertRankingAPI` 中添加了HTTP状态码检查
3. ✅ 在 `saveToRanking` 中添加了完整的调试日志
4. ✅ 添加了失败时的 alert 提示

---

## 🔍 调试步骤

### 第一步：打开浏览器控制台

1. 按 `F12` 打开开发者工具
2. 切换到 `Console` 标签
3. 清空之前的日志（点击🚫图标）

### 第二步：进行模拟测试

1. 在页面上输入用户名（或留空）
2. 选择一个概率（如：十亿分之一）
3. 点击"开始模拟"按钮
4. 等待模拟完成

### 第三步：查看控制台日志

模拟完成后，控制台应该输出以下日志序列：

```
===== saveToRanking 方法被调用 =====
准备保存的数据: {
  userName: "测试用户",
  probability: "1e-9",
  probabilityLabel: "十亿分之一",
  survivalYears: 15.23,
  survivalDays: 5559,
  earnedMoney: "481.3万亿元",
  earnedMoneyValue: 4813000000000000
}
开始调用 insertRanking...
===== 开始发送插入请求 =====
请求URL: http://localhost:8099/api/v1/rankings
请求数据: {
  "userName": "测试用户",
  "probability": "1e-9",
  "probabilityLabel": "十亿分之一",
  "survivalYears": 15.23,
  "survivalDays": 5559,
  "earnedMoney": "481.3万亿元",
  "earnedMoneyValue": 4813000000000000
}
响应状态码: 201
响应状态文本: Created
响应数据: {
  "success": true,
  "data": { ... },
  "message": "记录已保存"
}
===== 插入请求成功 =====
insertRanking 返回结果: { success: true, data: {...}, message: "记录已保存" }
✅ 记录已成功保存到排行榜
```

---

## 📋 问题排查检查表

### 1. 检查是否调用了 saveToRanking

**期望日志：**
```
===== saveToRanking 方法被调用 =====
```

**如果没有这条日志：**
- ❌ 说明 `runSingleSimulation()` 没有调用 `saveToRanking()`
- 🔧 检查 `runSingleSimulation()` 方法的最后是否有 `await this.saveToRanking();`

---

### 2. 检查数据是否准备完成

**期望日志：**
```
准备保存的数据: { userName: "...", probability: "1e-9", ... }
```

**如果数据有问题：**
- ❌ `earnedMoneyValue` 为 `NaN` 或 `undefined`
- 🔧 检查 `earnedMoneyValue` 计算属性
- ❌ `survivalDays` 格式错误
- 🔧 检查 `equivalentDays` 计算属性

---

### 3. 检查是否发送了HTTP请求

**期望日志：**
```
===== 开始发送插入请求 =====
请求URL: http://localhost:8099/api/v1/rankings
```

**如果没有这条日志：**
- ❌ `insertRanking()` 函数没有被调用
- 🔧 检查 `USE_BACKEND_API` 是否为 `true`
- 🔧 检查 `insertRanking()` 的导入是否正确

---

### 4. 检查后端是否收到请求

**在后端日志中查找：**
```java
收到插入排行记录请求: userName=测试用户, probability=1e-9, survivalYears=15.23
```

**如果后端没收到：**
- ❌ 网络请求被拦截或失败
- 🔧 检查浏览器 Network 标签，查看请求状态
- 🔧 检查后端服务是否在 8099 端口运行
- 🔧 检查防火墙或代理设置

---

### 5. 检查后端响应

**期望日志：**
```
响应状态码: 201
响应数据: { "success": true, ... }
```

**如果状态码不是 201：**
- ❌ `400 Bad Request` - 请求参数错误
  - 🔧 检查后端字段名是否匹配（驼峰命名）
  - 🔧 检查数据类型是否匹配
- ❌ `500 Internal Server Error` - 后端代码错误
  - 🔧 查看后端错误日志
  - 🔧 检查数据库连接

**如果 success 为 false：**
- 🔧 查看 `message` 字段的错误信息
- 🔧 根据错误信息修复后端逻辑

---

## 🔧 常见问题解决

### 问题1：控制台没有任何日志

**原因：** `saveToRanking()` 没有被调用

**解决：**
1. 检查 `src/components/DeathSimulator.vue` 的 `runSingleSimulation()` 方法
2. 确认最后有这行代码：
```javascript
// 保存记录到排行榜
await this.saveToRanking();
```

---

### 问题2：显示"没有模拟结果，跳过保存"

**原因：** `this.singleResult` 为空

**解决：**
1. 检查 `runSingleSimulation()` 是否正确设置了 `this.singleResult`
2. 确认代码顺序：
```javascript
this.singleResult = finalYearsLived.toFixed(2);  // 先设置结果
this.isRunning = false;
await this.saveToRanking();  // 再保存
```

---

### 问题3：earnedMoneyValue 为 NaN

**原因：** 计算属性依赖的数据未就绪

**解决：**
检查 `earnedMoneyValue` 计算属性：
```javascript
earnedMoneyValue() {
  if (!this.singleResult) return 0;
  
  const years = parseFloat(this.singleResult);
  const seconds = years * this.SECONDS_PER_YEAR;
  const milliseconds = seconds * 1000;
  return milliseconds * 100000000; // 每毫秒1亿
}
```

---

### 问题4：后端报错"缺少必填字段"

**原因：** 前后端字段名不匹配

**后端期望（驼峰命名）：**
```java
private String userName;          // ✅ 驼峰
private String probability;
private String probabilityLabel;
private Double survivalYears;
private Integer survivalDays;
private String earnedMoney;
private Long earnedMoneyValue;
```

**前端发送的字段名（检查）：**
```javascript
{
  userName: "...",           // ✅ 驼峰
  probability: "...",
  probabilityLabel: "...",
  survivalYears: 15.23,
  survivalDays: 5559,
  earnedMoney: "...",
  earnedMoneyValue: 123456789
}
```

如果后端使用下划线命名（`user_name`），需要修改前端：
```javascript
const recordData = {
  user_name: this.userName.trim() || '匿名用户',  // 改为下划线
  // ...
};
```

---

### 问题5：后端报错"数据类型不匹配"

**检查数据类型：**

| 字段 | 前端类型 | 后端期望类型 |
|------|---------|-------------|
| survivalYears | number | Double/Float |
| survivalDays | number | Integer |
| earnedMoneyValue | number | Long/BigDecimal |

**注意：** JavaScript 的 number 类型对于超大整数可能丢失精度！

如果 `earnedMoneyValue` 超过 `Number.MAX_SAFE_INTEGER` (2^53 - 1)，需要使用字符串：

```javascript
earnedMoneyValue: this.earnedMoneyValue.toString()  // 转为字符串
```

后端使用 `BigDecimal` 或 `String` 接收。

---

## 🧪 手动测试API

### 使用 curl 测试后端

```bash
curl -X POST http://localhost:8099/api/v1/rankings \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "测试用户",
    "probability": "1e-9",
    "probabilityLabel": "十亿分之一",
    "survivalYears": 15.23,
    "survivalDays": 5559,
    "earnedMoney": "481.3万亿元",
    "earnedMoneyValue": 4813000000000000
  }'
```

**期望响应：**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "userName": "测试用户",
    ...
  },
  "message": "记录已保存"
}
```

---

### 在浏览器控制台测试

```javascript
fetch('http://localhost:8099/api/v1/rankings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userName: '测试用户',
    probability: '1e-9',
    probabilityLabel: '十亿分之一',
    survivalYears: 15.23,
    survivalDays: 5559,
    earnedMoney: '481.3万亿元',
    earnedMoneyValue: 4813000000000000
  })
})
.then(res => res.json())
.then(data => console.log('成功:', data))
.catch(err => console.error('失败:', err));
```

---

## 📊 Network 标签检查

1. 打开 Chrome DevTools → Network 标签
2. 点击"开始模拟"
3. 模拟完成后，查找 `rankings` 请求

**正常情况：**
- Status: `201 Created`
- Type: `fetch`
- Method: `POST`

**点击该请求查看详情：**
- **Headers** → Request Headers → 查看 Content-Type
- **Payload** → 查看发送的数据
- **Response** → 查看返回的数据

---

## 🎯 最终检查清单

- [ ] 控制台输出 "saveToRanking 方法被调用"
- [ ] 控制台输出 "开始发送插入请求"
- [ ] Network 标签显示 POST /rankings 请求
- [ ] 后端日志显示收到请求
- [ ] 响应状态码为 201
- [ ] 响应 success 为 true
- [ ] 排行榜自动刷新显示新记录

---

## 💡 调试技巧

### 1. 添加断点

在 Chrome DevTools 中：
1. Sources 标签 → 找到 `DeathSimulator.vue`
2. 在 `saveToRanking()` 方法的第一行添加断点
3. 点击"开始模拟"
4. 代码执行到断点时暂停，逐步调试

### 2. 查看变量值

在断点暂停时：
- 鼠标悬停在变量上查看值
- 在 Console 中输入变量名（如 `this.singleResult`）
- 查看 Scope 面板的变量列表

### 3. 逐步执行

- `F10` (Step Over) - 执行下一行
- `F11` (Step Into) - 进入函数内部
- `Shift+F11` (Step Out) - 跳出当前函数

---

## 📞 如果问题仍未解决

请提供以下信息：

1. **完整的控制台日志**（从点击模拟到结束）
2. **Network 标签截图**（显示 rankings 请求）
3. **后端日志**（是否收到请求）
4. **浏览器和版本**（Chrome 120、Firefox 121等）
5. **前端端口**（如 8080）
6. **后端端口**（如 8099）

---

**文档版本：** 1.0  
**更新时间：** 2025-10-08

