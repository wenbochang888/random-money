# 中文乱码问题修复指南

## 🐛 问题描述

排行榜显示用户名时出现问号（??），原因是**字符编码不一致**导致的中文乱码。

**典型现象：**
- 输入中文用户名（如"小李"）
- 排行榜显示为"??"
- 后端日志可能正确显示中文

---

## ✅ 前端修复（已完成）

### 1. 添加默认值处理
```vue
<td class="name-col">{{ record.userName || '匿名用户' }}</td>
```
如果userName为空或undefined，显示"匿名用户"。

### 2. 请求头添加UTF-8编码
```javascript
// 插入请求
headers: {
  'Content-Type': 'application/json; charset=UTF-8'
}

// 查询请求
headers: {
  'Accept': 'application/json; charset=UTF-8'
}
```

### 3. 表头颜色统一
```css
.ranking-table th {
  color: white !important;
}
```

---

## 🔧 后端需要配置（请你完成）

### 第一步：Spring Boot 配置UTF-8编码

#### 方法1：application.properties/yml（推荐）

**application.properties:**
```properties
# HTTP编码配置
spring.http.encoding.charset=UTF-8
spring.http.encoding.enabled=true
spring.http.encoding.force=true

# JSON编码配置
spring.jackson.default-property-inclusion=non_null
spring.jackson.serialization.write-dates-as-timestamps=false

# 数据源编码配置（MySQL）
spring.datasource.url=jdbc:mysql://localhost:3306/your_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.hikari.connection-test-query=SELECT 1
```

**application.yml:**
```yaml
spring:
  http:
    encoding:
      charset: UTF-8
      enabled: true
      force: true
  
  jackson:
    default-property-inclusion: non_null
    serialization:
      write-dates-as-timestamps: false
  
  datasource:
    url: jdbc:mysql://localhost:3306/your_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
```

---

#### 方法2：编程配置

创建配置类：

```java
package com.tianya.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    /**
     * 配置HTTP消息转换器，统一使用UTF-8编码
     */
    @Bean
    public HttpMessageConverter<String> responseBodyConverter() {
        return new StringHttpMessageConverter(StandardCharsets.UTF_8);
    }
    
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        converters.add(responseBodyConverter());
    }
}
```

---

### 第二步：Controller 添加编码注解

在 `RankingController` 上添加 `@RequestMapping` 的 `produces` 属性：

```java
@RestController
@RequestMapping(value = "/api/v1/rankings", produces = "application/json;charset=UTF-8")
@Slf4j
public class RankingController {
    
    @Autowired
    private RankingService rankingService;
    
    @PostMapping(produces = "application/json;charset=UTF-8")
    public ResponseEntity<ApiResponse<RankingRecord>> insertRanking(
            @RequestBody RankingInsertRequest request) {
        // ...
    }
    
    @GetMapping(produces = "application/json;charset=UTF-8")
    public ResponseEntity<ApiResponse<RankingQueryResult>> queryByProbability(
            @RequestParam(required = true) String probability,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        // ...
    }
}
```

---

### 第三步：数据库编码配置

#### MySQL 数据库编码

**1. 检查当前编码：**
```sql
-- 查看数据库编码
SHOW CREATE DATABASE your_database;

-- 查看表编码
SHOW CREATE TABLE rankings;

-- 查看字段编码
SHOW FULL COLUMNS FROM rankings;
```

**2. 修改数据库编码（如果不是UTF-8）：**
```sql
-- 修改数据库编码
ALTER DATABASE your_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修改表编码
ALTER TABLE rankings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修改特定字段编码
ALTER TABLE rankings 
MODIFY COLUMN user_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**3. 创建表时指定编码（推荐）：**
```sql
CREATE TABLE rankings (
    id VARCHAR(50) PRIMARY KEY,
    user_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    probability VARCHAR(10),
    probability_label VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    survival_years DECIMAL(10, 2),
    survival_days INT,
    earned_money VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    earned_money_value VARCHAR(50),
    timestamp DATETIME,
    created_at BIGINT,
    INDEX idx_probability (probability, survival_years DESC),
    INDEX idx_user_name (user_name, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**注意：** 使用 `utf8mb4` 而不是 `utf8`，因为：
- `utf8mb4` 支持所有Unicode字符（包括emoji）
- `utf8` 只支持最多3字节的UTF-8字符（无法存储emoji）

---

#### PostgreSQL 数据库编码

**1. 检查编码：**
```sql
-- 查看数据库编码
\l+ your_database

-- 或
SELECT datname, pg_encoding_to_char(encoding) 
FROM pg_database 
WHERE datname = 'your_database';
```

**2. 创建数据库时指定编码：**
```sql
CREATE DATABASE your_database
WITH ENCODING 'UTF8'
LC_COLLATE = 'zh_CN.UTF-8'
LC_CTYPE = 'zh_CN.UTF-8'
TEMPLATE = template0;
```

---

### 第四步：JDBC连接字符串配置

**MySQL连接字符串：**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_db?useUnicode=true&characterEncoding=utf8mb4&useSSL=false&serverTimezone=Asia/Shanghai
```

**参数说明：**
- `useUnicode=true` - 使用Unicode编码
- `characterEncoding=utf8mb4` - 设置字符编码为UTF-8（4字节）
- `useSSL=false` - 本地开发可禁用SSL（生产环境建议启用）
- `serverTimezone=Asia/Shanghai` - 设置时区

**PostgreSQL连接字符串：**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/your_db?characterEncoding=utf8&useUnicode=true
```

---

## 🧪 测试验证

### 1. 测试中文用户名

```bash
curl -X POST http://localhost:8099/api/v1/rankings \
  -H "Content-Type: application/json; charset=UTF-8" \
  -d '{
    "userName": "小李",
    "probability": "1e-9",
    "probabilityLabel": "十亿分之一",
    "survivalYears": 15.23,
    "survivalDays": 5559,
    "earnedMoney": "481.3万亿元",
    "earnedMoneyValue": "4813000000000000"
  }'
```

**期望响应：**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "userName": "小李"
  },
  "message": "记录已保存"
}
```

### 2. 查询并验证

```bash
curl -X GET "http://localhost:8099/api/v1/rankings?probability=1e-9&limit=10" \
  -H "Accept: application/json; charset=UTF-8"
```

**检查点：**
- ✅ `userName` 应该是 `"小李"` 而不是 `"??"`
- ✅ `probabilityLabel` 应该是 `"十亿分之一"`
- ✅ `earnedMoney` 应该正确显示中文单位

### 3. 前端测试

1. 刷新页面
2. 输入中文用户名（如"小李"）
3. 进行模拟
4. 查看排行榜是否正确显示中文

---

## 🔍 问题排查

### 问题1：后端日志显示中文正常，但响应乱码

**原因：** HTTP响应编码配置错误

**解决：**
```java
@PostMapping(produces = "application/json;charset=UTF-8")
```

---

### 问题2：数据库存储正常，查询出来乱码

**原因：** JDBC连接字符串缺少编码参数

**解决：**
```properties
spring.datasource.url=...?useUnicode=true&characterEncoding=utf8mb4
```

---

### 问题3：保存到数据库时就已经乱码

**原因：** 数据库或表的字符集不是UTF-8

**解决：**
```sql
ALTER TABLE rankings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 问题4：部分中文正常，emoji显示乱码

**原因：** 使用了 `utf8` 而不是 `utf8mb4`

**解决：**
- 数据库：使用 `utf8mb4`
- JDBC：`characterEncoding=utf8mb4`

---

## 📊 完整配置检查清单

### 前端（已完成）✅
- [x] 请求头添加 `charset=UTF-8`
- [x] 响应头添加 `Accept: application/json; charset=UTF-8`
- [x] 用户名添加默认值处理

### 后端（需要你完成）
- [ ] `application.properties` 配置UTF-8编码
- [ ] Controller 添加 `produces = "application/json;charset=UTF-8"`
- [ ] JDBC连接字符串添加 `useUnicode=true&characterEncoding=utf8mb4`
- [ ] 数据库表使用 `utf8mb4` 编码
- [ ] 重启后端服务

### 数据库（需要你完成）
- [ ] 数据库字符集：`utf8mb4`
- [ ] 表字符集：`utf8mb4`
- [ ] 字段字符集：`utf8mb4`（user_name、probability_label、earned_money等）

---

## 🎯 最终验证

完成所有配置后：

1. **重启后端服务**
2. **清空数据库中的测试数据**
   ```sql
   TRUNCATE TABLE rankings;
   ```
3. **前端测试**
   - 输入中文用户名："小李"
   - 进行模拟
   - 查看排行榜
4. **检查结果**
   - 用户名应该显示为"小李"而不是"??"
   - 所有中文字段都应该正常显示

---

## 💡 最佳实践

1. **统一使用UTF-8编码**
   - 前端：UTF-8
   - 后端：UTF-8
   - 数据库：UTF-8MB4
   - JDBC：UTF-8

2. **避免硬编码字符串**
   ```java
   // ❌ 不推荐
   response.setCharacterEncoding("UTF-8");
   
   // ✅ 推荐
   @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
   ```

3. **使用常量**
   ```java
   public class Constants {
       public static final String JSON_UTF8 = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8";
   }
   
   @PostMapping(produces = Constants.JSON_UTF8)
   ```

4. **日志记录**
   ```java
   log.info("收到用户名: {}, 编码: {}", 
       userName, 
       StandardCharsets.UTF_8.displayName());
   ```

---

## 📞 如果问题仍未解决

请提供以下信息：

1. **后端日志**（包含用户名的日志）
2. **数据库查询结果**
   ```sql
   SELECT user_name, HEX(user_name) FROM rankings LIMIT 1;
   ```
3. **浏览器Network标签的Response**（查看原始响应）
4. **后端配置文件**（application.properties/yml的相关配置）

---

**文档版本：** 1.0  
**更新时间：** 2025-10-08  
**问题：** 中文用户名显示为问号  
**解决方案：** 统一配置UTF-8编码

