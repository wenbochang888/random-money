<template>
  <div class="home-page">
    <div class="header">
      <h1 class="main-title">🎮 互动体验中心</h1>
      <p class="subtitle">探索概率与决策的奇妙世界</p>
    </div>
    
    <div class="activity-grid">
      <!-- 死亡概率模拟器卡片 -->
      <div class="activity-card" @click="navigateTo('death')">
        <div class="card-icon">💀</div>
        <h2 class="card-title">死亡概率模拟器</h2>
        <p class="card-description">
          在不同死亡概率下，你能存活多久？体验概率的力量，计算理论收益。
        </p>
        <div class="card-tags">
          <span class="tag">概率模拟</span>
          <span class="tag">期望计算</span>
        </div>
        <button class="enter-btn">进入体验 →</button>
      </div>

      <!-- 风险抉择抽奖卡片 -->
      <div class="activity-card" @click="navigateTo('lottery')">
        <div class="card-icon">🎰</div>
        <h2 class="card-title">风险抉择抽奖</h2>
        <p class="card-description">
          稳定的200万 vs 99%的2亿，你会如何选择？验证你的决策智慧。
        </p>
        <div class="card-tags">
          <span class="tag">风险决策</span>
          <span class="tag">期望博弈</span>
        </div>
        <button class="enter-btn">进入体验 →</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  methods: {
    navigateTo(page) {
      this.$emit('navigate', page);
    }
  }
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 50px;
  animation: fadeInDown 0.8s ease;
}

.main-title {
  font-size: 3rem;
  color: white;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 15px;
  font-weight: bold;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
  font-weight: 300;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  max-width: 1200px;
  width: 100%;
  margin-bottom: 40px;
}

.activity-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 35px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease;
}

.activity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.activity-card:hover::before {
  transform: scaleX(1);
}

.activity-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 50px rgba(102, 126, 234, 0.3);
}

.card-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  display: inline-block;
  animation: bounce 2s infinite;
}

.activity-card:hover .card-icon {
  animation: shake 0.5s ease;
}

.card-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 15px;
  font-weight: 600;
}

.card-description {
  font-size: 1rem;
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 20px;
  min-height: 80px;
}

.card-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tag {
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 500;
}

.enter-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.enter-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.enter-btn:active {
  transform: scale(0.98);
}

.home-footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin-top: 30px;
  animation: fadeIn 1s ease 0.5s both;
}

/* 动画定义 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .activity-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .activity-card {
    padding: 25px;
  }

  .card-icon {
    font-size: 3rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .card-description {
    min-height: auto;
  }
}
</style>

