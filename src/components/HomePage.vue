<template>
  <div class="home-page">
    <div class="header">
      <h1 class="main-title">概率游戏体验中心</h1>
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

    <!-- 底部作者信息 -->
    <div class="author-footer">
      <span class="footer-text">✨ 微信小程序版本已上线。微信搜索：<strong>程序员博博</strong>，立刻来体验吧 ✨</span>
    </div>

    <!-- 悬浮支持按钮 -->
    <div class="floating-support-btn" @click="openModal">
      <span class="support-icon">☕</span>
      <span class="support-text">欢迎请作者喝奶茶</span>
    </div>

    <!-- 收款码模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">✕</button>
        <div class="modal-body">
          <h3 class="modal-title">☕ 支持作者</h3>
          <p class="modal-description">如果本功能对您有帮助，欢迎请作者喝杯奶茶，谢谢！</p>
          <p class="modal-hint">💡 点击二维码可放大查看</p>
          <div class="qr-codes-modal">
            <div class="qr-code-wrapper">
              <img :src="wxQRCode" alt="微信收款码" class="qr-modal-image clickable" @click="enlargeQRCode">
              <p class="qr-modal-label">微信支付</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 放大收款码模态框 -->
    <div v-if="showEnlargeModal" class="enlarge-modal-overlay" @click="closeEnlargeModal">
      <div class="enlarge-modal-content" @click.stop>
        <button class="enlarge-modal-close" @click="closeEnlargeModal">✕</button>
        <img :src="wxQRCode" alt="微信收款码" class="qr-image-enlarged">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      showModal: false,
      showEnlargeModal: false,
      wxQRCode: require('../assets/wx.jpg')
    };
  },
  methods: {
    navigateTo(page) {
      this.$emit('navigate', page);
    },
    openModal() {
      this.showModal = true;
      document.body.style.overflow = 'hidden';
    },
    closeModal() {
      this.showModal = false;
      document.body.style.overflow = '';
    },
    enlargeQRCode() {
      this.showEnlargeModal = true;
    },
    closeEnlargeModal() {
      this.showEnlargeModal = false;
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
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

/* 悬浮支持按钮样式 */
.floating-support-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 18px 30px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  font-weight: 700;
  font-size: 1.1rem;
  animation: breathe 2s ease-in-out infinite, pulse 2s ease-in-out infinite;
  user-select: none;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.floating-support-btn:hover {
  transform: translateY(-5px) scale(1.08);
  box-shadow: 0 15px 40px rgba(255, 107, 107, 0.6);
  background: linear-gradient(135deg, #ee5a24 0%, #ff6b6b 100%);
}

.floating-support-btn:active {
  transform: translateY(-2px) scale(1.05);
}

.support-icon {
  font-size: 1.5rem;
  animation: wiggle 1.5s ease-in-out infinite;
}

.support-text {
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes breathe {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(255, 107, 107, 0.5), 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
  50% {
    box-shadow: 0 12px 35px rgba(255, 107, 107, 0.7), 0 0 0 8px rgba(255, 107, 107, 0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

@keyframes wiggle {
  0%, 100% {
    transform: rotate(0deg);
  }
  15%, 45% {
    transform: rotate(-12deg);
  }
  30%, 60% {
    transform: rotate(12deg);
  }
  75% {
    transform: rotate(-8deg);
  }
  90% {
    transform: rotate(8deg);
  }
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(8px);
  padding: 20px;
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 0;
  max-width: 90%;
  max-height: 90vh;
  overflow: auto;
  animation: zoomIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
}

.modal-body {
  padding: 45px 50px;
  text-align: center;
}

.modal-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 15px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 12px;
  line-height: 1.6;
}

.modal-hint {
  text-align: center;
  color: #95a5a6;
  font-size: 0.9rem;
  margin-bottom: 30px;
  font-style: italic;
}

.qr-codes-modal {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.qr-code-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  border: 2px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.qr-code-wrapper:hover {
  transform: translateY(-5px);
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.qr-modal-image {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.qr-modal-image.clickable {
  cursor: zoom-in;
}

.qr-modal-image.clickable:hover {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  transform: scale(1.05);
}

.qr-modal-label {
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #2c3e50;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font-weight: bold;
  line-height: 1;
  z-index: 10;
}

.modal-close:hover {
  background: #667eea;
  color: white;
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

/* 底部作者信息样式 */
.author-footer {
  width: 100%;
  text-align: center;
  padding: 20px;
  margin-top: 30px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.footer-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: rgba(255, 255, 255, 0.9);
}

.footer-divider {
  margin: 0 10px;
  color: rgba(255, 255, 255, 0.3);
}

.footer-text {
  color: rgba(255, 255, 255, 0.5);
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

/* 放大收款码模态框样式 */
.enlarge-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(10px);
}

.enlarge-modal-content {
  position: relative;
  max-width: 95%;
  max-height: 95vh;
  animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.qr-image-enlarged {
  max-width: 100%;
  max-height: 90vh;
  width: auto;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.enlarge-modal-close {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 45px;
  height: 45px;
  background: white;
  border: none;
  border-radius: 50%;
  font-size: 1.8rem;
  color: #2c3e50;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 1;
}

.enlarge-modal-close:hover {
  background: #ff6b6b;
  color: white;
  transform: rotate(90deg) scale(1.1);
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

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
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

  .floating-support-btn {
    bottom: 20px;
    right: 20px;
    padding: 14px 24px;
    font-size: 1rem;
    gap: 8px;
  }

  .support-icon {
    font-size: 1.3rem;
  }

  .modal-body {
    padding: 30px 25px;
  }

  .modal-title {
    font-size: 1.6rem;
  }

  .modal-description {
    font-size: 0.95rem;
    margin-bottom: 25px;
  }

  .qr-codes-modal {
    gap: 20px;
    flex-direction: column;
  }

  .qr-code-wrapper {
    padding: 15px;
  }

  .qr-modal-image {
    width: 160px;
    height: 160px;
  }

  .qr-modal-label {
    font-size: 1rem;
  }

  .modal-close {
    top: 15px;
    right: 15px;
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }
}
</style>

