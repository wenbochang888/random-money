<template>
  <div class="death-simulator">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">
      ← 返回主页
    </button>
    
    <!-- 知乎问题链接标题 - 移到最顶部 -->
    <div class="zhihu-link-section">
      <a href="https://www.zhihu.com/question/1918581330402337118" target="_blank" class="zhihu-link">
        知乎问题："每毫秒给你1个亿，代价是你每秒被动触发一次1亿分之一的死亡率，你愿意吗？"
      </a>
    </div>
    
    <div class="container">
      <h1 class="title">死亡概率模拟器</h1>
      
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
      
      <!-- 概率选择器 -->
      <div class="probability-section">
        <label class="probability-label">选择每秒死亡概率：</label>
        <div class="probability-options">
          <button 
            v-for="option in probabilityOptions" 
            :key="option.value"
            @click="selectProbability(option)"
            :class="['probability-btn', { active: selectedProbability.value === option.value }]"
          >
            {{ option.label }}
          </button>
        </div>
        <p class="description">
          当前概率：<strong>{{ selectedProbability.label }}</strong>，模拟你能存活多久
        </p>
        <p class="expected-time">
          理论期望存活时间：<strong>{{ expectedLifetime }}</strong>
        </p>
      </div>
      
      <!-- 单次模拟 -->
      <div class="simulation-section">
        <button @click="runSingleSimulation" :disabled="isRunning" class="sim-button">
          {{ buttonText }}
        </button>
        
        <!-- 运行状态显示 -->
        <div v-if="isRunning" class="running-status">
          <div class="progress-indicator">
            <div class="spinner"></div>
            <p>正在模拟中，当前已存活：<strong class="current-time">{{ currentTime }}</strong> 年</p>
          </div>
        </div>
        
        <div v-if="singleResult" class="result-box single-result">
          <h3>模拟结果</h3>
          <p>在 <strong class="probability-text">{{ selectedProbability.label }}</strong> 的死亡概率下</p>
          <p>你存活了 <strong class="highlight">{{ singleResult }}</strong> 年</p>
          <p class="equivalent-text">相当于 {{ equivalentDays }} 天</p>
          
          <div class="money-result">
            <h4 class="money-title">💰 获得金额</h4>
            <p class="money-amount">{{ earnedMoney }}</p>
            <p class="money-description">每毫秒1亿 × 存活{{ (parseFloat(singleResult) * 31536000).toFixed(0) }}秒</p>
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
        <h2 class="ranking-title">🏆 排行榜 - {{ selectedProbability.label }}</h2>
        <p class="ranking-subtitle">当前概率下存活时间最长的前10名 · 排行榜每月会随机更新</p>
        
        <div v-if="rankings.length === 0" class="ranking-empty">
          <p>暂无排行数据，快来创造第一个记录吧！</p>
        </div>
        
        <div v-else class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr>
                <th class="rank-col">排名</th>
                <th class="name-col">用户名</th>
                <th class="survival-col">存活时间</th>
                <th class="money-col">获得金额</th>
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
                <td class="survival-col">
                  <strong>{{ record.survivalYears.toFixed(2) }}</strong> 年
                  <span class="days-text">({{ record.survivalDays }} 天)</span>
                </td>
                <td class="money-col">{{ record.earnedMoney }}</td>
                <td class="date-col">{{ formatDate(record.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
import { insertRanking, getRankingByProbability } from '@/services/rankingService.js';

export default {
  name: 'DeathSimulator',
  data() {
    return {
      // 每年秒数（近似）
      SECONDS_PER_YEAR: 60 * 60 * 24 * 365,
      // 用户名（默认空字符串，提交时如果为空则使用"匿名用户"）
      userName: '',
      // 收款码图片
      wxQRCode: require('../assets/wx.jpg'),
      // 模态框控制
      showModal: false,
      showEnlargeModal: false,
      // 概率选项（从小概率到大概率排列）
      probabilityOptions: [
        { label: '十亿分之一', value: 1 / 1000000000, description: '1/1,000,000,000', key: '1e-9' },
        { label: '一亿分之一', value: 1 / 100000000, description: '1/100,000,000', key: '1e-8' },
        { label: '千万分之一', value: 1 / 10000000, description: '1/10,000,000', key: '1e-7' },
        { label: '百万分之一', value: 1 / 1000000, description: '1/1,000,000', key: '1e-6' }
      ],
      // 当前选中的概率（默认选择十亿分之一）
      selectedProbability: { label: '十亿分之一', value: 1 / 1000000000, description: '1/1,000,000,000', key: '1e-9' },
      // 状态管理
      isRunning: false,
      currentTime: '0.00',
      // 结果存储
      singleResult: null,
      // 排行榜数据
      rankings: [],
      // 分享功能
      showCopySuccess: false
    };
  },
  computed: {
    buttonText() {
      if (this.isRunning) {
        return '模拟中...';
      }
      return '开始模拟';
    },
    equivalentDays() {
      if (!this.singleResult) return '0';
      return (parseFloat(this.singleResult) * 365).toFixed(0);
    },
    // 计算获得的金额
    earnedMoney() {
      if (!this.singleResult) return '0';
      
      const years = parseFloat(this.singleResult);
      const seconds = years * this.SECONDS_PER_YEAR;
      const milliseconds = seconds * 1000;
      const totalMoney = milliseconds * 100000000; // 每毫秒1亿
      
      return this.formatMoney(totalMoney);
    },
    // 获得的金额（数值）
    earnedMoneyValue() {
      if (!this.singleResult) return 0;
      
      const years = parseFloat(this.singleResult);
      const seconds = years * this.SECONDS_PER_YEAR;
      const milliseconds = seconds * 1000;
      return milliseconds * 100000000; // 每毫秒1亿
    },
    expectedLifetime() {
      if (!this.selectedProbability) return '计算中...';
      
      const expectedSeconds = 1 / this.selectedProbability.value;
      
      // 根据时间长度选择最合适的单位显示
      if (expectedSeconds < 60) {
        return `${expectedSeconds.toFixed(1)} 秒`;
      } else if (expectedSeconds < 3600) {
        const minutes = (expectedSeconds / 60).toFixed(1);
        return `${minutes} 分钟`;
      } else if (expectedSeconds < 86400) {
        const hours = (expectedSeconds / 3600).toFixed(1);
        return `${hours} 小时`;
      } else if (expectedSeconds < 31536000) {
        const days = (expectedSeconds / 86400).toFixed(1);
        return `${days} 天`;
      } else {
        const years = (expectedSeconds / this.SECONDS_PER_YEAR);
        if (years < 1000) {
          return `${years.toFixed(1)} 年`;
        } else if (years < 1000000) {
          const thousands = (years / 1000).toFixed(1);
          return `${thousands} 千年`;
        } else {
          const millions = (years / 1000000).toFixed(1);
          return `${millions} 百万年`;
        }
      }
    }
  },
  mounted() {
    // 组件加载时获取当前概率的排行榜
    this.loadRankings();
  },
  watch: {
    // 监听概率变化，重新加载排行榜
    'selectedProbability.key'() {
      this.loadRankings();
    }
  },
  methods: {
    // 返回主页
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
    async loadRankings() {
      try {
        const result = await getRankingByProbability(this.selectedProbability.key, 10);
        if (result.success) {
          this.rankings = result.data.records;
        }
      } catch (error) {
        console.error('加载排行榜失败:', error);
      }
    },
    
    // 保存记录到排行榜
    async saveToRanking() {
      console.log('===== saveToRanking 方法被调用 =====');
      
      if (!this.singleResult) {
        console.warn('没有模拟结果，跳过保存');
        return;
      }
      
      const recordData = {
        userName: this.userName.trim() || '匿名用户',
        probability: this.selectedProbability.key,
        probabilityLabel: this.selectedProbability.label,
        survivalYears: parseFloat(this.singleResult),
        survivalDays: parseInt(this.equivalentDays),
        earnedMoney: this.earnedMoney,
        earnedMoneyValue: this.earnedMoneyValue.toString()  // 转为字符串，避免超出Long范围
      };
      
      console.log('准备保存的数据:', recordData);
      
      try {
        console.log('开始调用 insertRanking...');
        const result = await insertRanking(recordData);
        console.log('insertRanking 返回结果:', result);
        
        if (result.success) {
          console.log('✅ 记录已成功保存到排行榜');
          // 重新加载排行榜
          await this.loadRankings();
        } else {
          console.error('❌ 保存失败:', result.message);
          // 静默处理失败，不弹窗提示
        }
      } catch (error) {
        console.error('❌ 保存记录异常:', error);
        // 静默处理异常，不弹窗提示
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
    // 选择概率
    selectProbability(option) {
      this.selectedProbability = option;
      this.singleResult = null; // 清除之前的结果
    },
    
    // 单次模拟 - 优化版本
    async runSingleSimulation() {
      if (this.isRunning) return;
      
      this.isRunning = true;
      this.singleResult = null;
      this.currentTime = '0.00';
      
      // 使用几何分布直接计算死亡时间
      const finalSecondsLived = this.calculateDeathTime();
      const finalYearsLived = finalSecondsLived / this.SECONDS_PER_YEAR;
      
      // 调试信息（可选）
      if (process.env.NODE_ENV === 'development') {
        const expectedSeconds = 1 / this.selectedProbability.value;
        const expectedYears = expectedSeconds / this.SECONDS_PER_YEAR;
        const totalMilliseconds = finalSecondsLived * 1000;
        const totalMoney = totalMilliseconds * 100000000;
        
        console.log(`模拟参数:`, {
          概率: this.selectedProbability.label,
          期望秒数: expectedSeconds.toFixed(0),
          期望年数: expectedYears.toFixed(2),
          实际秒数: finalSecondsLived,
          实际年数: finalYearsLived.toFixed(2),
          存活毫秒数: totalMilliseconds,
          获得金额: this.formatMoney(totalMoney),
          金额数值: totalMoney.toExponential(2),
          比例: (finalSecondsLived / expectedSeconds).toFixed(2)
        });
      }
      
      // 根据概率调整动画参数
      const animationParams = this.getAnimationParams();
      
      let currentSeconds = 0;
      const startTime = Date.now();
      
      // 动画函数 - 快速递增到最终结果
      const animateToResult = () => {
        return new Promise((resolve) => {
          let step = 0;
          const totalSteps = animationParams.totalSteps;
          
          const animate = () => {
            step++;
            
            // 使用easing function创建平滑动画
            const progress = step / totalSteps;
            const easedProgress = 1 - Math.pow(1 - progress, 3); // 缓出动画
            
            currentSeconds = finalSecondsLived * easedProgress;
            const currentYears = currentSeconds / this.SECONDS_PER_YEAR;
            this.currentTime = currentYears.toFixed(2);
            
            if (step >= totalSteps) {
              // 确保最终值准确
              this.currentTime = finalYearsLived.toFixed(2);
              resolve();
              return;
            }
            
            // 递归调用，创建平滑动画
            setTimeout(animate, animationParams.interval);
          };
          
          animate();
        });
      };
      
      // 执行动画
      await animateToResult();
      
      // 设置最终结果
      this.singleResult = finalYearsLived.toFixed(2);
      this.isRunning = false;
      
      // 保存记录到排行榜
      await this.saveToRanking();
    },
    
    // 使用几何分布计算死亡时间
    calculateDeathTime() {
      const p = this.selectedProbability.value;
      
      // 使用正确的几何分布逆变换采样公式
      // X = ceil(log(U) / log(1-p)) 其中 U ~ Uniform(0,1)
      const u = Math.random();
      
      // 确保u不为0，避免log(0)的问题
      const u_safe = Math.max(u, 1e-10);
      
      // 几何分布的逆变换采样（正确公式）
      const deathTime = Math.ceil(Math.log(u_safe) / Math.log(1 - p));
      
      return Math.max(1, deathTime);
    },
    
    // 根据概率获取动画参数
    getAnimationParams() {
      const p = this.selectedProbability.value;
      const expectedSeconds = 1 / p;
      
      // 根据期望存活时间调整动画参数
      if (expectedSeconds < 100000) {
        // 百万分之一 - 以分钟为单位显示
        return {
          interval: 60,           // 60ms 更新一次
          minIncrement: Math.max(60, expectedSeconds / 40),
          maxIncrement: Math.max(300, expectedSeconds / 15),
          speedFactor: 0.08,
          totalSteps: 30
        };
      } else if (expectedSeconds < 50000000) {
        // 千万分之一 - 以小时为单位显示
        return {
          interval: 50,           // 50ms 更新一次
          minIncrement: Math.max(3600, expectedSeconds / 30),
          maxIncrement: Math.max(7200, expectedSeconds / 10),
          speedFactor: 0.06,
          totalSteps: 35
        };
      } else if (expectedSeconds < 500000000) {
        // 一亿分之一 - 以天为单位显示
        return {
          interval: 45,           // 45ms 更新一次
          minIncrement: Math.max(86400, expectedSeconds / 25),
          maxIncrement: Math.max(172800, expectedSeconds / 8),
          speedFactor: 0.05,
          totalSteps: 40
        };
      } else {
        // 十亿分之一 - 以月/年为单位显示
        return {
          interval: 35,           // 35ms 更新一次
          minIncrement: Math.max(2592000, expectedSeconds / 20), // 以月为单位
          maxIncrement: Math.max(31536000, expectedSeconds / 6),  // 以年为单位
          speedFactor: 0.04,
          totalSteps: 45
        };
      }
    },
    
    // 格式化金额显示
    formatMoney(amount) {
      if (amount === 0) return '0元';
      
      // 转换为中文单位
      const units = [
        { name: '元', value: 1 },
        { name: '万元', value: 10000 },
        { name: '亿元', value: 100000000 },
        { name: '万亿元', value: 1000000000000 },
        { name: '千万亿元', value: 10000000000000000 },
        { name: '亿亿元', value: 100000000000000000 }
      ];
      
      // 找到合适的单位
      for (let i = units.length - 1; i >= 0; i--) {
        if (amount >= units[i].value) {
          const value = amount / units[i].value;
          if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}千${units[i].name}`;
          } else {
            return `${value.toFixed(1)}${units[i].name}`;
          }
        }
      }
      
      return `${amount.toFixed(0)}元`;
    },
    
    // 分享结果
    async shareResult() {
      const userName = this.userName.trim() || '我';
      const years = parseFloat(this.singleResult);
      const days = this.equivalentDays;
      const money = this.earnedMoney;
      
      // 生成吸引人的分享文案
      let shareText = '';
      
      if (years >= 1000) {
        shareText = `🎉 太惊人了！${userName}在死亡概率模拟器中存活了 ${this.singleResult} 年，获得了 ${money}！\n\n你敢挑战吗？快来试试你能存活多久！\n\n网址：https://www.gdufe888.top/wt/\n\n微信公众号：程序员博博`;
      } else if (years >= 100) {
        shareText = `💪 厉害！${userName}在死亡概率模拟器中存活了 ${this.singleResult} 年（${days}天），赚取了 ${money}！\n\n你也来挑战一下，看看能否打破这个记录！\n\n网址：https://www.gdufe888.top/wt/\n\n微信公众号：程序员博博`;
      } else if (years >= 10) {
        shareText = `🎯 ${userName}在死亡概率模拟器中存活了 ${this.singleResult} 年，获得了 ${money}！\n\n这是运气还是实力？快来验证你的概率直觉！\n\n网址：https://www.gdufe888.top/wt/\n\n微信公众号：程序员博博`;
      } else {
        shareText = `😱 ${userName}在死亡概率模拟器中存活了 ${days} 天，获得了 ${money}！\n\n你的运气会更好吗？快来挑战概率的极限！\n\n网址：https://www.gdufe888.top/wt/\n\n微信公众号：程序员博博`;
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
.death-simulator {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
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

.container {
  max-width: 650px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

/* 知乎链接标题样式 - 置于最顶部 */
.zhihu-link-section {
  max-width: 650px;
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
  margin-top: 80px;
  padding: 15px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
}

.zhihu-link {
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
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

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
  font-weight: bold;
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

/* 概率选择器样式 */
.probability-section {
  margin-bottom: 30px;
}

.probability-label {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
  text-align: center;
}

.probability-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.probability-btn {
  padding: 10px 15px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #7f8c8d;
  background: rgba(127, 140, 141, 0.1);
  border: 2px solid rgba(127, 140, 141, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.probability-btn:hover {
  background: rgba(52, 152, 219, 0.1);
  border-color: rgba(52, 152, 219, 0.5);
  color: #3498db;
}

.probability-btn.active {
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  border-color: #2980b9;
  box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);
}

.description {
  text-align: center;
  color: #7f8c8d;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 8px;
}

.expected-time {
  text-align: center;
  color: #5a5a5a;
  font-size: 0.95rem;
  font-style: italic;
  margin-top: 0;
  padding: 8px 15px;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

/* 模拟按钮 */
.simulation-section {
  margin-bottom: 30px;
}

.sim-button {
  width: 100%;
  padding: 18px 25px;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.sim-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.sim-button:disabled {
  background: linear-gradient(45deg, #bdc3c7, #95a5a6);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(189, 195, 199, 0.3);
}

/* 运行状态显示 */
.running-status {
  margin-top: 20px;
  animation: fadeIn 0.5s ease-in;
}

.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 10px;
  border-left: 4px solid #3498db;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.current-time {
  color: #3498db;
  font-size: 1.1em;
  font-weight: bold;
}

/* 结果显示 */
.result-box {
  margin-top: 25px;
  padding: 25px;
  border-radius: 12px;
  animation: fadeIn 0.5s ease-in;
  background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
  border-left: 5px solid #4CAF50;
}

.result-box h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.probability-text {
  color: #3498db;
  font-weight: 600;
}

.highlight {
  color: #e74c3c;
  font-size: 1.4em;
  font-weight: bold;
}

.equivalent-text {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin-top: 8px;
  font-style: italic;
}

/* 金额结果样式 */
.money-result {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
  border-radius: 12px;
  border: 2px solid #f39c12;
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
}

.money-title {
  margin: 0 0 12px 0;
  color: #d35400;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}

.money-amount {
  font-size: 1.8rem;
  font-weight: bold;
  color: #c0392b;
  text-align: center;
  margin: 10px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.money-description {
  font-size: 0.9rem;
  color: #8e44ad;
  text-align: center;
  font-style: italic;
  margin-top: 8px;
}

/* 分享功能样式 */
.share-section {
  margin-top: 25px;
  text-align: center;
}

.share-btn {
  width: 100%;
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
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
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
  text-align: left;
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

.survival-col {
  width: 180px;
}

.survival-col strong {
  color: #e74c3c;
  font-size: 1.05rem;
}

.days-text {
  display: block;
  font-size: 0.85rem;
  color: #95a5a6;
  margin-top: 2px;
}

.money-col {
  width: 150px;
  color: #f39c12;
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
    margin: 90px 10px 15px 10px;
    padding: 12px;
  }
  
  .zhihu-link {
    font-size: 1rem;
    line-height: 1.4;
  }
  
  .container {
    padding: 25px;
    margin: 10px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .probability-options {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .probability-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  
  .sim-button {
    padding: 15px 20px;
    font-size: 1.1rem;
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
  }
  
  .ranking-table th,
  .ranking-table td {
    padding: 10px 8px;
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
    width: 100px;
  }
  
  .survival-col {
    width: 140px;
  }
  
  .days-text {
    font-size: 0.75rem;
  }
  
  .money-col {
    width: 120px;
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
