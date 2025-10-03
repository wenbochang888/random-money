<template>
  <div class="lottery-game">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">
      ← 返回主页
    </button>

    <!-- 知乎问题链接 -->
    <div class="zhihu-link-section">
      <a href="https://www.zhihu.com/question/1890572054891328884" target="_blank" class="zhihu-link">
        知乎问题："稳定的200万 vs 99%的2亿，你会如何选择？"
      </a>
    </div>

    <div class="container">
      <h1 class="title">🎰 风险抉择抽奖</h1>
      <p class="game-intro">用概率验证你的决策：博弈2亿 VS 稳定200万</p>

      <!-- 方案说明 -->
      <div class="plan-section">
        <div class="plan-comparison">
          <div class="plan-card safe">
            <div class="plan-icon">🛡️</div>
            <h3 class="plan-title">方案A：稳定方案</h3>
            <div class="plan-rate">100%</div>
            <div class="plan-amount">200万</div>
            <div class="plan-expected">期望值：200万</div>
          </div>
          
          <div class="vs-divider">VS</div>
          
          <div class="plan-card risky">
            <div class="plan-icon">🎲</div>
            <h3 class="plan-title">方案B：博弈方案</h3>
            <div class="plan-rate">99%</div>
            <div class="plan-amount">2亿</div>
            <div class="plan-fail">1% 获得 0元</div>
            <div class="plan-expected">期望值：1.98亿</div>
          </div>
        </div>

        <div class="plan-note">
          💡 选择方案B进行抽奖，看看你能否战胜概率！
        </div>
      </div>

      <!-- 次数选择 -->
      <div class="times-section">
        <h2 class="section-title">选择抽奖次数（点击立即开始）</h2>
        <div class="times-buttons">
          <button 
            v-for="times in [1, 10, 100, 1000, 10000]" 
            :key="times"
            @click="selectAndStartLottery(times)"
            :disabled="isRunning"
            :class="['times-btn', { active: selectedTimes === times && isRunning }]"
          >
            {{ times === 1 ? '单次' : times + '次' }}抽奖
          </button>
        </div>
      </div>

      <!-- 抽奖进行中 -->
      <div class="running-section" v-if="isRunning">
        <div class="progress-indicator">
          <div class="spinner"></div>
          <p>正在进行第 <strong>{{ currentRound }}</strong> / {{ selectedTimes }} 次抽奖...</p>
        </div>
      </div>

      <!-- 结果展示区（在下方显示） -->
      <div class="result-section" v-if="showResult && !isRunning">
        <!-- 单次结果 -->
        <div v-if="selectedTimes === 1" class="single-result">
          <div :class="['result-card', results[0].win ? 'win' : 'lose']">
            <div class="result-icon">{{ results[0].win ? '🎉' : '😢' }}</div>
            <h2 class="result-status">{{ results[0].win ? '恭喜中奖！' : '很遗憾...' }}</h2>
            <div class="result-amount">{{ formatMoney(results[0].amount) }}</div>
            <p class="result-desc">
              {{ results[0].win ? '恭喜中奖！方案B：你获得了 ' + formatMoney(results[0].amount) + '！' : '方案B：这次没有中奖（0元）' }}
            </p>
          </div>

          <!-- 对比分析 -->
          <div class="comparison-box">
            <h3 class="comparison-title">📊 与稳定方案对比</h3>
            <div class="comparison-grid">
              <div class="comparison-item">
                <span class="label">方案A（稳定）：</span>
                <span class="value safe">200万</span>
              </div>
              <div class="comparison-item">
                <span class="label">方案B（本次）：</span>
                <span class="value" :class="results[0].win ? 'risky-win' : 'risky-lose'">
                  {{ formatMoney(results[0].amount) }}
                </span>
              </div>
              <div class="comparison-item highlight">
                <span class="label">差异：</span>
                <span class="value" :class="results[0].amount >= 2000000 ? 'positive' : 'negative'">
                  {{ formatDifference(results[0].amount - 2000000) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 多次结果 -->
        <div v-else class="multiple-results">
          <!-- 统计面板 -->
          <div class="stats-panel">
            <div class="stat-card total">
              <div class="stat-label">方案B总收益</div>
              <div class="stat-value gold">{{ formatMoney(totalAmountB) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">成功次数</div>
              <div class="stat-value success">{{ winCount }} / {{ selectedTimes }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">失败次数</div>
              <div class="stat-value lose">{{ loseCount }} / {{ selectedTimes }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">实际成功率</div>
              <div class="stat-value">{{ winRate }}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">失败率</div>
              <div class="stat-value">{{ loseRate }}%</div>
            </div>
          </div>

          <!-- 对比分析 -->
          <div class="comparison-box">
            <h3 class="comparison-title">📊 与稳定方案对比</h3>
            <div class="comparison-grid">
              <div class="comparison-item">
                <span class="label">方案A总收益（稳定）：</span>
                <span class="value safe">{{ formatMoney(totalAmountA) }}</span>
              </div>
              <div class="comparison-item">
                <span class="label">方案B总收益（实际）：</span>
                <span class="value" :class="totalAmountB > totalAmountA ? 'risky-win' : 'risky-lose'">
                  {{ formatMoney(totalAmountB) }}
                </span>
              </div>
              <div class="comparison-item highlight">
                <span class="label">方案B vs 方案A差异：</span>
                <span class="value" :class="totalAmountB >= totalAmountA ? 'positive' : 'negative'">
                  {{ formatDifference(totalAmountB - totalAmountA) }}
                </span>
              </div>
            </div>
            
            <div class="comparison-conclusion">
              <p v-if="totalAmountB > totalAmountA" class="conclusion-text win">
                🎊 恭喜中奖！方案B本次收益 <strong>超过</strong> 方案A {{ formatMoney(totalAmountB - totalAmountA) }}
              </p>
              <p v-else class="conclusion-text lose">
                😔 遗憾！方案B本次收益 <strong>低于</strong> 方案A {{ formatMoney(totalAmountA - totalAmountB) }}
              </p>
            </div>
          </div>

          <!-- 详细结果列表 -->
          <div class="results-list-section">
            <div class="list-header" @click="toggleDetailList">
              <h3>详细结果列表</h3>
              <span class="toggle-icon">{{ showDetailList ? '▼' : '▶' }}</span>
            </div>
            <transition name="slide">
              <div v-if="showDetailList" class="results-list">
                <div 
                  v-for="(result, index) in results" 
                  :key="index"
                  :class="['result-item', result.win ? 'win' : 'lose']"
                >
                  <span class="result-index">#{{ index + 1 }}</span>
                  <span class="result-status-text">{{ result.win ? '✓ 恭喜中奖' : '✗ 未中' }}</span>
                  <span class="result-amount-text">{{ formatMoney(result.amount) }}</span>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- 重新抽奖按钮 -->
        <button @click="resetGame" class="reset-btn">
          再来一次
        </button>
      </div>
    </div>

    <!-- 金色粒子动画层 -->
    <div v-if="showParticles" class="particles-container">
      <div v-for="i in 30" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <!-- 底部作者信息 -->
    <div class="author-footer">
      <a href="https://github.com/wenbochang888/random-money" target="_blank" class="footer-link">GitHub</a>
      <span class="footer-divider">|</span>
      <span class="footer-text">微信公众号：《程序员博博》</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LotteryGame',
  data() {
    return {
      selectedTimes: null, // 1, 10, 100
      isRunning: false,
      showResult: false,
      currentRound: 0,
      results: [],
      showDetailList: false,
      showParticles: false
    };
  },
  computed: {
    // 方案B（博弈）的统计
    winCount() {
      return this.results.filter(r => r.win).length;
    },
    loseCount() {
      return this.results.filter(r => !r.win).length;
    },
    totalAmountB() {
      return this.results.reduce((sum, r) => sum + r.amount, 0);
    },
    winRate() {
      if (this.results.length === 0) return 0;
      return ((this.winCount / this.results.length) * 100).toFixed(1);
    },
    loseRate() {
      if (this.results.length === 0) return 0;
      return ((this.loseCount / this.results.length) * 100).toFixed(1);
    },
    // 方案A（稳定）的总收益
    totalAmountA() {
      // 方案A：100% * 200万 * 次数
      return 2000000 * this.selectedTimes;
    }
  },
  methods: {
    goBack() {
      this.$emit('go-back');
    },
    async selectAndStartLottery(times) {
      if (this.isRunning) return;
      
      this.selectedTimes = times;
      this.showResult = false;
      this.results = [];
      
      // 立即开始抽奖
      await this.startLottery();
    },
    async startLottery() {
      this.isRunning = true;
      this.showResult = false;
      this.results = [];
      this.currentRound = 0;

      // 先快速计算所有抽奖结果（不延迟）
      for (let i = 0; i < this.selectedTimes; i++) {
        const result = this.performSingleLottery();
        this.results.push(result);
      }

      // 根据抽奖次数设置动画时长
      let animationDuration = 0;
      if (this.selectedTimes === 1) {
        animationDuration = 0; // 单次立即完成
      } else if (this.selectedTimes === 10) {
        animationDuration = 500; // 500ms
      } else if (this.selectedTimes === 100) {
        animationDuration = 1000; // 1s
      } else if (this.selectedTimes === 1000) {
        animationDuration = 1500; // 1.5s
      } else if (this.selectedTimes === 10000) {
        animationDuration = 2000; // 2s
      }

      // 如果有动画时间，则播放进度动画
      if (animationDuration > 0) {
        const updateInterval = 50; // 每50ms更新一次进度
        const totalSteps = animationDuration / updateInterval;
        
        for (let step = 1; step <= totalSteps; step++) {
          this.currentRound = Math.floor((step / totalSteps) * this.selectedTimes);
          await this.sleep(updateInterval);
        }
      }
      
      this.currentRound = this.selectedTimes; // 确保显示最终数字

      this.isRunning = false;
      
      // 如果单次且中奖，显示粒子效果
      if (this.selectedTimes === 1 && this.results[0].win) {
        this.showParticles = true;
        setTimeout(() => {
          this.showParticles = false;
        }, 2000);
      }
      
      // 显示结果
      await this.sleep(100);
      this.showResult = true;
    },
    performSingleLottery() {
      // 方案B：99%获得2亿，1%获得0
      const random = Math.random();
      if (random < 0.99) {
        return {
          win: true,
          amount: 200000000 // 2亿
        };
      } else {
        return {
          win: false,
          amount: 0
        };
      }
    },
    formatMoney(amount) {
      if (amount === 0) return '0元';
      
      if (amount >= 100000000) {
        return (amount / 100000000).toFixed(2) + '亿元';
      } else if (amount >= 10000) {
        return (amount / 10000).toFixed(0) + '万元';
      } else {
        return amount.toFixed(0) + '元';
      }
    },
    formatDifference(diff) {
      const prefix = diff >= 0 ? '+' : '';
      return prefix + this.formatMoney(Math.abs(diff));
    },
    toggleDetailList() {
      this.showDetailList = !this.showDetailList;
    },
    resetGame() {
      this.showResult = false;
      this.results = [];
      this.selectedTimes = null;
      this.showDetailList = false;
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    getParticleStyle(index) {
      const angle = (index / 30) * 360;
      const distance = 100 + Math.random() * 200;
      const duration = 1 + Math.random() * 1;
      
      return {
        '--angle': angle + 'deg',
        '--distance': distance + 'px',
        '--duration': duration + 's',
        '--delay': (Math.random() * 0.5) + 's'
      };
    }
  }
};
</script>

<style scoped>
.lottery-game {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  position: relative;
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.back-btn:hover {
  background: #667eea;
  color: white;
  transform: translateX(-5px);
}

/* 知乎链接样式 */
.zhihu-link-section {
  max-width: 900px;
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
  margin-top: 60px;
  padding: 15px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
}

.zhihu-link {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.5;
  transition: all 0.3s ease;
  display: block;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.zhihu-link:hover {
  color: #ffeaa7;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
}

.container {
  max-width: 900px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 15px;
  font-weight: bold;
}

.game-intro {
  text-align: center;
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
}

/* 方案说明区域 */
.plan-section {
  margin-bottom: 40px;
}

.plan-comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.plan-card {
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  border: 2px solid transparent;
}

.plan-card.safe {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-color: #4CAF50;
}

.plan-card.risky {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border-color: #ff9800;
}

.plan-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.plan-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.plan-rate {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 8px;
}

.plan-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 8px;
}

.plan-fail {
  font-size: 0.9rem;
  color: #95a5a6;
  margin-bottom: 8px;
}

.plan-expected {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-style: italic;
}

.vs-divider {
  font-size: 1.8rem;
  font-weight: bold;
  color: #667eea;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.plan-note {
  text-align: center;
  padding: 15px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  color: #667eea;
  font-weight: 500;
  font-size: 1.05rem;
}

.times-section {
  margin-bottom: 30px;
}

.times-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.times-btn {
  padding: 15px 30px;
  font-size: 1.1rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.times-btn:hover {
  background: rgba(102, 126, 234, 0.2);
}

.times-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.times-btn:disabled {
  background: #e0e0e0;
  color: #9e9e9e;
  border-color: #bdbdbd;
  cursor: not-allowed;
  opacity: 0.6;
}

.times-btn:disabled:hover {
  transform: none;
  background: #e0e0e0;
}

.running-section {
  padding: 40px 0;
  text-align: center;
}

.progress-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-section {
  margin-top: 40px;
  animation: fadeIn 0.5s ease;
}

.single-result {
  text-align: center;
}

.result-card {
  padding: 40px;
  border-radius: 20px;
  margin-bottom: 30px;
}

.result-card.win {
  background: linear-gradient(135deg, #fff9c4, #ffe082);
  border: 3px solid #ffd54f;
  box-shadow: 0 0 30px rgba(255, 193, 7, 0.5);
}

.result-card.lose {
  background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
  border: 3px solid #9e9e9e;
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.result-status {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #2c3e50;
}

.result-amount {
  font-size: 2.5rem;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 15px;
}

.result-desc {
  font-size: 1.1rem;
  color: #7f8c8d;
}

/* 对比框 */
.comparison-box {
  background: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  border: 2px solid #dee2e6;
}

.comparison-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
}

.comparison-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  font-size: 1.05rem;
}

.comparison-item.highlight {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 2px solid #667eea;
  font-weight: 600;
}

.comparison-item .label {
  color: #7f8c8d;
  font-weight: 500;
}

.comparison-item .value {
  font-weight: bold;
  color: #2c3e50;
}

.comparison-item .value.safe {
  color: #4CAF50;
}

.comparison-item .value.risky-win {
  color: #ff9800;
}

.comparison-item .value.risky-lose {
  color: #e74c3c;
}

.comparison-item .value.positive {
  color: #4CAF50;
}

.comparison-item .value.negative {
  color: #e74c3c;
}

.comparison-conclusion {
  margin-top: 20px;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.conclusion-text {
  font-size: 1.2rem;
  margin: 0;
  font-weight: 600;
}

.conclusion-text.win {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  padding: 15px;
  border-radius: 10px;
}

.conclusion-text.lose {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  padding: 15px;
  border-radius: 10px;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  padding: 25px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
  text-align: center;
  border: 2px solid #dee2e6;
}

.stat-card.total {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #fff9c4, #ffe082);
  border-color: #ffd54f;
}

.stat-label {
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 10px;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value.gold {
  font-size: 2.5rem;
  color: #f39c12;
}

.stat-value.success {
  color: #4CAF50;
}

.stat-value.lose {
  color: #e74c3c;
}

.results-list-section {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 30px;
  border: 2px solid #dee2e6;
}

.list-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.list-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.toggle-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.results-list {
  max-height: 400px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
}

.result-item:hover {
  background: #f8f9fa;
}

.result-item.win {
  background: rgba(76, 175, 80, 0.05);
}

.result-item.lose {
  background: rgba(231, 76, 60, 0.05);
}

.result-index {
  font-weight: bold;
  color: #7f8c8d;
  min-width: 50px;
}

.result-status-text {
  flex: 1;
  font-weight: 600;
}

.result-item.win .result-status-text {
  color: #4CAF50;
}

.result-item.lose .result-status-text {
  color: #e74c3c;
}

.result-amount-text {
  font-weight: bold;
  color: #2c3e50;
}

.reset-btn {
  width: 100%;
  padding: 18px;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.reset-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
}

/* 粒子动画 */
.particles-container {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  pointer-events: none;
  z-index: 1000;
}

.particle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, #ffd700, #ffed4e);
  border-radius: 50%;
  animation: particle-burst var(--duration) ease-out var(--delay) forwards;
  transform-origin: center;
}

@keyframes particle-burst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(cos(var(--angle)) * var(--distance)),
      calc(sin(var(--angle)) * var(--distance))
    ) scale(0);
    opacity: 0;
  }
}

/* 滑动过渡动画 */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
  max-height: 400px;
}

.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .zhihu-link-section {
    margin: 10px;
    padding: 12px;
  }
  
  .zhihu-link {
    font-size: 0.95rem;
  }
  
  .container {
    padding: 25px;
  }

  .title {
    font-size: 2rem;
  }

  .plan-comparison {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .vs-divider {
    font-size: 1.5rem;
  }

  .stats-panel {
    grid-template-columns: 1fr;
  }

  .result-card {
    padding: 25px 20px;
  }

  .result-icon {
    font-size: 3rem;
  }

  .result-amount {
    font-size: 2rem;
  }

  .back-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

/* 底部作者信息样式 */
.author-footer {
  width: 100%;
  text-align: center;
  padding: 20px;
  margin-top: 50px;
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
</style>
