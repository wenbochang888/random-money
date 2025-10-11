<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <button class="close-btn" @click="closeModal">×</button>
        <div class="modal-content">
          <div class="icon-section">
            <div class="wechat-icon">📱</div>
            <div class="sparkles">
              <span class="sparkle">✨</span>
              <span class="sparkle">✨</span>
              <span class="sparkle">✨</span>
            </div>
          </div>
          <h2 class="modal-title">重磅升级</h2>
          <div class="modal-message">
            <p class="main-text">🎉 微信小程序版本已上线</p>
            <p class="sub-text">微信搜索：<strong class="highlight">程序员博博</strong></p>
            <p class="cta-text">立刻来体验吧！</p>
          </div>
          <div class="countdown-bar">
            <div class="countdown-fill" :style="{ width: countdownWidth + '%' }"></div>
          </div>
          <p class="countdown-text">{{ remainingSeconds }}秒后自动关闭</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'WelcomeModal',
  props: {
    autoCloseDelay: {
      type: Number,
      default: 10000 // 5秒
    }
  },
  data() {
    return {
      visible: false,
      remainingSeconds: 10,
      countdownInterval: null,
      autoCloseTimer: null
    };
  },
  computed: {
    countdownWidth() {
      return (this.remainingSeconds / 10) * 100;
    }
  },
  methods: {
    show() {
      this.visible = true;
      this.remainingSeconds = 10;
      this.startCountdown();
      this.startAutoClose();
    },
    closeModal() {
      this.visible = false;
      this.clearTimers();
      this.$emit('close');
    },
    startCountdown() {
      this.countdownInterval = setInterval(() => {
        this.remainingSeconds--;
        if (this.remainingSeconds <= 0) {
          clearInterval(this.countdownInterval);
        }
      }, 1000);
    },
    startAutoClose() {
      this.autoCloseTimer = setTimeout(() => {
        this.closeModal();
      }, this.autoCloseDelay);
    },
    clearTimers() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = null;
      }
    }
  },
  beforeUnmount() {
    this.clearTimers();
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 25px;
  padding: 40px 35px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: modalBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes modalBounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  font-size: 1.8rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  line-height: 1;
  padding: 0;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-content {
  text-align: center;
  color: white;
}

.icon-section {
  position: relative;
  margin-bottom: 25px;
}

.wechat-icon {
  font-size: 5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.sparkles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.sparkle {
  position: absolute;
  font-size: 1.5rem;
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle:nth-child(1) {
  top: 10%;
  left: 20%;
  animation-delay: 0s;
}

.sparkle:nth-child(2) {
  top: 20%;
  right: 15%;
  animation-delay: 0.5s;
}

.sparkle:nth-child(3) {
  bottom: 15%;
  left: 25%;
  animation-delay: 1s;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 3px;
}

.modal-message {
  margin-bottom: 25px;
}

.main-text {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 15px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.sub-text {
  font-size: 1.2rem;
  margin-bottom: 10px;
  opacity: 0.95;
}

.highlight {
  color: #ffd700;
  font-size: 1.3rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  font-weight: 700;
}

.cta-text {
  font-size: 1.15rem;
  margin-top: 10px;
  opacity: 0.9;
}

.countdown-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.countdown-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  border-radius: 3px;
  transition: width 1s linear;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.countdown-text {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

/* 过渡动画 */
.modal-fade-enter-active {
  transition: opacity 0.3s ease;
}

.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-container {
    padding: 30px 25px;
    margin: 0 15px;
  }

  .wechat-icon {
    font-size: 4rem;
  }

  .modal-title {
    font-size: 1.6rem;
  }

  .main-text {
    font-size: 1.2rem;
  }

  .sub-text {
    font-size: 1.05rem;
  }

  .highlight {
    font-size: 1.15rem;
  }

  .cta-text {
    font-size: 1rem;
  }

  .sparkle {
    font-size: 1.2rem;
  }
}
</style>

