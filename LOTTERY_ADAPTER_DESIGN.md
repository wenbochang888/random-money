# 风险抉择抽奖复用死亡模拟器接口 - 适配方案

## 📋 需求背景

**目标：** 让风险抉择抽奖复用死亡概率模拟器的后端接口，避免后端开发新接口。

**约束：** 
- ✅ 不修改后端接口
- ✅ 保持前端组件接口不变
- ✅ 数据存储格式统一

---

## 🔄 数据映射设计

### 死亡模拟器接口规范

**接口：** `POST /api/v1/rankings`

**数据模型：**
```typescript
interface RankingRecord {
  userName: string;           // 用户名
  probability: string;        // 概率标识
  probabilityLabel: string;   // 概率中文标签
  survivalYears: number;      // 存活年数
  survivalDays: number;       // 存活天数
  earnedMoney: string;        // 格式化金额
  earnedMoneyValue: string;   // 金额数值（字符串）
}
```

### 风险抉择抽奖数据格式

**原始数据：**
```typescript
interface LotteryData {
  lotteryTimes: number;       // 抽奖次数：1, 10, 100, 1000, 10000
  lotteryTimesLabel: string;  // "单次抽奖", "10次抽奖"...
  totalAmountB: number;       // 方案B总收益
  winCount: number;           // 成功次数
  loseCount: number;          // 失败次数
  winRate: number;            // 成功率（百分比）
}
```

### 字段映射关系

| 风险抉择抽奖 | → | 死亡模拟器 | 说明 |
|-------------|---|-----------|------|
| lotteryTimes | → | probability | 使用 `"lottery-{次数}"` 作为标识<br>如：`lottery-1`, `lottery-10`, `lottery-100` |
| lotteryTimesLabel | → | probabilityLabel | 直接映射<br>"单次抽奖" → "单次抽奖" |
| totalAmountB | → | earnedMoneyValue | 总收益数值（转为字符串） |
| totalAmountB | → | earnedMoney | 格式化为中文金额 + 成功率<br>如：`"19.8亿元 (99.0%)"` |
| winCount | → | survivalYears | 复用字段：存储成功次数 |
| loseCount | → | survivalDays | 复用字段：存储失败次数 |
| winRate | → | earnedMoney | 嵌入在金额字符串中<br>格式：`金额 (成功率%)` |

---

## 🛠️ 实现方案

### 1. 适配器函数

#### 正向转换（风险抉择 → 死亡模拟器）

```javascript
function adaptLotteryToRankingFormat(lotteryData) {
  const probability = `lottery-${lotteryData.lotteryTimes}`;
  const earnedMoney = formatMoneyForLottery(lotteryData.totalAmountB);
  const earnedMoneyWithRate = `${earnedMoney} (${lotteryData.winRate.toFixed(1)}%)`;
  
  return {
    userName: '匿名用户',
    probability: probability,
    probabilityLabel: lotteryData.lotteryTimesLabel,
    survivalYears: lotteryData.winCount,
    survivalDays: lotteryData.loseCount,
    earnedMoney: earnedMoneyWithRate,
    earnedMoneyValue: lotteryData.totalAmountB.toString()
  };
}
```

#### 反向转换（死亡模拟器 → 风险抉择）

```javascript
function adaptRankingToLotteryFormat(rankingRecord) {
  const lotteryTimes = rankingRecord.probability.replace('lottery-', '');
  const winRateMatch = rankingRecord.earnedMoney.match(/\((\d+\.?\d*)%\)/);
  const winRate = winRateMatch ? parseFloat(winRateMatch[1]) : 0;
  
  return {
    id: rankingRecord.id,
    userName: rankingRecord.userName,
    lotteryTimes: lotteryTimes,
    lotteryTimesLabel: rankingRecord.probabilityLabel,
    totalAmountB: parseFloat(rankingRecord.earnedMoneyValue),
    winCount: rankingRecord.survivalYears,
    loseCount: rankingRecord.survivalDays,
    winRate: winRate,
    timestamp: rankingRecord.timestamp,
    createdAt: rankingRecord.createdAt
  };
}
```

### 2. API接口调用流程

#### 插入记录流程

```
风险抉择组件
    ↓ 调用 insertLotteryRanking(lotteryData)
rankingService.js
    ↓ adaptLotteryToRankingFormat() 转换数据
    ↓ POST /api/v1/rankings (死亡模拟器接口)
后端数据库
    ↓ 存储为统一的 RankingRecord 格式
    ↓ 返回结果
rankingService.js
    ↓ adaptRankingToLotteryFormat() 转换回来
风险抉择组件
    ↓ 接收到风险抉择格式的数据
```

#### 查询记录流程

```
风险抉择组件
    ↓ 调用 getLotteryRankingByTimes(10)
rankingService.js
    ↓ 构造 probability = "lottery-10"
    ↓ GET /api/v1/rankings?probability=lottery-10&limit=10
后端数据库
    ↓ 查询 probability="lottery-10" 的记录
    ↓ 返回死亡模拟器格式的数据
rankingService.js
    ↓ 遍历记录，adaptRankingToLotteryFormat() 转换
风险抉择组件
    ↓ 接收到风险抉择格式的数据列表
```

---

## 📊 数据示例

### 示例1：单次抽奖（中奖）

**前端原始数据：**
```json
{
  "lotteryTimes": 1,
  "lotteryTimesLabel": "单次抽奖",
  "totalAmountB": 200000000,
  "winCount": 1,
  "loseCount": 0,
  "winRate": 100.0
}
```

**适配后发送到后端：**
```json
{
  "userName": "匿名用户",
  "probability": "lottery-1",
  "probabilityLabel": "单次抽奖",
  "survivalYears": 1,
  "survivalDays": 0,
  "earnedMoney": "2.0亿元 (100.0%)",
  "earnedMoneyValue": "200000000"
}
```

### 示例2：100次抽奖（部分失败）

**前端原始数据：**
```json
{
  "lotteryTimes": 100,
  "lotteryTimesLabel": "100次抽奖",
  "totalAmountB": 19800000000,
  "winCount": 99,
  "loseCount": 1,
  "winRate": 99.0
}
```

**适配后发送到后端：**
```json
{
  "userName": "匿名用户",
  "probability": "lottery-100",
  "probabilityLabel": "100次抽奖",
  "survivalYears": 99,
  "survivalDays": 1,
  "earnedMoney": "198.0亿元 (99.0%)",
  "earnedMoneyValue": "19800000000"
}
```

---

## 🗄️ 数据库存储

### 统一的数据表结构

后端数据库只需要一张表 `rankings`：

```sql
CREATE TABLE rankings (
  id VARCHAR(50) PRIMARY KEY,
  user_name VARCHAR(100),
  probability VARCHAR(50),        -- 可以是 "1e-9" 或 "lottery-1"
  probability_label VARCHAR(100), -- 可以是 "十亿分之一" 或 "单次抽奖"
  survival_years DOUBLE,          -- 死亡模拟器：年数；风险抉择：成功次数
  survival_days INT,              -- 死亡模拟器：天数；风险抉择：失败次数
  earned_money VARCHAR(200),      -- 格式化金额字符串
  earned_money_value VARCHAR(100),-- 数值（字符串，避免精度问题）
  timestamp DATETIME,
  created_at BIGINT
);
```

### 查询示例

**查询死亡模拟器排行榜：**
```sql
SELECT * FROM rankings 
WHERE probability = '1e-9' 
ORDER BY survival_years DESC 
LIMIT 10;
```

**查询风险抉择排行榜（100次抽奖）：**
```sql
SELECT * FROM rankings 
WHERE probability = 'lottery-100' 
ORDER BY CAST(earned_money_value AS DECIMAL) DESC 
LIMIT 10;
```

---

## ✅ 优势分析

### 1. 后端零改动
- ✅ 复用现有接口 `POST /rankings` 和 `GET /rankings`
- ✅ 无需新增数据表
- ✅ 无需修改后端代码

### 2. 前端透明适配
- ✅ 组件层面无感知，API调用方式不变
- ✅ 所有转换逻辑封装在 `rankingService.js` 中
- ✅ 便于后续维护和扩展

### 3. 数据一致性
- ✅ 使用统一的数据模型
- ✅ 排序逻辑一致（按数值排序）
- ✅ 时间戳格式统一

### 4. 扩展性强
- ✅ 未来可以轻松添加更多游戏类型
- ✅ 只需要实现新的适配器函数
- ✅ 后端接口保持稳定

---

## 🧪 测试验证

### 测试用例1：插入单次抽奖记录

**输入：**
```javascript
await insertLotteryRanking({
  lotteryTimes: 1,
  lotteryTimesLabel: "单次抽奖",
  totalAmountB: 200000000,
  winCount: 1,
  loseCount: 0,
  winRate: 100.0
});
```

**预期：**
- ✅ 后端接收到 `probability="lottery-1"` 的记录
- ✅ 数据库存储成功
- ✅ 返回转换后的风险抉择格式数据

### 测试用例2：查询100次抽奖排行榜

**输入：**
```javascript
const result = await getLotteryRankingByTimes(100, 10);
```

**预期：**
- ✅ 查询 `probability="lottery-100"` 的记录
- ✅ 返回前10名（按 `earnedMoneyValue` 排序）
- ✅ 数据格式为风险抉择格式，包含 `winCount`, `loseCount`, `winRate` 等字段

---

## 📝 总结

通过精心设计的适配器模式，我们成功实现了：

1. **复用后端接口** - 无需后端开发新功能
2. **数据格式统一** - 两个游戏共享一套存储结构
3. **前端透明适配** - 组件层面无感知
4. **可维护性强** - 逻辑集中在服务层

这是一个优雅的工程设计案例，体现了**适配器模式**和**关注点分离**的设计原则。

---

**更新时间：** 2025-10-08  
**作者：** AI Assistant  
**状态：** ✅ 已实现并测试通过

