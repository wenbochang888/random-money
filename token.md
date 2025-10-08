# 签名验证拦截器使用指南

## 📋 概述

基于`SecretUtils`实现的签名验证拦截器，提供：
- ✅ **防刷保护** - 30秒时间窗口限制
- ✅ **防篡改** - MD5签名验证
- ✅ **防重放攻击** - Redis记录已使用的timestamp

**拦截范围：** 所有`/api/v1/`开头的接口

---

## 🔐 签名算法

### 签名生成步骤

1. **收集所有请求参数**（除了`token`）
2. **添加盐值**：`salt=salt`
3. **参数按key排序**（TreeMap自动排序）
4. **拼接字符串**：`key1=value1&key2=value2&salt=salt`
5. **MD5加密**：生成token

### 签名示例

**请求参数：**
```
userName=测试用户
probability=1e-9
timestamp=1728393000000
```

**签名过程：**
```
1. 参数排序后拼接：
   probability=1e-9&salt=salt&timestamp=1728393000000&userName=测试用户

2. MD5加密：
   token = md5("probability=1e-9&salt=salt&timestamp=1728393000000&userName=测试用户")
```

---

## 🚀 使用方法

### 1. 前端请求示例（JavaScript）

```javascript
// 签名工具函数
function generateSignature(params) {
  // 1. 添加timestamp
  params.timestamp = Date.now().toString();
  
  // 2. 参数排序
  const sortedKeys = Object.keys(params).sort();
  
  // 3. 添加salt
  const paramsWithSalt = { ...params, salt: 'salt' };
  
  // 4. 拼接字符串
  const sortedKeysWithSalt = Object.keys(paramsWithSalt).sort();
  const signStr = sortedKeysWithSalt
    .map(key => `${key}=${paramsWithSalt[key]}`)
    .join('&');
  
  // 5. MD5加密（需要引入MD5库，如 crypto-js）
  const token = CryptoJS.MD5(signStr).toString();
  
  return { ...params, token };
}

// 使用示例
async function submitRanking(data) {
  // 1. 准备请求参数（转为字符串）
  const params = {
    userName: data.userName,
    probability: data.probability,
    probabilityLabel: data.probabilityLabel,
    survivalYears: data.survivalYears.toString(),
    survivalDays: data.survivalDays.toString(),
    earnedMoney: data.earnedMoney,
    earnedMoneyValue: data.earnedMoneyValue
  };
  
  // 2. 生成签名
  const signedParams = generateSignature(params);
  
  // 3. 构建URL参数
  const queryString = new URLSearchParams(signedParams).toString();
  
  // 4. 发送请求（GET方式，参数在URL中）
  const response = await fetch(`/api/v1/rankings?${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });
  
  // 或者POST方式，参数在URL中，body为空或其他数据
  // const response = await fetch(`/api/v1/rankings?${queryString}`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json;charset=UTF-8'
  //   }
  // });
  
  return response.json();
}
```

### 2. curl测试示例

```bash
# 1. 准备参数
USER_NAME="测试用户"
PROBABILITY="1e-9"
TIMESTAMP=$(date +%s)000  # 毫秒时间戳

# 2. 生成签名字符串（按字母排序）
SIGN_STR="probability=${PROBABILITY}&salt=salt&timestamp=${TIMESTAMP}&userName=${USER_NAME}"

# 3. 计算MD5
TOKEN=$(echo -n "${SIGN_STR}" | md5sum | cut -d' ' -f1)

# 4. 发送请求
curl -X GET "http://localhost:8099/api/v1/rankings?probability=${PROBABILITY}&timestamp=${TIMESTAMP}&userName=${USER_NAME}&token=${TOKEN}"
```

### 3. Java客户端示例

```java
public class SignatureClient {
    
    public static String generateToken(Map<String, String> params, String timestamp) {
        TreeMap<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.put("timestamp", timestamp);
        sortedParams.put("salt", "salt");
        
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (sb.length() > 0) {
                sb.append("&");
            }
            sb.append(entry.getKey()).append("=").append(entry.getValue());
        }
        
        return DigestUtils.md5DigestAsHex(sb.toString().getBytes());
    }
    
    public static void main(String[] args) {
        Map<String, String> params = new HashMap<>();
        params.put("userName", "测试用户");
        params.put("probability", "1e-9");
        
        String timestamp = String.valueOf(System.currentTimeMillis());
        String token = generateToken(params, timestamp);
        
        // 构建URL
        String url = String.format(
            "http://localhost:8099/api/v1/rankings?userName=%s&probability=%s&timestamp=%s&token=%s",
            params.get("userName"), params.get("probability"), timestamp, token
        );
        
        // 发送HTTP请求...
    }
}
```

---

## ⚠️ 注意事项

### 1. 时间窗口限制

**有效期：** 30秒

请求的`timestamp`必须在服务器当前时间的30秒内，否则验证失败。

```java
private static final long NONCE_DURATION = 30 * 1000L; // 30秒
```

**建议：**
- 客户端与服务器时间同步
- 如果时间误差大，可调整`NONCE_DURATION`

### 2. 防重放攻击

同一个`timestamp`只能使用一次！

- Redis会记录已使用的timestamp
- 30秒后自动过期删除

**这意味着：**
- 每次请求必须生成新的timestamp
- 不能重复使用相同的签名

### 3. 参数要求

**所有参数必须转为字符串：**

```javascript
// ✅ 正确
survivalYears: data.survivalYears.toString()

// ❌ 错误（数字类型会导致签名不匹配）
survivalYears: data.survivalYears
```

### 4. POST请求的特殊处理

目前拦截器只读取URL参数（query parameters），如果需要支持POST body：

**方案A：** 参数放在URL中（推荐，当前实现支持）
```javascript
fetch(`/api/v1/rankings?timestamp=xxx&token=xxx&userName=xxx`, {
  method: 'POST',
  body: JSON.stringify(otherData)  // body可以放其他数据
})
```

**方案B：** 修改拦截器支持读取body（需要改造）

---

## 🔧 配置选项

### 1. 排除特定接口

如果某些接口不需要签名验证，在配置中排除：

```java
@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(signatureInterceptor)
            .addPathPatterns("/api/v1/**")
            // 排除公开接口
            .excludePathPatterns(
                "/api/v1/public/**",
                "/api/v1/health",
                "/api/v1/version"
            );
}
```

### 2. 调整时间窗口

修改`SecretUtils`中的常量：

```java
// 从30秒调整为60秒
private static final long NONCE_DURATION = 60 * 1000L;
```

### 3. 修改盐值

修改`SecretUtils`中的盐值（建议改为复杂字符串）：

```java
// 从"salt"改为复杂密钥
private static final String SALT = "your_complex_secret_key_here";
```

---

## 🧪 测试验证

### 测试1：正常请求（应该成功）

```bash
# 生成正确的签名
TIMESTAMP=$(date +%s)000
TOKEN=$(echo -n "probability=1e-9&salt=salt&timestamp=${TIMESTAMP}" | md5sum | cut -d' ' -f1)

curl "http://localhost:8099/api/v1/rankings/all?probability=1e-9&timestamp=${TIMESTAMP}&token=${TOKEN}"

# 预期结果：200 OK，返回数据
```

### 测试2：篡改参数（应该失败）

```bash
# 使用正确的token，但修改参数值
curl "http://localhost:8099/api/v1/rankings/all?probability=1e-8&timestamp=${TIMESTAMP}&token=${TOKEN}"

# 预期结果：403 Forbidden，签名验证失败
```

### 测试3：重放攻击（应该失败）

```bash
# 第一次请求（成功）
curl "http://localhost:8099/api/v1/rankings/all?probability=1e-9&timestamp=${TIMESTAMP}&token=${TOKEN}"

# 第二次使用相同的timestamp和token（失败）
curl "http://localhost:8099/api/v1/rankings/all?probability=1e-9&timestamp=${TIMESTAMP}&token=${TOKEN}"

# 预期结果：403 Forbidden，timestamp已被使用
```

### 测试4：过期请求（应该失败）

```bash
# 使用31秒前的时间戳
OLD_TIMESTAMP=$(($(date +%s) - 31))000
TOKEN=$(echo -n "probability=1e-9&salt=salt&timestamp=${OLD_TIMESTAMP}" | md5sum | cut -d' ' -f1)

curl "http://localhost:8099/api/v1/rankings/all?probability=1e-9&timestamp=${OLD_TIMESTAMP}&token=${TOKEN}"

# 预期结果：403 Forbidden，请求已过期
```

---

## 📊 错误码说明

| HTTP状态码 | 错误信息 | 原因 |
|-----------|---------|------|
| 403 | 签名验证失败 | timestamp过期、参数被篡改、重放攻击、签名错误 |
| 200 | 正常响应 | 验证通过 |

---

## 💡 安全建议

### 1. 使用HTTPS
签名验证无法防止中间人攻击，必须配合HTTPS使用。

### 2. 修改默认盐值
默认的`salt=salt`太简单，建议改为复杂密钥。

### 3. 客户端密钥保护
- 前端代码中的盐值会暴露
- 建议关键操作使用服务端签名
- 或者使用动态密钥（服务端下发）

### 4. 监控异常请求
记录签名验证失败的请求，分析攻击模式。

---

## 🎯 与现有项目集成

### 已完成
- ✅ 创建`SignatureInterceptor`拦截器
- ✅ 创建`SignatureInterceptorConfig`配置类
- ✅ 自动拦截`/api/v1/**`路径

### 使用步骤
1. **重启应用**
2. **前端添加签名逻辑**（参考上面的JavaScript示例）
3. **测试验证**

### 临时关闭拦截器
如果需要临时关闭签名验证：

```java
// 方法1：注释掉@Configuration
// @Configuration
public class SignatureInterceptorConfig { ... }

// 方法2：修改拦截路径为不存在的路径
.addPathPatterns("/api/v1/disabled/**")
```

---

**文档版本：** 1.0  
**作者：** changwenbo  
**最后更新：** 2025-10-08

