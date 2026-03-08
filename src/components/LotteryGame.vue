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

      <!-- 用户名输入区 -->
      <div class="username-section">
        <label class="username-label">请输入你的名字：</label>
        <input 
          v-model="userName" 
          type="text" 
          class="username-input"
          placeholder="例如：小李"
          maxlength="6"
        />
        <p class="username-hint">名字将用于记录和排行榜统计（留空则显示为"匿名用户"）</p>
      </div>

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
        <!-- <h2 class="section-title">选择抽奖次数（点击立即开始）</h2> -->
        <div class="times-buttons">
          <button 
            v-for="times in [10000, 1000, 100, 10, 1]" 
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
          
          <!-- 分享按钮（单次） -->
          <div class="share-section">
            <button @click="shareResult" class="share-btn">
              🎉 一键分享结果
            </button>
            <transition name="fade">
              <div v-if="showCopySuccess" class="copy-success">✅ 已复制到剪贴板！</div>
            </transition>
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
          
          <!-- 分享按钮 -->
          <div class="share-section">
            <button @click="shareResult" class="share-btn">
              🎉 一键分享结果
            </button>
            <transition name="fade">
              <div v-if="showCopySuccess" class="copy-success">✅ 已复制到剪贴板！</div>
            </transition>
          </div>
        </div>
      </div>
      
      <!-- 排行榜区域 -->
      <div class="ranking-section">
        <h2 class="ranking-title">🏆 排行榜 - {{ lotteryTimesLabel || '单次抽奖' }}</h2>
        <p class="ranking-subtitle">当前抽奖次数下方案B总收益最高的前10名 · 排行榜每月会随机更新</p>
        
        <div v-if="rankings.length === 0" class="ranking-empty">
          <p>暂无排行数据，快来创造第一个记录吧！</p>
        </div>
        
        <div v-else class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr>
                <th class="rank-col">排名</th>
                <th class="name-col">用户名</th>
                <th class="amount-col">方案B总收益</th>
                <th class="win-col">成功/失败</th>
                <th class="date-col">记录时间</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(record, index) in rankings" 
                :key="record.id"
                :class="['ranking-row', { 'top-three': index < 3 }]"
              >
                <td class="rank-col">
                  <span :class="['rank-badge', getRankClass(index)]">
                    {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1 }}
                  </span>
                </td>
                <td class="name-col">{{ record.userName || '匿名用户' }}</td>
                <td class="amount-col">{{ formatMoney(record.totalAmountB) }}</td>
                <td class="win-col">
                  <span class="win-count">{{ record.winCount }}</span>
                  <span class="separator">/</span>
                  <span class="lose-count">{{ record.loseCount }}</span>
                </td>
                <td class="date-col">{{ formatDate(record.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 金色粒子动画层 -->
    <div v-if="showParticles" class="particles-container">
      <div v-for="i in 30" :key="i" class="particle" :style="getParticleStyle(i)"></div>
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
          <h2 class="modal-title">☕ 支持作者</h2>
          <p class="modal-description">如果本功能对您有帮助，欢迎请作者喝杯奶茶，谢谢！</p>
          <p class="modal-hint">💡 点击二维码可放大查看</p>
          <div class="qr-codes-modal">
            <div class="qr-wrapper">
              <img :src="wxQRCode" alt="微信收款码" class="qr-image-large clickable" @click="enlargeQRCode">
              <p class="qr-label-modal">微信支付</p>
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
import { insertLotteryRanking, getLotteryRankingByTimes } from '@/services/rankingService.js';

export default {
  name: 'LotteryGame',
  data() {
    return {
      // 用户名（默认空字符串，提交时如果为空则使用"匿名用户"）
      userName: '',
      selectedTimes: 10000, // 默认10000次，与排行榜默认显示一致
      // 收款码图片
      wxQRCode: require('../assets/wx.jpg'),
      // 模态框控制
      showModal: false,
      showEnlargeModal: false,
      isRunning: false,
      showResult: false,
      currentRound: 0,
      results: [],
      showParticles: false,
      // 排行榜数据
      rankings: [],
      // 分享功能
      showCopySuccess: false
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
    },
    // 获取抽奖次数标签
    lotteryTimesLabel() {
      const labels = {
        1: '单次抽奖',
        10: '10次抽奖',
        100: '100次抽奖',
        1000: '1000次抽奖',
        10000: '10000次抽奖'
      };
      return labels[this.selectedTimes] || '';
    }
  },
  mounted() {
    // 组件加载时，默认加载10000次抽奖的排行榜
    this.loadRankings(10000);
  },
  watch: {
    // 监听抽奖次数变化，重新加载排行榜
    selectedTimes(newTimes) {
      if (newTimes) {
        this.loadRankings(newTimes);
      }
    }
  },
  methods: {
    goBack() {
      this.$emit('go-back');
    },
    
    // 打开模态框
    openModal() {
      this.showModal = true;
      document.body.style.overflow = 'hidden';
    },
    
    // 关闭模态框
    closeModal() {
      this.showModal = false;
      document.body.style.overflow = '';
    },
    
    // 放大收款码
    enlargeQRCode() {
      this.showEnlargeModal = true;
    },
    
    // 关闭放大模态框
    closeEnlargeModal() {
      this.showEnlargeModal = false;
    },
    
    // 加载排行榜数据
    async loadRankings(times) {
      try {
        const result = await getLotteryRankingByTimes(times || this.selectedTimes || 1, 10);
        if (result.success) {
          this.rankings = result.data.records;
        }
      } catch (error) {
        console.error('加载风险抉择抽奖排行榜失败:', error);
      }
    },
    
    // 保存记录到排行榜
    async saveToRanking() {
      if (!this.selectedTimes || this.results.length === 0) {
        console.warn('没有抽奖结果，跳过保存');
        return;
      }
      
      const recordData = {
        userName: this.userName.trim() || '匿名用户',
        lotteryTimes: this.selectedTimes,
        lotteryTimesLabel: this.lotteryTimesLabel,
        totalAmountB: this.totalAmountB,
        winCount: this.winCount,
        loseCount: this.loseCount,
        winRate: parseFloat(this.winRate)
      };
      
      console.log('准备保存风险抉择抽奖数据:', recordData);
      
      try {
        const result = await insertLotteryRanking(recordData);
        if (result.success) {
          console.log('✅ 风险抉择抽奖记录已成功保存到排行榜');
          // 重新加载排行榜
          await this.loadRankings(this.selectedTimes);
        } else {
          console.error('❌ 保存失败:', result.message);
        }
      } catch (error) {
        console.error('❌ 保存风险抉择抽奖记录异常:', error);
      }
    },
    
    // 格式化日期显示
    formatDate(isoString) {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    
    // 获取排名样式类
    getRankClass(index) {
      if (index === 0) return 'rank-first';
      if (index === 1) return 'rank-second';
      if (index === 2) return 'rank-third';
      return '';
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
      
      // 保存记录到排行榜
      await this.saveToRanking();
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
    },
    
    // 分享结果
    async shareResult() {
      const userName = this.userName.trim() || '我';
      const times = this.selectedTimes;
      const winCount = this.winCount;
      const loseCount = this.loseCount;
      const totalMoney = this.formatMoney(this.totalAmountB);
      const winRate = this.winRate;
      
      // 生成吸引人的分享文案
      let shareText = '';
      
      if (times === 1) {
        // 单次抽奖
        if (this.results[0].win) {
          shareText = `🎊 天选之人！${userName}在风险抉择抽奖中成功抓住了99%的概率，一次性获得2亿元！\n\n你敢挑战吗？99%的2亿 vs 100%的200万，你会怎么选？\n\n网址：https://www.gdufe888.top/wt/\n\n微信公众号：程序员博博`;
        } else {
          shareText = `😱 ${userName}在风险抉择抽奖中抽到了那1%...与2亿擦肩而过！\n\n你的运气会更好吗？99%的2亿 vs 100%的200万，快来试试！\n\n网址：https://www.gdufe888.top/wt/\n\n微信公众号：程序员博博`;
        }
      } else {
        // 多次抽奖
        if (this.totalAmountB > this.totalAmountA) {
          shareText = `🎉 厉害了！${userName}进行了${times}次风险抉择，成功${winCount}次，总收益${totalMoney}，战胜了稳定方案！\n\n实际成功率${winRate}%，你敢挑战概率吗？\n\n网址：https://www.gdufe888.top/wt/\n\n微信公众号：程序员博博`;
        } else {
          shareText = `😂 ${userName}进行了${times}次风险抉择，成功${winCount}次、失败${loseCount}次，成功率${winRate}%，总收益${totalMoney}\n\n你的运气会更好吗？快来挑战99%的2亿！\n\n网址：https://www.gdufe888.top/wt/\n\n微信公众号：程序员博博`;
        }
      }
      
      try {
        // 使用现代剪贴板API
        await navigator.clipboard.writeText(shareText);
        this.showCopySuccess = true;
        
        // 3秒后隐藏提示
        setTimeout(() => {
          this.showCopySuccess = false;
        }, 3000);
      } catch (err) {
        // 降级方案：使用传统方法
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
          document.execCommand('copy');
          this.showCopySuccess = true;
          setTimeout(() => {
            this.showCopySuccess = false;
          }, 3000);
        } catch (err2) {
          alert('复制失败，请手动复制：\n\n' + shareText);
        }
        
        document.body.removeChild(textarea);
      }
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

/* 用户名输入区样式 */
.username-section {
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f4f8, #e3eaf2);
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.username-label {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.username-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 1rem;
  border: 2px solid #d1d9e6;
  border-radius: 8px;
  background: white;
  color: #2c3e50;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.username-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.username-input::placeholder {
  color: #95a5a6;
}

.username-hint {
  margin: 8px 0 0 0;
  font-size: 0.85rem;
  color: #7f8c8d;
  font-style: italic;
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

/* 分享功能样式 */
.share-section {
  margin-top: 30px;
  text-align: center;
}

.share-btn {
  width: 100%;
  max-width: 400px;
  padding: 15px 25px;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

.share-btn:active {
  transform: translateY(0);
}

.copy-success {
  margin-top: 15px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #2c3e50;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 2px 10px rgba(168, 237, 234, 0.3);
  display: inline-block;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
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

/* 排行榜样式 */
.ranking-section {
  margin-top: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
  border: 2px solid #dee2e6;
}

.ranking-title {
  font-size: 1.8rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 10px;
  font-weight: bold;
}

.ranking-subtitle {
  text-align: center;
  color: #7f8c8d;
  font-size: 1rem;
  margin-bottom: 25px;
}

.ranking-empty {
  text-align: center;
  padding: 40px 20px;
  color: #95a5a6;
  font-size: 1.1rem;
}

.ranking-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 0.95rem;
}

.ranking-table thead {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.ranking-table th {
  padding: 15px 12px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  color: white !important;
}

.ranking-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
}

.ranking-table tbody tr:hover {
  background: #f8f9fa;
}

.ranking-table tbody tr.top-three {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 223, 0, 0.1));
}

.ranking-table tbody tr.top-three:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 223, 0, 0.15));
}

.ranking-table td {
  padding: 12px;
  text-align: center;
  color: #2c3e50;
}

.rank-col {
  width: 80px;
  text-align: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 35px;
  height: 35px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.1rem;
}

.rank-badge.rank-first {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #d35400;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.rank-badge.rank-second {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #555;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.rank-badge.rank-third {
  background: linear-gradient(135deg, #cd7f32, #e6a567);
  color: white;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
}

.name-col {
  width: 120px;
  font-weight: 600;
  color: #667eea;
}

.times-col {
  width: 120px;
  color: #3498db;
  font-weight: 500;
}

.amount-col {
  width: 150px;
  color: #f39c12;
  font-weight: 600;
  font-size: 1rem;
}

.win-col {
  width: 120px;
  text-align: center;
}

.win-count {
  color: #4CAF50;
  font-weight: 600;
}

.separator {
  margin: 0 4px;
  color: #95a5a6;
}

.lose-count {
  color: #e74c3c;
  font-weight: 600;
}

.rate-col {
  width: 100px;
  text-align: center;
  color: #8e44ad;
  font-weight: 600;
}

.date-col {
  width: 140px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .back-btn {
    top: 15px;
    left: 15px;
    padding: 10px 18px;
    font-size: 0.9rem;
  }
  
  .zhihu-link-section {
    margin: 90px 10px 20px 10px;
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

  .username-section {
    padding: 15px;
  }
  
  .username-label {
    font-size: 1rem;
  }
  
  .username-input {
    padding: 10px 12px;
    font-size: 0.95rem;
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
  
  .ranking-section {
    padding: 20px 15px;
  }
  
  .ranking-title {
    font-size: 1.5rem;
  }
  
  .ranking-subtitle {
    font-size: 0.9rem;
  }
  
  .ranking-table {
    font-size: 0.85rem;
    white-space: nowrap;
    min-width: 600px;
  }
  
  .ranking-table th,
  .ranking-table td {
    padding: 10px 8px;
    text-align: center;
  }
  
  .rank-col {
    width: 60px;
  }
  
  .rank-badge {
    min-width: 30px;
    height: 30px;
    font-size: 0.95rem;
  }
  
  .name-col {
    min-width: 80px;
  }
  
  .times-col {
    width: 100px;
    font-size: 0.85rem;
  }
  
  .amount-col {
    width: 120px;
    font-size: 0.9rem;
  }
  
  .win-col {
    width: 100px;
    font-size: 0.85rem;
  }
  
  .rate-col {
    width: 80px;
    font-size: 0.85rem;
  }
  
  .date-col {
    width: 110px;
    font-size: 0.8rem;
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
    gap: 25px;
    flex-direction: column;
    align-items: center;
  }

  .qr-image-large {
    width: 160px;
    height: 160px;
  }

  .qr-label-modal {
    font-size: 0.9rem;
  }

  .modal-close {
    width: 35px;
    height: 35px;
    font-size: 1.3rem;
    top: 12px;
    right: 12px;
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
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(8px);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 24px;
  max-width: 90%;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-body {
  padding: 40px 35px;
}

.modal-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-description {
  text-align: center;
  color: #7f8c8d;
  font-size: 1.05rem;
  margin-bottom: 12px;
  line-height: 1.6;
}

.modal-hint {
  text-align: center;
  color: #95a5a6;
  font-size: 0.9rem;
  margin-bottom: 25px;
  font-style: italic;
}

.qr-codes-modal {
  display: flex;
  justify-content: center;
  gap: 35px;
  flex-wrap: wrap;
}

.qr-wrapper {
  text-align: center;
  transition: transform 0.3s ease;
}

.qr-wrapper:hover {
  transform: translateY(-5px);
}

.qr-image-large {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.qr-image-large.clickable {
  cursor: zoom-in;
}

.qr-image-large.clickable:hover {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  transform: scale(1.05);
}

.qr-label-modal {
  margin-top: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #2c3e50;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: rotate(90deg);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
</style>
