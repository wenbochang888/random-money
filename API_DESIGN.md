# 死亡概率模拟器 - 后端API接口文档

## 概述

本文档定义了死亡概率模拟器排行榜系统的后端API接口规范。

**当前状态：** 使用localStorage前端存储  
**目标：** 可无缝切换到后端API

---

## 配置切换

在 `src/services/rankingService.js` 中修改以下配置：

```javascript
// 是否使用后端API（true: 使用后端, false: 使用localStorage）
const USE_BACKEND_API = false;  // 改为 true 启用后端API

// 后端API基础URL（替换为实际后端地址）
const API_BASE_URL = 'https://your-api.com/api/v1';  // 替换为实际URL
```

---

## 数据模型

### RankingRecord（排行榜记录）

```typescript
interface RankingRecord {
  id: string;              // 唯一标识（由后端生成）
  userName: string;        // 用户名（"匿名用户"或实际输入的名字）
  probability: string;     // 概率标识："1e-9" | "1e-8" | "1e-7" | "1e-6"
  probabilityLabel: string;// 概率中文标签："十亿分之一" | "一亿分之一" | "千万分之一" | "百万分之一"
  survivalYears: number;   // 存活年数（小数，如 15.23）
  survivalDays: number;    // 存活天数（整数，如 5559）
  earnedMoney: string;     // 获得金额（格式化字符串，如 "481.3万亿元"）
  earnedMoneyValue: number;// 获得金额（数值，用于比较和排序）
  timestamp: string;       // 记录时间（ISO 8601格式，如 "2025-10-08T14:30:00.000Z"）
  createdAt: number;       // 创建时间戳（Unix毫秒时间戳，用于排序）
}
```

### 概率值映射

```javascript
const PROBABILITY_MAP = {
  '1e-9': '十亿分之一',
  '1e-8': '一亿分之一',
  '1e-7': '千万分之一',
  '1e-6': '百万分之一'
};
```

---

## API接口规范

### 基础URL

```
https://your-api.com/api/v1
```

### 通用响应格式

所有接口返回统一的JSON格式：

```typescript
interface APIResponse<T> {
  success: boolean;  // 请求是否成功
  data: T;          // 返回的数据
  message: string;  // 提示信息
}
```

---

## 1. 插入排行记录

### 请求

```http
POST /rankings
Content-Type: application/json
```

### 请求体

```json
{
  "userName": "小李",
  "probability": "1e-9",
  "probabilityLabel": "十亿分之一",
  "survivalYears": 15.23,
  "survivalDays": 5559,
  "earnedMoney": "481.3万亿元",
  "earnedMoneyValue": 4813000000000000
}
```

**字段说明：**
- `userName` (string, 必填): 用户名，前端已处理默认值
- `probability` (string, 必填): 概率标识
- `probabilityLabel` (string, 必填): 概率中文标签
- `survivalYears` (number, 必填): 存活年数
- `survivalDays` (number, 必填): 存活天数
- `earnedMoney` (string, 必填): 格式化金额字符串
- `earnedMoneyValue` (number, 必填): 金额数值

**注意：** 不需要传递 `id`、`timestamp` 和 `createdAt`，这些由后端自动生成。

### 响应

**成功响应（201 Created）：**

```json
{
  "success": true,
  "data": {
    "id": "1728393000000_abc123def",
    "userName": "小李",
    "probability": "1e-9",
    "probabilityLabel": "十亿分之一",
    "survivalYears": 15.23,
    "survivalDays": 5559,
    "earnedMoney": "481.3万亿元",
    "earnedMoneyValue": 4813000000000000,
    "timestamp": "2025-10-08T14:30:00.000Z",
    "createdAt": 1728393000000
  },
  "message": "记录已保存"
}
```

**失败响应（400 Bad Request）：**

```json
{
  "success": false,
  "data": null,
  "message": "缺少必填字段：userName"
}
```

### 业务逻辑要求

1. 后端需要自动生成 `id`（建议格式：时间戳_随机字符串）
2. 自动生成 `timestamp`（ISO 8601格式）
3. 自动生成 `createdAt`（Unix毫秒时间戳）
4. 对每个概率，只保留TOP 10记录（按 `survivalYears` 降序）
5. 可选：添加用户IP限制，防止刷榜

---

## 2. 查询特定概率的排行榜

### 请求

```http
GET /rankings?probability={probability}&limit={limit}
```

### 查询参数

- `probability` (string, 必填): 概率值，可选值：`1e-9` | `1e-8` | `1e-7` | `1e-6`
- `limit` (number, 可选): 返回记录数量，默认10，最大100

### 示例

```http
GET /rankings?probability=1e-9&limit=10
```

### 响应

**成功响应（200 OK）：**

```json
{
  "success": true,
  "data": {
    "probability": "1e-9",
    "records": [
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
      },
      {
        "id": "1728392000000_xyz789ghi",
        "userName": "小张",
        "probability": "1e-9",
        "probabilityLabel": "十亿分之一",
        "survivalYears": 22.45,
        "survivalDays": 8194,
        "earnedMoney": "708.5万亿元",
        "earnedMoneyValue": 7085000000000000,
        "timestamp": "2025-10-08T14:15:00.000Z",
        "createdAt": 1728392000000
      }
    ],
    "total": 2
  },
  "message": "查询成功"
}
```

**失败响应（400 Bad Request）：**

```json
{
  "success": false,
  "data": {
    "probability": "invalid",
    "records": [],
    "total": 0
  },
  "message": "无效的概率值"
}
```

### 业务逻辑要求

1. 记录按 `survivalYears` 降序排序（存活时间最长的在前）
2. 如果该概率下没有记录，返回空数组
3. `total` 字段表示该概率下的总记录数

---

## 3. 查询所有概率的排行榜

### 请求

```http
GET /rankings/all?limit={limit}
```

### 查询参数

- `limit` (number, 可选): 每个概率返回的记录数量，默认10，最大100

### 示例

```http
GET /rankings/all?limit=10
```

### 响应

**成功响应（200 OK）：**

```json
{
  "success": true,
  "data": {
    "1e-9": [
      {
        "id": "...",
        "userName": "小李",
        "survivalYears": 25.67,
        ...
      }
    ],
    "1e-8": [
      {
        "id": "...",
        "userName": "小张",
        "survivalYears": 3.45,
        ...
      }
    ],
    "1e-7": [],
    "1e-6": []
  },
  "message": "查询成功"
}
```

### 业务逻辑要求

1. 返回所有4个概率的排行榜
2. 每个概率的记录按 `survivalYears` 降序排序
3. 没有记录的概率返回空数组

---

## 4. 查询用户的所有记录

### 请求

```http
GET /rankings/user/{userName}
```

### 路径参数

- `userName` (string, 必填): 用户名（需要URL编码）

### 示例

```http
GET /rankings/user/%E5%B0%8F%E6%9D%8E  // 小李（URL编码后）
```

### 响应

**成功响应（200 OK）：**

```json
{
  "success": true,
  "data": [
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
    },
    {
      "id": "1728392000000_xyz789ghi",
      "userName": "小李",
      "probability": "1e-8",
      "probabilityLabel": "一亿分之一",
      "survivalYears": 3.45,
      "survivalDays": 1259,
      "earnedMoney": "108.9亿元",
      "earnedMoneyValue": 10890000000,
      "timestamp": "2025-10-08T14:15:00.000Z",
      "createdAt": 1728392000000
    }
  ],
  "message": "查询成功"
}
```

**用户不存在（200 OK）：**

```json
{
  "success": true,
  "data": [],
  "message": "该用户暂无记录"
}
```

### 业务逻辑要求

1. 返回该用户在所有概率下的记录
2. 按 `createdAt` 降序排序（最新的在前）
3. 用户名完全匹配（区分大小写）

---

## 错误码规范

| HTTP状态码 | 说明 | 示例 |
|-----------|------|------|
| 200 | 请求成功 | 查询操作成功 |
| 201 | 资源创建成功 | 插入记录成功 |
| 400 | 请求参数错误 | 缺少必填字段、参数格式错误 |
| 404 | 资源不存在 | 查询的用户不存在 |
| 429 | 请求频率过高 | 触发限流 |
| 500 | 服务器内部错误 | 数据库错误等 |

---

## 数据库设计建议

### 表结构（MySQL示例）

```sql
CREATE TABLE rankings (
  id VARCHAR(50) PRIMARY KEY,
  user_name VARCHAR(50) NOT NULL,
  probability VARCHAR(10) NOT NULL,
  probability_label VARCHAR(20) NOT NULL,
  survival_years DECIMAL(10, 2) NOT NULL,
  survival_days INT NOT NULL,
  earned_money VARCHAR(50) NOT NULL,
  earned_money_value BIGINT NOT NULL,
  timestamp DATETIME NOT NULL,
  created_at BIGINT NOT NULL,
  INDEX idx_probability (probability, survival_years DESC),
  INDEX idx_user_name (user_name, created_at DESC),
  INDEX idx_created_at (created_at DESC)
);
```

### 索引说明

1. `idx_probability`: 用于查询特定概率的排行榜，按存活时间降序
2. `idx_user_name`: 用于查询用户的所有记录，按创建时间降序
3. `idx_created_at`: 用于全局时间排序

---

## 性能优化建议

1. **缓存策略**
   - 使用Redis缓存TOP 10排行榜，减少数据库查询
   - 缓存过期时间：5分钟
   - 新记录插入时，清除对应概率的缓存

2. **限流策略**
   - 每个IP每分钟最多提交10次记录
   - 每个IP每秒最多查询20次排行榜

3. **数据清理**
   - 每个概率只保留TOP 1000记录
   - 定期清理超过30天的记录（保留TOP 100）

---

## 安全建议

1. **防刷榜机制**
   - 验证数据合理性（存活时间不能超过理论最大值）
   - 同一IP短时间内的相似记录标记为可疑
   - 可选：添加CAPTCHA验证

2. **XSS防护**
   - 用户名进行HTML转义
   - 限制用户名长度（最大20字符）
   - 禁止特殊字符（仅允许中文、英文、数字）

3. **SQL注入防护**
   - 使用参数化查询
   - 严格验证输入参数

---

## 测试用例

### 1. 插入记录测试

```bash
curl -X POST https://your-api.com/api/v1/rankings \
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

### 2. 查询排行榜测试

```bash
curl -X GET "https://your-api.com/api/v1/rankings?probability=1e-9&limit=10"
```

### 3. 查询所有排行榜测试

```bash
curl -X GET "https://your-api.com/api/v1/rankings/all?limit=10"
```

### 4. 查询用户记录测试

```bash
curl -X GET "https://your-api.com/api/v1/rankings/user/%E6%B5%8B%E8%AF%95%E7%94%A8%E6%88%B7"
```

---

## 切换到后端API步骤

### 第一步：修改配置

编辑 `src/services/rankingService.js`：

```javascript
const USE_BACKEND_API = true;  // 启用后端API
const API_BASE_URL = 'https://your-api.com/api/v1';  // 替换为实际URL
```

### 第二步：部署后端服务

1. 实现上述4个API接口
2. 创建数据库表
3. 配置CORS允许前端域名访问
4. 部署到服务器

### 第三步：测试

1. 确保后端API正常运行
2. 前端测试插入记录功能
3. 前端测试查询排行榜功能
4. 检查浏览器控制台是否有错误

### 第四步：数据迁移（可选）

如果需要将localStorage中的数据迁移到后端：

```javascript
// 在浏览器控制台执行
const oldData = JSON.parse(localStorage.getItem('death_simulator_rankings'));
// 遍历数据并调用API插入
```

---

## 常见问题

### Q1: 如何处理并发插入？
**A:** 后端使用数据库事务，确保同一概率下只保留TOP 10。

### Q2: 如何防止恶意刷榜？
**A:** 实现IP限流、数据验证、CAPTCHA等多层防护。

### Q3: 如何保证数据一致性？
**A:** 使用Redis缓存时，确保写入时清除缓存；使用数据库事务保证原子性。

### Q4: 如何优化查询性能？
**A:** 使用索引、缓存、限制返回数量等方式优化。

---

## 联系方式

如有疑问，请联系：
- GitHub: https://github.com/wenbochang888/random-money
- 微信公众号: 程序员博博

---

**文档版本:** 1.0  
**最后更新:** 2025-10-08

