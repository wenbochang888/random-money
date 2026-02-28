# 神秘人年龄猜测游戏 - 后端API接口文档

## 概述

本文档描述神秘人年龄猜测游戏的后端API接口规范。该游戏允许用户猜测神秘人的年龄（0-100岁，精确到秒），每次猜测花费1亿，猜对获得剩余奖金。

## ⚠️ 重要说明

**后端不能修改**，本游戏复用现有 RankingController 的 `/api/v1/rankings` 接口，通过 `probability` 参数区分不同游戏类型。

## 基础信息

- **基础URL**: `https://www.gdufe888.top/api/v1`
- **认证方式**: 签名验证（与现有排行榜系统一致）
- **请求格式**: JSON
- **响应格式**: JSON

## 签名机制

所有请求需要包含签名参数：

1. **timestamp**: Unix时间戳（毫秒）
2. **token**: 固定Token
3. **sign**: MD5签名（参数按key升序排列 + token + timestamp）

签名示例：
```
params = {userName: "张三", guessCount: 5, ...}
sortedKeys = ["guessCount", "mysteryAgeDisplay", "userName", ...]
signString = "guessCount=5&mysteryAgeDisplay=30年...&userName=张三&token=xxx&timestamp=1234567890"
sign = MD5(signString)
```

## 接口列表

### 1. 插入排行记录

**请求**:
```
POST /api/v1/rankings
```

**Query参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| timestamp | string | 是 | Unix时间戳（毫秒） |
| token | string | 是 | 固定Token |
| sign | string | 是 | 签名 |

```json
{
  "userName": "张三",
  "probability": "age-guess",
  "probabilityLabel": "神秘人年龄猜测",
  "survivalYears": 5,
  "survivalDays": 450000000000,
  "earnedMoney": "4500亿元"
}
```
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userName | string | 是 | 用户名（最长6字符） |
| probability | string | 是 | 固定值："age-guess"（标识这是年龄猜测游戏） |
| probabilityLabel | string | 是 | 固定值："神秘人年龄猜测" |
| survivalYears | number | 是 | 猜测次数（对应前端 guessCount） |
| survivalDays | number | 是 | 剩余奖金数值（对应前端 earnedMoney 数值） |
| earnedMoney | string | 是 | 剩余奖金格式化字符串（对应前端 earnedMoneyDisplay） |

```json
{
  "success": true,
  "data": {
    "id": "1234567890_abc123",
    "userName": "张三",
    "probability": "age-guess",
    "probabilityLabel": "神秘人年龄猜测",
    "survivalYears": 5,
    "survivalDays": 450000000000,
    "earnedMoney": "4500亿元",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "createdAt": 1705315800000
  },
  "message": "记录保存成功"
}
```
```

```json
{
  "success": false,
  "data": null,
  "message": "签名验证失败"
}
```

---

> **重要：字段映射说明**
> 
> 由于后端复用现有的 RankingRecord 表结构，字段命名与前端不同：
> - 前端 `guessCount` → 后端 `survivalYears`（猜测次数）
> - 前端 `earnedMoney`（数值）→ 后端 `survivalDays`（剩余奖金）
> - 前端 `earnedMoneyDisplay`（字符串）→ 后端 `earnedMoney`（格式化显示）
> - **后端不支持 `mysteryAgeDisplay` 字段**
```

---

### 2. 查询年龄猜测排行榜

**请求**:
```
GET /api/v1/rankings?probability=age-guess&limit=10
```

**Query参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| probability | string | 是 | 固定值："age-guess" |
| limit | string | 否 | 返回数量，默认10 |
| timestamp | string | 是 | Unix时间戳（毫秒） |
| token | string | 是 | 固定Token |
| sign | string | 是 | 签名 |

```json
{
  "success": true,
  "data": {
    "probability": "age-guess",
    "records": [
      {
        "id": "1234567890_abc123",
        "userName": "张三",
        "probability": "age-guess",
        "probabilityLabel": "神秘人年龄猜测",
        "survivalYears": 3,
        "survivalDays": 470000000000,
        "earnedMoney": "4700亿元",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "createdAt": 1705315800000
      },
      {
        "id": "1234567891_def456",
        "userName": "李四",
        "probability": "age-guess",
        "probabilityLabel": "神秘人年龄猜测",
        "survivalYears": 8,
        "survivalDays": 420000000000,
        "earnedMoney": "4200亿元",
        "timestamp": "2024-01-15T09:20:00.000Z",
        "createdAt": 1705311600000
      }
    ],
    "total": 15
  },
  "message": "查询成功"
}
```
```

---

## 数据库设计

### 表结构: rankings (复用现有表)

通过 `probability` 字段区分不同游戏类型：
- `age-guess` = 神秘人年龄猜测
- `1e-9` = 死亡概率模拟器（十亿分之一）
- `lottery-1` = 风险抉择抽奖（单次）
- `lottery-10` = 风险抉择抽奖（10次）

```sql
CREATE TABLE rankings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(6) NOT NULL COMMENT '用户名',
  probability VARCHAR(50) NOT NULL COMMENT '概率标识/游戏类型',
  probability_label VARCHAR(50) NOT NULL COMMENT '概率/游戏中文标签',
  survival_years BIGINT COMMENT '存活年数/猜测次数',
  survival_days BIGINT COMMENT '存活天数/获得奖金数值',
  earned_money VARCHAR(100) NOT NULL COMMENT '获得金额/奖金显示',
  earned_money_value BIGINT COMMENT '获得金额数值',
  timestamp DATETIME NOT NULL COMMENT '记录时间',
  created_at BIGINT NOT NULL COMMENT '创建时间戳',
  INDEX idx_probability (probability),
  INDEX idx_earned_money (earned_money_value DESC),
  INDEX idx_created_at (created_at DESC)
);
```

## 游戏规则说明

### 金额计算
- 初始金额：500亿元
- 每次猜测：1亿元
- 获得奖金 = 500亿 - (猜测次数 × 1亿)

### 年龄计算
- 神秘人年龄范围：0-100岁
- 年龄精度：年/月/日/时/分/秒
- 神秘人出生时间在游戏开始时随机生成（0-100年前）
- 当前参考时间在游戏开始时生成，后续不变

### 猜对条件
- 用户猜测的年龄（精确到毫秒）与神秘人实际年龄完全相同

## 业务规则

1. **仅成功时保存**：只有猜对年龄时才保存到排行榜
2. **排名规则**：按获得奖金金额降序排列
3. **保留数量**：仅保留获得奖金最高的前10名记录

## 错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 签名验证失败 |
| 1002 | 参数错误 |
| 1003 | 用户名无效 |
| 1004 | 金额无效 |
| 2001 | 数据库错误 |

## 前端调用示例

// 字段映射：将前端字段转换为后端字段
// 后端 RankingRecord 期望：survivalYears, survivalDays, earnedMoney
const mappedData = {
  userName: recordData.userName,
  probability: 'age-guess',
  probabilityLabel: '神秘人年龄猜测',
  // guessCount → survivalYears (猜测次数)
  survivalYears: recordData.guessCount,
  // earnedMoney (数值) → survivalDays (剩余金额)
  survivalDays: recordData.earnedMoney,
  // earnedMoneyDisplay (字符串) → earnedMoney (显示用)
  earnedMoney: recordData.earnedMoneyDisplay
};

const params = {
  userName: String(mappedData.userName || ''),
  probability: String(mappedData.probability || ''),
  probabilityLabel: String(mappedData.probabilityLabel || ''),
  survivalYears: String(mappedData.survivalYears || ''),
  survivalDays: String(mappedData.survivalDays || ''),
  earnedMoney: String(mappedData.earnedMoney || '')
};
  
  const signedParams = SignUtil.sign(params);
  const queryString = new URLSearchParams(signedParams).toString();
  const url = `${API_BASE_URL}/rankings?${queryString}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
  body: JSON.stringify(mappedData)
  });
  
  return await response.json();
}

// 查询排行榜
async function getAgeRankingsAPI(limit = 10) {
  const params = {
    probability: 'age-guess',  // 固定值
    limit: String(limit)
  };
  
  const signedParams = SignUtil.sign(params);
  const queryString = new URLSearchParams(signedParams).toString();
  
  const response = await fetch(`${API_BASE_URL}/rankings?probability=age-guess&${queryString}`);
  return await response.json();
}
```

## 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2024-01-15 | 初始版本 |
| 1.1.0 | 2026-02-28 | 更新为复用 RankingController 接口，使用 probability="age-guess" 区分游戏类型 |
