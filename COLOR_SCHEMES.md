# 配色方案选择指南

本项目提供4种配色方案供您选择，每种方案都经过精心设计以提供最佳的视觉体验。

## 🎨 配色方案列表

### 方案1：紫色魔幻风（当前默认）
**主题色**：紫色渐变 (#667eea → #764ba2)
**特点**：
- 神秘优雅的紫色调
- 适合概率和决策主题
- 视觉冲击力强
- 当前正在使用

**适用场景**：适合喜欢神秘、优雅风格的用户

---

### 方案2：蓝色科技风
**主题色**：蓝色渐变 (#4facfe → #00f2fe)
**特点**：
- 清新科技感
- 专业商务风格
- 视觉舒适度高
- 适合理性决策场景

**适用场景**：适合追求科技感、专业感的用户

---

### 方案3：橙红渐变风
**主题色**：橙红渐变 (#fa709a → #fee140)
**特点**：
- 温暖活力
- 充满激情
- 视觉冲击力强
- 适合高风险博弈主题

**适用场景**：适合喜欢热情、活力风格的用户

---

### 方案4：绿色清新风
**主题色**：绿色渐变 (#11998e → #38ef7d)
**特点**：
- 自然清新
- 舒适护眼
- 轻松愉悦
- 适合长时间使用

**适用场景**：适合追求自然、舒适感的用户

---

## 🔧 如何切换配色方案

### 方式1：修改 App.vue（推荐）

打开 `src/App.vue`，找到以下代码：

```css
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
}
```

替换为您想要的方案：

**方案2（蓝色科技风）**：
```css
body {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  background-attachment: fixed;
}
```

**方案3（橙红渐变风）**：
```css
body {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  background-attachment: fixed;
}
```

**方案4（绿色清新风）**：
```css
body {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  background-attachment: fixed;
}
```

### 方式2：使用预设文件

我已为您准备了4个配色方案的完整文件：
- `src/App.vue` - 方案1（紫色，当前）
- `src/App.vue.theme-blue` - 方案2（蓝色）
- `src/App.vue.theme-orange` - 方案3（橙红）
- `src/App.vue.theme-green` - 方案4（绿色）

切换方式：
```bash
# 切换到蓝色方案
cp src/App.vue.theme-blue src/App.vue

# 切换到橙红方案
cp src/App.vue.theme-orange src/App.vue

# 切换到绿色方案
cp src/App.vue.theme-green src/App.vue

# 恢复默认紫色方案
git checkout src/App.vue
```

---

## 📸 效果预览

修改后刷新浏览器即可看到效果。建议您逐个尝试，选择最适合的配色方案。

---

## 💡 自定义配色

如果以上方案都不满意，您可以自定义渐变色：

1. 访问 https://uigradients.com/ 选择喜欢的渐变
2. 复制CSS代码
3. 替换 `src/App.vue` 中的 `background` 属性

---

## 🎯 建议

- **正式使用**：推荐方案1（紫色）或方案2（蓝色）
- **演示展示**：推荐方案3（橙红）
- **长时间使用**：推荐方案4（绿色）

