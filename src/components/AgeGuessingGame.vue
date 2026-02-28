<template>
  <div class="age-guessing-game">
    <button class="back-btn" @click="goBack">← 返回主页</button>
    
    <div class="zhihu-link-section">
      <a href="https://www.zhihu.com/question/1992732388074231124" target="_blank" class="zhihu-link">
        知乎问题："有一个神秘人，你如果猜对他的年龄就奖励500个亿，但每猜一次需要支付1元，你愿意吗？"
      </a>
    </div>
    
    <div class="container">
      <h1 class="title">🔮 神秘人年龄猜测</h1>
      <p class="game-intro">猜对神秘人的年龄（精确到秒），即可获得剩余奖金！</p>
      
      <div class="username-section">
        <label class="username-label">请输入你的名字：</label>
        <input v-model="userName" type="text" class="username-input" placeholder="例如：小李" maxlength="6" />
        <p class="username-hint">名字将用于记录和排行榜统计（留空则显示为"匿名用户"）</p>
      </div>
      
      <div class="game-section">
        <div v-if="!isGameOver && !isSuccess" class="game-playing">
          <div class="remaining-amount">
            <span class="amount-label">剩余奖金：</span>
            <span class="amount-value">{{ formatMoney(remainingAmount) }}</span>
          </div>
          
          <div class="guess-count">
            <span class="count-label">已猜测：</span>
            <span class="count-value">{{ guessCount }} 次</span>
          </div>
          
          <div class="age-input-section">
            <p class="input-hint">请猜测神秘人的年龄（精确到秒）：</p>
            
            <!-- PC端使用select，移动端使用滑动选择器 -->
            <div class="picker-wrapper">
              <!-- PC端选择器 -->
              <div class="picker-desktop">
                <div class="picker-row">
                  <div class="picker-column">
                    <label>年</label>
                    <select v-model.number="guessYears" class="age-select">
                      <option v-for="n in 101" :key="n-1" :value="n-1">{{ n-1 }}</option>
                    </select>
                  </div>
                  <div class="picker-column">
                    <label>月</label>
                    <select v-model.number="guessMonths" class="age-select">
                      <option v-for="n in 13" :key="n-1" :value="n-1">{{ n-1 }}</option>
                    </select>
                  </div>
                  <div class="picker-column">
                    <label>日</label>
                    <select v-model.number="guessDays" class="age-select">
                      <option v-for="n in getDaysInMonth()" :key="n-1" :value="n-1">{{ n-1 }}</option>
                    </select>
                  </div>
                </div>
                
                <div class="picker-row">
                  <div class="picker-column">
                    <label>时</label>
                    <select v-model.number="guessHours" class="age-select">
                      <option v-for="n in 25" :key="n-1" :value="n-1">{{ n-1 }}</option>
                    </select>
                  </div>
                  <div class="picker-column">
                    <label>分</label>
                    <select v-model.number="guessMinutes" class="age-select">
                      <option v-for="n in 61" :key="n-1" :value="n-1">{{ n-1 }}</option>
                    </select>
                  </div>
                  <div class="picker-column">
                    <label>秒</label>
                    <select v-model.number="guessSeconds" class="age-select">
                      <option v-for="n in 61" :key="n-1" :value="n-1">{{ n-1 }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 移动端滑动选择器 -->
              <div class="picker-mobile">
                <!-- 年月日行 -->
                <div class="picker-row-label">年龄</div>
                <div class="scroll-picker-container">
                  <div class="scroll-picker-column"
                       @touchstart="handleTouchStart($event,'years')"
                       @touchmove.prevent="handleTouchMove($event,'years')"
                       @touchend="handleTouchEnd($event,'years')">
                    <div class="scroll-picker-mask"></div>
                    <div class="scroll-picker-indicator"></div>
                    <div class="scroll-picker-content"
                         :class="{ snapping: snapColumns.years }"
                         :style="{ transform:`translateY(${yearsTransform}px)` }">
                      <div v-for="n in 101" :key="n-1" class="scroll-picker-item"
                           :class="{ active: guessYears===n-1 }">{{ n-1 }}</div>
                    </div>
                    <div class="scroll-picker-label">年</div>
                  </div>

                  <div class="scroll-picker-column"
                       @touchstart="handleTouchStart($event,'months')"
                       @touchmove.prevent="handleTouchMove($event,'months')"
                       @touchend="handleTouchEnd($event,'months')">
                    <div class="scroll-picker-mask"></div>
                    <div class="scroll-picker-indicator"></div>
                    <div class="scroll-picker-content"
                         :class="{ snapping: snapColumns.months }"
                         :style="{ transform:`translateY(${monthsTransform}px)` }">
                      <div v-for="n in 13" :key="n-1" class="scroll-picker-item"
                           :class="{ active: guessMonths===n-1 }">{{ n-1 }}</div>
                    </div>
                    <div class="scroll-picker-label">月</div>
                  </div>

                  <div class="scroll-picker-column"
                       @touchstart="handleTouchStart($event,'days')"
                       @touchmove.prevent="handleTouchMove($event,'days')"
                       @touchend="handleTouchEnd($event,'days')">
                    <div class="scroll-picker-mask"></div>
                    <div class="scroll-picker-indicator"></div>
                    <div class="scroll-picker-content"
                         :class="{ snapping: snapColumns.days }"
                         :style="{ transform:`translateY(${daysTransform}px)` }">
                      <div v-for="n in getDaysInMonth()" :key="n-1" class="scroll-picker-item"
                           :class="{ active: guessDays===n-1 }">{{ n-1 }}</div>
                    </div>
                    <div class="scroll-picker-label">日</div>
                  </div>
                </div>

                <!-- 时分秒行 -->
                <div class="picker-row-label">时间</div>
                <div class="scroll-picker-container">
                  <div class="scroll-picker-column"
                       @touchstart="handleTouchStart($event,'hours')"
                       @touchmove.prevent="handleTouchMove($event,'hours')"
                       @touchend="handleTouchEnd($event,'hours')">
                    <div class="scroll-picker-mask"></div>
                    <div class="scroll-picker-indicator"></div>
                    <div class="scroll-picker-content"
                         :class="{ snapping: snapColumns.hours }"
                         :style="{ transform:`translateY(${hoursTransform}px)` }">
                      <div v-for="n in 25" :key="n-1" class="scroll-picker-item"
                           :class="{ active: guessHours===n-1 }">{{ n-1 }}</div>
                    </div>
                    <div class="scroll-picker-label">时</div>
                  </div>

                  <div class="scroll-picker-column"
                       @touchstart="handleTouchStart($event,'minutes')"
                       @touchmove.prevent="handleTouchMove($event,'minutes')"
                       @touchend="handleTouchEnd($event,'minutes')">
                    <div class="scroll-picker-mask"></div>
                    <div class="scroll-picker-indicator"></div>
                    <div class="scroll-picker-content"
                         :class="{ snapping: snapColumns.minutes }"
                         :style="{ transform:`translateY(${minutesTransform}px)` }">
                      <div v-for="n in 61" :key="n-1" class="scroll-picker-item"
                           :class="{ active: guessMinutes===n-1 }">{{ n-1 }}</div>
                    </div>
                    <div class="scroll-picker-label">分</div>
                  </div>

                  <div class="scroll-picker-column"
                       @touchstart="handleTouchStart($event,'seconds')"
                       @touchmove.prevent="handleTouchMove($event,'seconds')"
                       @touchend="handleTouchEnd($event,'seconds')">
                    <div class="scroll-picker-mask"></div>
                    <div class="scroll-picker-indicator"></div>
                    <div class="scroll-picker-content"
                         :class="{ snapping: snapColumns.seconds }"
                         :style="{ transform:`translateY(${secondsTransform}px)` }">
                      <div v-for="n in 61" :key="n-1" class="scroll-picker-item"
                           :class="{ active: guessSeconds===n-1 }">{{ n-1 }}</div>
                    </div>
                    <div class="scroll-picker-label">秒</div>
                  </div>
                </div>
              </div>
            </div>
            
            <button @click="submitGuess" :disabled="remainingAmount <= 0" class="guess-btn">猜测（花费1亿）</button>
            
            <div v-if="guessResult" :key="guessResult + guessCount" class="guess-result" :class="guessResult">
              <p class="result-message">{{ guessMessage }}</p>
            </div>
            
            <div class="control-buttons" v-if="guessResult || remainingAmount <= 0">
              <button @click="resetGame" class="control-btn restart-btn">🔄 再来一次</button>
              <button @click="revealAnswer" class="control-btn reveal-btn" v-if="!isGameOver">🕵️ 查看答案</button>
            </div>
          </div>
        </div>
        
        <div v-else class="game-result">
          <div v-if="isSuccess" class="result-card success">
            <div class="result-icon">🎉</div>
            <h2 class="result-title">恭喜成功！</h2>
            <p class="result-description">您猜对了神秘人的年龄！</p>
            <div class="mystery-age">
              <p class="mystery-label">神秘人年龄为：</p>
              <p class="mystery-value">{{ mysteryAgeDisplay }}</p>
            </div>
            <div class="reward-section">
              <p class="reward-label">获得奖金</p>
              <p class="reward-value">{{ formatMoney(remainingAmount) }}</p>
              <p class="reward-hint">（原始500亿 - 猜测{{ guessCount }}次 × 1亿）</p>
            </div>
            <div class="share-section">
              <button @click="shareResult" class="share-btn">🎉 一键分享结果</button>
              <transition name="fade"><div v-if="showCopySuccess" class="copy-success">✅ 已复制到剪贴板！</div></transition>
            </div>
          </div>
          
          <div v-else class="result-card failure">
            <div class="result-icon">💀</div>
            <h2 class="result-title">游戏结束！</h2>
            <p class="result-description">奖金已耗尽，神秘人带走了所有钱...</p>
            <div class="mystery-age">
              <p class="mystery-label">神秘人真实年龄：</p>
              <p class="mystery-value">{{ mysteryAgeDisplay }}</p>
            </div>
            <div class="fail-info">
              <p>您猜测了 <strong>{{ guessCount }}</strong> 次</p>
              <p>最终正确答案：{{ mysteryAgeDisplay }}</p>
            </div>
          </div>
          
          <button @click="resetGame" class="restart-btn">🔄 再来一次</button>
        </div>
      </div>
      
      <div class="ranking-section">
        <h2 class="ranking-title">🏆 排行榜 - 猜年龄高手</h2>
        <p class="ranking-subtitle">猜对年龄用时最少、获得奖金最多的前10名</p>
        
        <div v-if="rankings.length === 0" class="ranking-empty"><p>暂无排行数据，快来创造第一个记录吧！</p></div>
        
        <div v-else class="ranking-table-wrapper">
          <table class="ranking-table">
            <thead>
              <tr>
                <th class="rank-col">排名</th>
                <th class="name-col">用户名</th>
                <th class="guess-col">猜测次数</th>
                <th class="money-col">获得奖金</th>
                <th class="date-col">记录时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in rankings" :key="record.id" :class="['ranking-row', { 'top-three': index < 3 }]">
                <td class="rank-col"><span :class="['rank-badge', getRankClass(index)]">{{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1 }}</span></td>
                <td class="name-col">{{ record.userName || '匿名用户' }}</td>
                <td class="guess-col">{{ record.guessCount }} 次</td>
                <td class="money-col">{{ formatMoney(record.earnedMoney) }}</td>
                <td class="date-col">{{ formatDate(record.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 打赏按钮 -->
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
            <div class="qr-wrapper">
              <img :src="wxQRCode" alt="微信收款码" class="qr-image clickable" @click="enlargeQRCode">
              <p class="qr-label">微信支付</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 放大收款码模态框 -->
    <div v-if="showEnlargeModal" class="modal-overlay" @click="closeEnlargeModal">
      <div class="modal-content enlarge" @click.stop>
        <button class="modal-close" @click="closeEnlargeModal">✕</button>
        <img :src="wxQRCode" alt="微信收款码" class="qr-image-enlarged">
      </div>
    </div>
  </div>
</template>

<script>
import { getAgeRankings, insertAgeRanking } from '../services/rankingService';

export default {
  name: 'AgeGuessingGame',
  data() {
    return {
      userName: '',
      wxQRCode: require('../assets/wx.jpg'),
      showModal: false,
      showEnlargeModal: false,
      isGameOver: false,
      isSuccess: false,
      guessCount: 0,
      remainingAmount: 50000000000,   // 500亿
      initialAmount: 50000000000,     // 500亿
      guessCost: 100000000,           // 1亿
      mysteryBirthTime: null,
      currentReferenceTime: null,
      guessYears: 0,
      guessMonths: 0,
      guessDays: 0,
      guessHours: 0,
      guessMinutes: 0,
      guessSeconds: 0,
      rankings: [],
      showCopySuccess: false,
      guessResult: null,
      guessMessage: '',
      // 移动端滑动选择器
      ITEM_H: 36,
      yearsTransform: 0,
      monthsTransform: 0,
      daysTransform: 0,
      hoursTransform: 0,
      minutesTransform: 0,
      secondsTransform: 0,
      snapColumns: {},   // 哪些列正在做 snap 动画
      touch: null        // 当前触摸状态
    };
  },
  computed: {
    mysteryAgeDisplay() {
      if (!this.mysteryBirthTime || !this.currentReferenceTime) return '';
      const diff = this.currentReferenceTime - this.mysteryBirthTime;
      const totalSeconds = Math.floor(diff / 1000);
      const years = Math.floor(totalSeconds / (365.25 * 24 * 60 * 60));
      const remaining1 = totalSeconds % Math.floor(365.25 * 24 * 60 * 60);
      const months = Math.floor(remaining1 / (30 * 24 * 60 * 60));
      const remaining2 = remaining1 % Math.floor(30 * 24 * 60 * 60);
      const days = Math.floor(remaining2 / (24 * 60 * 60));
      const remaining3 = remaining2 % (24 * 60 * 60);
      const hours = Math.floor(remaining3 / (60 * 60));
      const remaining4 = remaining3 % (60 * 60);
      const minutes = Math.floor(remaining4 / 60);
      const seconds = remaining4 % 60;
      return `${years}年${months}个月${days}天${hours}小时${minutes}分${seconds}秒`;
    },
    guessedAgeInMs() {
      // 使用更精确的计算
      const yearsMs = this.guessYears * 365.25 * 24 * 60 * 60 * 1000;
      const monthsMs = this.guessMonths * 30 * 24 * 60 * 60 * 1000;
      const daysMs = this.guessDays * 24 * 60 * 60 * 1000;
      const hoursMs = this.guessHours * 60 * 60 * 1000;
      const minutesMs = this.guessMinutes * 60 * 1000;
      const secondsMs = this.guessSeconds * 1000;
      return yearsMs + monthsMs + daysMs + hoursMs + minutesMs + secondsMs;
    }
  },
  mounted() {
    this.initGame();
    this.loadRankings();
  },
  methods: {
    // 获取指定月份的天数（处理闰年）
    getDaysInMonth() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = this.guessMonths;
      
      // 计算实际年份（假设生日是currentYear - guessYears）
      const year = currentYear - this.guessYears;
      const month = currentMonth;
      
      // 处理2月的天数
      if (month === 2) {
        // 判断是否为闰年
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
          return 30; // 闰年2月29天
        }
        return 29; // 非闰年2月28天
      }
      
      // 其他月份：
      // 1,3,5,7,8,10,12 = 31天
      // 4,6,9,11 = 30天
      if (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) {
        return 32;
      }
      return 31;
    },
    initGame() {
      const now = Date.now();
      const maxAgeMs = 100 * 365.25 * 24 * 60 * 60 * 1000;
      const randomAgeMs = Math.random() * maxAgeMs;
      this.mysteryBirthTime = now - randomAgeMs;
      this.currentReferenceTime = now;
      this.isGameOver = false;
      this.isSuccess = false;
      this.guessCount = 0;
      this.remainingAmount = this.initialAmount;
      this.guessYears = 0;
      this.guessMonths = 0;
      this.guessDays = 0;
      this.guessHours = 0;
      this.guessMinutes = 0;
      this.guessSeconds = 0;
      this.guessResult = null;
      this.guessMessage = '';
      // 重置picker：全部归0（value=0 → transform=0）
      this.yearsTransform = 0;
      this.monthsTransform = 0;
      this.daysTransform = 0;
      this.hoursTransform = 0;
      this.minutesTransform = 0;
      this.secondsTransform = 0;
      this.snapColumns = {};
      this.touch = null;
    },
    resetGame() { 
      this.initGame(); 
    },
    revealAnswer() { this.isGameOver = true; this.isSuccess = false; },
    submitGuess() {
      if (this.remainingAmount <= 0) return;
      
      // 强制刷新结果动画
      this.guessResult = null;
      this.guessMessage = '';
      
      this.$nextTick(() => {
        this.guessCount++;
        // 每次猜测无论对错都扣1亿
        this.remainingAmount -= this.guessCost;
        
        const mysteryAgeMs = this.currentReferenceTime - this.mysteryBirthTime;
        const diff = Math.abs(this.guessedAgeInMs - mysteryAgeMs);
        
        // 精确到秒：只接受距离最近的整秒（误差 < 500ms）
        if (diff < 500) {
          this.isSuccess = true;
          this.isGameOver = true;
          this.guessResult = 'correct';
          this.guessMessage = '恭喜你猜对了！';
          this.saveToRanking();
        } else {
          if (this.guessedAgeInMs < mysteryAgeMs) {
            this.guessResult = 'larger';
            this.guessMessage = '年龄太小了！神秘人实际年龄比你猜的更大~';
          } else {
            this.guessResult = 'smaller';
            this.guessMessage = '年龄太大了！神秘人实际年龄比你猜的更小~';
          }
        }
        
        if (this.remainingAmount <= 0 && !this.isSuccess) {
          this.isGameOver = true;
          this.isSuccess = false;
          this.guessResult = 'failed';
          this.guessMessage = '奖金已耗尽，游戏结束！';
        }
      });
    },
    goBack() { this.$emit('go-back'); },
    openModal() { this.showModal = true; document.body.style.overflow = 'hidden'; },
    closeModal() { this.showModal = false; document.body.style.overflow = ''; },
    enlargeQRCode() { this.showEnlargeModal = true; },
    closeEnlargeModal() { this.showEnlargeModal = false; },
    async loadRankings() {
      try {
        const result = await getAgeRankings(10);
        if (result.success) this.rankings = result.data.records || [];
      } catch (error) { console.error('加载排行榜失败:', error); }
    },
    async saveToRanking() {
      if (!this.isSuccess) return;
      const recordData = {
        userName: this.userName.trim() || '匿名用户',
        guessCount: this.guessCount,
        earnedMoney: this.remainingAmount,
        earnedMoneyDisplay: this.formatMoney(this.remainingAmount),
        mysteryAgeDisplay: this.mysteryAgeDisplay
      };
      try {
        const result = await insertAgeRanking(recordData);
        if (result.success) { console.log('✅ 记录已成功保存到排行榜'); await this.loadRankings(); }
        else console.error('❌ 保存失败:', result.message);
      } catch (error) { console.error('❌ 保存记录异常:', error); }
    },
    formatDate(isoString) {
      const date = new Date(isoString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    getRankClass(index) {
      if (index === 0) return 'rank-first';
      if (index === 1) return 'rank-second';
      if (index === 2) return 'rank-third';
      return '';
    },
    formatMoney(amount) {
      if (amount === 0) return '0元';
      const units = [{ name: '元', value: 1 }, { name: '万元', value: 10000 }, { name: '亿元', value: 100000000 }, { name: '万亿元', value: 1000000000000 }];
      for (let i = units.length - 1; i >= 0; i--) {
        if (amount >= units[i].value) {
          const value = amount / units[i].value;
          if (value >= 1000) return `${(value / 1000).toFixed(1)}千${units[i].name}`;
          return `${value.toFixed(1)}${units[i].name}`;
        }
      }
      return `${amount.toFixed(0)}元`;
    },
    async shareResult() {
      const userName = this.userName.trim() || '我';
      const text = `🎮 我在神秘人年龄猜测游戏中猜了${this.guessCount}次，最终获得${this.formatMoney(this.remainingAmount)}奖金！\n\n神秘人年龄：${this.mysteryAgeDisplay}\n\n你也来挑战一下吧！`;
      
      try {
        await navigator.clipboard.writeText(text);
        this.showCopySuccess = true;
        setTimeout(() => { this.showCopySuccess = false; }, 2000);
      } catch (err) {
        console.error('复制失败:', err);
      }
    },
    // ========== 移动端滑动选择器 ==========
    // 正确公式推导：
    //   CSS padding-top = 88px = (5-1)/2 * ITEM_H 已经把 item[0] 居中
    //   所以 transform=0 时 value=0 居中
    //   要让 value=v 居中：transform = -v * ITEM_H
    //   反算：value = round(-transform / ITEM_H)

    _propOf(type) {
      return { years:'guessYears', months:'guessMonths', days:'guessDays',
               hours:'guessHours', minutes:'guessMinutes', seconds:'guessSeconds' }[type];
    },
    _maxOf(type) {
      const m = { years:100, months:12, days:this.getDaysInMonth()-1,
                  hours:24, minutes:60, seconds:60 };
      return m[type];
    },
    // transform → value（带惯性 momentum 修正）
    _transformToIndex(transform, momentum, type) {
      const raw = -(transform + momentum) / this.ITEM_H;
      const max = this._maxOf(type);
      return Math.max(0, Math.min(max, Math.round(raw)));
    },
    // value → transform
    _indexToTransform(value) {
      return -value * this.ITEM_H;
    },

    handleTouchStart(event, type) {
      event.preventDefault();
      const t = event.touches[0];
      this.touch = {
        type,
        startY: t.clientY,
        prevY:  t.clientY,
        prevT:  Date.now(),
        startTransform: this[`${type}Transform`],
        velocityY: 0
      };
      // 拖动期间去掉 snap 过渡
      this.snapColumns[type] = false;
    },
    handleTouchMove(event, type) {
      if (!this.touch || this.touch.type !== type) return;

      const t = event.touches[0];
      const now = Date.now();
      const dt = Math.max(1, now - this.touch.prevT);
      const dy = t.clientY - this.touch.prevY;

      this.touch.velocityY = dy / dt;   // px/ms
      this.touch.prevY = t.clientY;
      this.touch.prevT = now;

      const delta = t.clientY - this.touch.startY;
      let newT = this.touch.startTransform + delta;

      // 边界阻尼
      const minT = this._indexToTransform(this._maxOf(type));
      const maxT = 0;
      if (newT > maxT) newT = maxT + (newT - maxT) * 0.25;
      if (newT < minT) newT = minT + (newT - minT) * 0.25;

      this[`${type}Transform`] = newT;
    },
    handleTouchEnd(event, type) {
      if (!this.touch || this.touch.type !== type) return;

      const vel = this.touch.velocityY;            // px/ms
      const momentum = vel * 120;                   // 惯性距离 px

      const finalIdx = this._transformToIndex(this[`${type}Transform`], momentum, type);
      const prop = this._propOf(type);
      this[prop] = finalIdx;

      // 启用 snap 过渡，再更新 transform
      this.snapColumns[type] = true;
      this[`${type}Transform`] = this._indexToTransform(finalIdx);

      // 动画结束后关闭 snap
      setTimeout(() => { this.snapColumns[type] = false; }, 350);
      this.touch = null;
    }
  }
};
</script>

<style scoped>
.age-guessing-game{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:20px;position:relative}
.back-btn{position:fixed;top:20px;left:20px;padding:12px 24px;background:rgba(255,255,255,0.9);color:#667eea;border:2px solid #667eea;border-radius:25px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 15px rgba(0,0,0,0.1);z-index:100}
.back-btn:hover{background:#667eea;color:white;transform:translateX(-5px)}
.zhihu-link-section{max-width:650px;width:100%;text-align:center;margin:80px 0 20px;padding:15px;background:linear-gradient(135deg,#ff6b6b,#ee5a24);border-radius:12px;box-shadow:0 4px 15px rgba(238,90,36,0.3)}
.zhihu-link{color:white;text-decoration:none;font-size:1.1rem;font-weight:600;line-height:1.5;transition:all 0.3s ease;display:block;text-shadow:1px 1px 2px rgba(0,0,0,0.2)}
.zhihu-link:hover{color:#ffeaa7;text-shadow:2px 2px 4px rgba(0,0,0,0.3);transform:scale(1.02)}
.container{max-width:650px;width:100%;background:rgba(255,255,255,0.95);padding:40px;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.2);backdrop-filter:blur(10px)}
.title{font-size:2.5rem;color:#2c3e50;text-align:center;margin-bottom:10px;font-weight:bold}
.game-intro{text-align:center;color:#7f8c8d;font-size:1.1rem;margin-bottom:30px}
.username-section{margin-bottom:30px;padding:20px;background:linear-gradient(135deg,#f0f4f8,#e3eaf2);border-radius:12px;border:2px solid rgba(102,126,234,0.3)}
.username-label{display:block;font-size:1.1rem;font-weight:600;color:#2c3e50;margin-bottom:10px}
.username-input{width:100%;padding:12px 15px;font-size:1rem;border:2px solid #d1d9e6;border-radius:8px;background:white;color:#2c3e50;transition:all 0.3s ease;box-sizing:border-box}
.username-input:focus{outline:none;border-color:#667eea;box-shadow:0 0 0 3px rgba(102,126,234,0.1)}
.username-input::placeholder{color:#95a5a6}
.username-hint{margin:8px 0 0;font-size:0.85rem;color:#7f8c8d;font-style:italic}
.game-section{margin-bottom:30px}
.game-playing{padding:20px;background:linear-gradient(135deg,#f8f9fa,#e9ecef);border-radius:15px;border:2px solid #dee2e6}
.remaining-amount{text-align:center;margin-bottom:15px;padding:15px;background:linear-gradient(135deg,#fff9c4,#ffe082);border-radius:10px;border:2px solid #ffd54f}
.amount-label{font-size:1.1rem;color:#7f8c8d}
.amount-value{font-size:2rem;font-weight:bold;color:#f39c12}
.guess-count{text-align:center;margin-bottom:20px;font-size:1.1rem;color:#7f8c8d}
.count-value{font-weight:bold;color:#667eea}
.age-input-section{padding:20px;background:white;border-radius:12px;border:2px solid #dee2e6}
.input-hint{text-align:center;font-size:1rem;color:#2c3e50;margin-bottom:20px;font-weight:600}

/* 选择器容器 */
.picker-wrapper{padding:15px 0;position:relative;z-index:1}

/* PC端选择器 - 默认显示 */
.picker-desktop{display:block}
.picker-mobile{display:none}

/* 移动端样式前置声明 */
.picker-mobile .picker-row-label{display:none}
.picker-mobile .scroll-picker-container{display:none}

.picker-row{display:flex;gap:10px;justify-content:center;align-items:stretch;margin-bottom:15px}

.picker-column{flex:1;display:flex;flex-direction:column;align-items:center;min-width:70px}

.picker-column label{font-size:0.85rem;color:#667eea;margin-bottom:8px;font-weight:700;text-align:center;letter-spacing:0.5px}

.age-select{width:100%;height:50px;padding:0 5px;font-size:1.1rem;font-weight:600;border:2px solid #e0e0e0;border-radius:12px;background:linear-gradient(180deg,#ffffff,#f5f7fa);color:#2c3e50;cursor:pointer;transition:all 0.3s ease;text-align:center;text-align-last:center;appearance:none;-webkit-appearance:none;-moz-appearance:none;box-shadow:0 2px 8px rgba(0,0,0,0.08),inset 0 1px 2px rgba(255,255,255,0.8)}

.age-select:focus{outline:none;border-color:#667eea;box-shadow:0 0 0 3px rgba(102,126,234,0.15),0 2px 12px rgba(102,126,234,0.2);background:linear-gradient(180deg,#fff,#f8f9fa)}

/* 移动端滑动选择器样式 */
@media(max-width:768px){
  /* 隐藏PC端选择器，显示移动端选择器 */
  .picker-desktop{display:none!important}
  .picker-mobile{display:block!important}
  .picker-mobile .picker-row-label{display:block!important}
  .picker-mobile .scroll-picker-container{display:flex!important}
  
  .picker-row-label{
    font-size:1.05rem;
    color:#2c3e50;
    font-weight:700;
    margin:25px 0 18px;
    text-align:left;
    padding-left:15px;
    letter-spacing:0.5px;
    position:relative;
  }
  
  .picker-row-label::before{
    content:'';
    position:absolute;
    left:0;
    top:50%;
    transform:translateY(-50%);
    width:4px;
    height:20px;
    background:linear-gradient(135deg,#667eea,#764ba2);
    border-radius:3px;
    box-shadow:0 2px 6px rgba(102,126,234,0.3);
  }
  
  .picker-row-label:first-of-type{
    margin-top:10px;
  }
  
  .scroll-picker-container{
    display:flex;
    gap:6px;
    justify-content:space-around;
    margin-bottom:16px;
    padding:10px 8px;
    background:linear-gradient(135deg,#f8f9fa 0%,#ffffff 50%,#f8f9fa 100%);
    border-radius:14px;
    box-shadow:0 4px 14px rgba(0,0,0,0.07),inset 0 1px 2px rgba(255,255,255,0.9);
    border:1px solid rgba(102,126,234,0.1);
    width:100%;
    box-sizing:border-box;
  }
  
  /* 每列容器
     height = 5 * ITEM_H = 5*36 = 180px
     indicator 居中 36px 高度 */
  .scroll-picker-column{
    flex:1;
    min-width:48px;
    position:relative;
    height:180px;
    overflow:hidden;
    background:#fff;
    border-radius:14px;
    box-shadow:inset 0 2px 8px rgba(0,0,0,0.05);
    -webkit-user-select:none;
    user-select:none;
    /* 禁用浏览器默认滚动，用我们自己的touch处理 */
    touch-action:none;
  }
  
  /* 渐变遮罩 */
  .scroll-picker-mask{
    position:absolute;
    top:0;left:0;right:0;bottom:0;
    pointer-events:none;
    z-index:2;
    background:linear-gradient(
      to bottom,
      rgba(255,255,255,0.95) 0%,
      rgba(255,255,255,0.6)  20%,
      rgba(255,255,255,0)    35%,
      rgba(255,255,255,0)    65%,
      rgba(255,255,255,0.6)  80%,
      rgba(255,255,255,0.95) 100%
    );
  }
  
  /* 选中指示器：height=36px，top:50% margin-top:-18px */
  .scroll-picker-indicator{
    position:absolute;
    top:50%;
    left:4px;right:4px;
    height:36px;
    margin-top:-18px;
    border-top:1.5px solid rgba(102,126,234,0.35);
    border-bottom:1.5px solid rgba(102,126,234,0.35);
    background:rgba(102,126,234,0.06);
    border-radius:8px;
    pointer-events:none;
    z-index:1;
  }
  
  /* 滚动内容
     padding-top = (5-1)/2 * 36 = 72px  ← 让 item[0] 自然居中
     padding-bottom 同样 72px 让最后一项也能居中
     transform=0 → item[0] 居中
     transform=-v*36 → item[v] 居中  ← 这是唯一正确公式 */
  .scroll-picker-content{
    position:relative;
    padding:72px 0;
    will-change:transform;
    /* 默认无过渡（拖动时实时跟手） */
    transition:none;
  }
  
  /* snap 过渡只在松手后生效 */
  .scroll-picker-content.snapping{
    transition:transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  
  /* 每个选项高 36px */
  .scroll-picker-item{
    height:36px;
    line-height:36px;
    text-align:center;
    font-size:1rem;
    color:#aab;
    font-weight:500;
    -webkit-tap-highlight-color:transparent;
    -webkit-user-select:none;
    user-select:none;
  }
  
  /* 选中项 */
  .scroll-picker-item.active{
    color:#2c3e50;
    font-size:1.25rem;
    font-weight:700;
  }
  
  /* 单位标签 */
  .scroll-picker-label{
    position:absolute;
    bottom:6px;left:0;right:0;
    text-align:center;
    font-size:0.85rem;
    color:#667eea;
    font-weight:700;
    pointer-events:none;
    z-index:3;
    letter-spacing:1px;
  }
}

.guess-btn{width:100%;padding:18px 25px;font-size:1.2rem;font-weight:bold;color:white;background:linear-gradient(45deg,#667eea,#764ba2);border:none;border-radius:10px;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 15px rgba(102,126,234,0.3)}
.guess-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 20px rgba(102,126,234,0.4)}
.guess-btn:disabled{background:linear-gradient(45deg,#bdc3c7,#95a5a6);cursor:not-allowed;transform:none;box-shadow:0 2px 8px rgba(189,195,199,0.3)}
.guess-result{margin-top:20px;padding:20px;border-radius:12px;text-align:center;animation:fadeIn 0.5s ease}
.guess-result.correct{background:linear-gradient(135deg,#d4edda,#c3e6cb);border:2px solid #28a745}
.guess-result.larger{background:linear-gradient(135deg,#fff3cd,#ffeeba);border:2px solid #ffc107}
.guess-result.smaller,.guess-result.failed{background:linear-gradient(135deg,#f8d7da,#f5c6cb);border:2px solid #dc3545}
.result-message{font-size:1.2rem;font-weight:600;margin:0}
.guess-result.correct .result-message{color:#28a745}
.guess-result.larger .result-message{color:#856404}
.guess-result.smaller .result-message,.guess-result.failed .result-message{color:#721c24}
.control-buttons{display:flex;gap:15px;margin-top:20px;flex-wrap:wrap}
.control-btn{flex:1;min-width:150px;padding:15px 20px;font-size:1.1rem;font-weight:600;border:none;border-radius:10px;cursor:pointer;transition:all 0.3s ease}
.control-btn.restart-btn{background:linear-gradient(45deg,#4CAF50,#45a049);color:white;box-shadow:0 4px 15px rgba(76,175,80,0.3)}
.control-btn.restart-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(76,175,80,0.4)}
.control-btn.reveal-btn{background:linear-gradient(45deg,#ff9800,#f57c00);color:white;box-shadow:0 4px 15px rgba(255,152,0,0.3)}
.control-btn.reveal-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(255,152,0,0.4)}

.game-result{animation:fadeIn 0.5s ease}
.result-card{padding:40px;border-radius:20px;text-align:center;margin-bottom:20px}
.result-card.success{background:linear-gradient(135deg,#fff9c4,#ffe082);border:3px solid #ffd54f;box-shadow:0 0 30px rgba(255,193,7,0.5)}
.result-card.failure{background:linear-gradient(135deg,#f5f5f5,#e0e0e0);border:3px solid #9e9e9e;box-shadow:0 0 20px rgba(0,0,0,0.1)}
.result-icon{font-size:4rem;margin-bottom:15px}
.result-title{font-size:2rem;color:#2c3e50;margin-bottom:10px}
.result-description{font-size:1.1rem;color:#7f8c8d;margin-bottom:20px}
.mystery-age{padding:20px;background:rgba(255,255,255,0.8);border-radius:12px;margin-bottom:20px}
.mystery-label{font-size:1rem;color:#7f8c8d;margin-bottom:5px}
.mystery-value{font-size:1.5rem;font-weight:bold;color:#e74c3c}
.reward-section{padding:20px;background:rgba(255,255,255,0.9);border-radius:12px;border:2px solid #ffd700}
.reward-label{font-size:1rem;color:#7f8c8d}
.reward-value{font-size:2.5rem;font-weight:bold;color:#f39c12;margin:10px 0}
.reward-hint{font-size:0.9rem;color:#95a5a6}
.share-section{margin-top:20px}
.share-btn{width:100%;padding:15px;font-size:1.1rem;font-weight:600;color:white;background:linear-gradient(45deg,#667eea,#764ba2);border:none;border-radius:10px;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 15px rgba(102,126,234,0.3)}
.share-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(102,126,234,0.4)}
.copy-success{margin-top:10px;padding:10px;background:#d4edda;border-radius:8px;color:#155724;font-size:0.9rem}
.restart-btn{width:100%;padding:18px;font-size:1.2rem;font-weight:bold;color:white;background:linear-gradient(45deg,#667eea,#764ba2);border:none;border-radius:10px;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 15px rgba(102,126,234,0.3)}
.restart-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(102,126,234,0.4)}
.fail-info{padding:15px;background:rgba(255,255,255,0.8);border-radius:10px}
.fail-info p{margin:5px 0;color:#7f8c8d}

.ranking-section{padding:30px;background:rgba(255,255,255,0.95);border-radius:20px;margin-top:20px}
.ranking-title{font-size:1.8rem;color:#2c3e50;text-align:center;margin-bottom:10px}
.ranking-subtitle{text-align:center;color:#7f8c8d;margin-bottom:20px}
.ranking-empty{text-align:center;padding:40px;color:#95a5a6}
.ranking-table-wrapper{overflow-x:auto}
.ranking-table{width:100%;border-collapse:collapse}
.ranking-table thead{background:linear-gradient(135deg,#667eea,#764ba2);color:white}
.ranking-table th{padding:15px 12px;text-align:left;font-weight:600;font-size:0.9rem;letter-spacing:0.5px;color:white!important}
.ranking-table tbody tr{border-bottom:1px solid #f0f0f0;transition:background 0.2s ease}
.ranking-table tbody tr:hover{background:#f8f9fa}
.ranking-table tbody tr.top-three{background:linear-gradient(135deg,rgba(255,215,0,0.05),rgba(255,223,0,0.1))}
.ranking-table td{padding:12px;color:#2c3e50}
.rank-col{width:80px;text-align:center}
.rank-badge{display:inline-flex;align-items:center;justify-content:center;min-width:35px;height:35px;border-radius:50%;font-weight:bold;font-size:1.1rem}
.rank-badge.rank-first{background:linear-gradient(135deg,#ffd700,#ffed4e);color:#d35400;box-shadow:0 2px 8px rgba(255,215,0,0.4)}
.rank-badge.rank-second{background:linear-gradient(135deg,#c0c0c0,#e8e8e8);color:#555;box-shadow:0 2px 8px rgba(192,192,192,0.4)}
.rank-badge.rank-third{background:linear-gradient(135deg,#cd7f32,#daa06d);color:#8B4513;box-shadow:0 2px 8px rgba(205,127,50,0.4)}
.name-col{font-weight:500}
.guess-col{color:#667eea;font-weight:600}
.money-col{color:#f39c12;font-weight:600}
.date-col{color:#7f8c8d;font-size:0.9rem}

/* 移动端适配 */
@media(max-width:768px){
.back-btn{top:15px;left:15px;padding:10px 18px;font-size:0.9rem;z-index:100}
.zhihu-link-section{margin:90px 10px 15px;padding:12px}
.zhihu-link{font-size:0.95rem}
.container{padding:20px 15px;margin:10px}
.title{font-size:1.8rem}
.input-hint{font-size:0.9rem;margin-bottom:15px}
.age-input-section{padding:15px;border-radius:16px;overflow:visible}
.picker-wrapper{overflow:visible}
.result-card{padding:25px}
.result-title{font-size:1.5rem}
.reward-value{font-size:2rem}
.ranking-section{padding:20px 15px}
.ranking-title{font-size:1.5rem}
.floating-support-btn{bottom:20px;right:20px;padding:14px 24px;font-size:1rem;gap:8px}
.author-footer{width:100%;text-align:center;padding:20px;margin-top:50px;font-size:0.85rem}
.guess-btn{font-size:1.1rem;padding:16px 20px;margin-top:20px}
}

.floating-support-btn{position:fixed;bottom:30px;right:30px;padding:18px 30px;background:linear-gradient(135deg,#ff6b6b,#ee5a24);color:white;border-radius:50px;cursor:pointer;display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(255,107,107,0.5);transition:all 0.3s cubic-bezier(0.4,0,0.2,1);z-index:1000;font-weight:700;font-size:1.1rem;animation:breathe 2s ease-in-out infinite,pulse 2s ease-in-out infinite;user-select:none;border:2px solid rgba(255,255,255,0.3)}
.floating-support-btn:hover{transform:translateY(-5px) scale(1.08);box-shadow:0 15px 40px rgba(255,107,107,0.6)}
.floating-support-btn:active{transform:translateY(-2px) scale(1.05)}
.support-icon{font-size:1.5rem;animation:wiggle 1.5s ease-in-out infinite}
.support-text{letter-spacing:0.5px;text-shadow:1px 1px 2px rgba(0,0,0,0.2)}

@keyframes breathe{0%,100%{box-shadow:0 8px 24px rgba(255,107,107,0.5),0 0 0 0 rgba(255,107,107,0.4)}50%{box-shadow:0 12px 35px rgba(255,107,107,0.7),0 0 0 8px rgba(255,107,107,0)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
@keyframes wiggle{0%,100%{transform:rotate(0deg)}15%,45%{transform:rotate(-12deg)}30%,60%{transform:rotate(12deg)}75%{transform:rotate(-8deg)}90%{transform:rotate(8deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

.modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);display:flex;justify-content:center;align-items:center;z-index:9999;animation:fadeIn 0.3s ease;backdrop-filter:blur(8px)}
.modal-content{position:relative;background:white;border-radius:24px;max-width:90%;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:zoomIn 0.3s cubic-bezier(0.34,1.56,0.64,1)}
.modal-content.enlarge{padding:20px;max-width:95%;text-align:center}
.modal-body{padding:40px 35px}
.modal-title{font-size:2rem;font-weight:700;text-align:center;margin-bottom:15px;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.modal-description{text-align:center;color:#7f8c8d;font-size:1.05rem;margin-bottom:12px;line-height:1.6}
.modal-hint{text-align:center;color:#95a5a6;font-size:0.9rem;margin-bottom:25px;font-style:italic}
.qr-codes-modal{display:flex;justify-content:center;gap:35px;flex-wrap:wrap}
.qr-wrapper{text-align:center;transition:transform 0.3s ease}
.qr-wrapper:hover{transform:scale(1.05)}
.qr-image{width:200px;height:200px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.1);cursor:zoom-in}
.qr-image-enlarged{max-width:90vw;max-height:90vh;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.3)}
.qr-label{font-size:1.1rem;font-weight:600;color:#2c3e50;margin-top:10px}
.modal-close{position:absolute;top:15px;right:15px;width:40px;height:40px;background:rgba(255,255,255,0.9);border:none;border-radius:50%;font-size:1.5rem;color:#2c3e50;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.1);transition:all 0.3s ease;z-index:10}
.modal-close:hover{background:#667eea;color:white;transform:rotate(90deg)}

@keyframes zoomIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}

.fade-enter-active,.fade-leave-active{transition:opacity 0.3s}
.fade-enter,.fade-leave-to{opacity:0}
</style>
