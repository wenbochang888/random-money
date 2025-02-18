<template>
  <div class="random-name-picker">
    <div class="tips">梧桐学校六年级英语教学组：仪佳大美女专属</div>
    <!-- 移除 container-fluid，使用自定义布局 -->
    <div class="content-wrapper">
      <!-- 中间部分 -->
      <div class="center-content">
        <h1 class="chinese-title">{{ currentName || '请开始点名' }}</h1>
        <button @click="toggleRolling" 
                class="chinese-btn">
          {{ buttonText }}
        </button>
      </div>
      
      <!-- 底部名字列表 -->
      <div class="bottom-content">
        <div class="name-grid">
          <div v-for="name in names" 
               :key="name" 
               class="name-item"
               :class="{ 'active': name === currentName }">
            {{ name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      names: [
        '张三', '张三02', '张三03', '张三04', '张三05', '张三06', '张三07', '张三08',
        '张三09', '张三10', '张三11', '张三12', '张三13', '张三14', '张三15', '张三16',
        '张三17', '张三', '张三19', '张三20', '张三21', '张三22', '张三23', '张三24',
        '张三25', '张三26', '张三27', '张三', '张三29', '李花花', '张三31', '张三32',
        '张三33', '张三34', '张三35', '张三36', '张三37', '张三', '张三39', '张三40'
      ],
      rolling: false,
      currentName: '',
      intervalId: null
    };
  },
  computed: {
    buttonText() {
      return this.rolling ? '停止点名' : '开始点名';
    }
  },
  methods: {
    toggleRolling() {
      if (this.rolling) {
        clearInterval(this.intervalId);
        this.rolling = false;
      } else {
        this.rolling = true;
        this.rollNames();
      }
    },
    
    getRandomName() {
      const randomIndex = Math.floor(Math.random() * this.names.length);
      return this.names[randomIndex];
    },
    
    rollNames() {
      this.intervalId = setInterval(() => {
        this.currentName = this.getRandomName();
      }, 100);
    }
  }
};
</script>

<style scoped>
.random-name-picker {
  min-height: 100vh;
  width: 100%;
  overflow-y: auto !important;
  position: relative;
}

.content-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.center-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 30vh;
}

.bottom-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 0.1rem;
}

.chinese-title {
  font-family: 'STKaiti', 'KaiTi', serif;
  color: #4A4A4A;
  font-size: 3.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 4px;
}

.name-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.chinese-btn {
  background: linear-gradient(145deg, #8B4513, #A0522D);
  color: #FFF8DC;
  border: none;
  padding: 18px 60px;
  font-size: 1.8rem;
  font-family: 'STKaiti', 'KaiTi', serif;
  border-radius: 50px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.25);
  margin-top: 0.1rem;
}

.chinese-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.35);
  background: linear-gradient(145deg, #A0522D, #8B4513);
}

.chinese-btn:active {
  transform: translateY(1px);
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.2);
}

.name-item {
  background: #FFF8DC;
  padding: 0.8rem;
  border: 2px solid #8B4513;
  border-radius: 8px;
  text-align: center;
  font-family: 'STKaiti', 'KaiTi', serif;
  font-size: 1.1rem;
  color: #4A4A4A;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(139, 69, 19, 0.1);
}

.name-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(139, 69, 19, 0.2);
  border-color: #D2691E;
  background: #FFEFD5;
}

.name-item.active {
  background: linear-gradient(145deg, #8B4513, #A0522D);
  color: #FFF8DC;
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(139, 69, 19, 0.3);
  border-color: #DAA520;
}

.tips {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'STKaiti', 'KaiTi', serif;
  color: #8B4513;
  font-size: 1.5rem;
  text-shadow: 1px 1px 2px rgba(139, 69, 19, 0.2);
  z-index: 10;
}
</style>
