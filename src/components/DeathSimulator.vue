<template>
  <div class="death-simulator">
    <!-- 知乎问题链接标题 - 移到最顶部 -->
    <div class="zhihu-link-section">
      <a href="https://www.zhihu.com/question/1918581330402337118" target="_blank" class="zhihu-link">
        知乎问题："每毫秒给你1个亿，代价是你每秒被动触发一次1亿分之一的死亡率，你愿意吗？"
      </a>
    </div>
    
    <div class="container">
      <h1 class="title">死亡概率模拟器</h1>
      
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeathSimulator',
  data() {
    return {
      // 每年秒数（近似）
      SECONDS_PER_YEAR: 60 * 60 * 24 * 365,
      // 概率选项（从小概率到大概率排列）
      probabilityOptions: [
        { label: '十亿分之一', value: 1 / 1000000000, description: '1/1,000,000,000' },
        { label: '一亿分之一', value: 1 / 100000000, description: '1/100,000,000' },
        { label: '千万分之一', value: 1 / 10000000, description: '1/10,000,000' },
        { label: '百万分之一', value: 1 / 1000000, description: '1/1,000,000' }
      ],
      // 当前选中的概率（默认选择十亿分之一）
      selectedProbability: { label: '十亿分之一', value: 1 / 1000000000, description: '1/1,000,000,000' },
      // 状态管理
      isRunning: false,
      currentTime: '0.00',
      // 结果存储
      singleResult: null
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
  methods: {
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
}
</style>
