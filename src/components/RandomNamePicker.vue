<template>
  <div class="random-name-picker">
    <div class="tips">梧桐学校六年级英语教学组：仪佳大美女专属</div>
    <!-- 移除 container-fluid，使用自定义布局 -->
    <div class="content-wrapper">
      <!-- 中间部分 -->
      <div class="center-content">
        <h1 class="chinese-title">{{ currentName || '请开始点名' }}</h1>
        <div class="button-group">
          <button @click="toggleRolling" 
                  class="chinese-btn">
            {{ buttonText }}
          </button>
          <button @click="showImportDialog = true" class="import-btn">
            导入名单
          </button>
        </div>
      </div>
      
      <!-- 底部名字列表 -->
      <div class="bottom-content">
        <div class="name-grid">
          <div v-for="(name, index) in names" 
               :key="index" 
               class="name-item"
               :class="{ 'active': name === currentName }">
            <div class="name-content">{{ name }}</div>
            <div class="name-actions">
              <button class="edit-btn" @click="editName(index)">✎</button>
              <button class="delete-btn" @click="deleteName(index)">×</button>
            </div>
          </div>
          <div class="name-item add-item" @click="addNewName">
            <div class="add-content">+</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="showEditDialog" class="edit-dialog">
      <div class="edit-content">
        <input type="text" 
               v-model="editingName" 
               @keyup.enter="saveName"
               ref="editInput">
        <div class="edit-buttons">
          <button @click="saveName" class="save-btn">保存</button>
          <button @click="cancelEdit" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

    <!-- 导入弹窗 -->
    <div v-if="showImportDialog" class="edit-dialog">
      <div class="edit-content">
        <textarea 
          v-model="importNames"
          placeholder="请输入姓名，每行一个名字，例如：&#10;曾美女&#10;仪佳美女&#10;曾仪佳美女"
          rows="10"
          class="import-textarea"
        ></textarea>
        <div class="edit-buttons">
          <button @click="importNameList" class="save-btn">导入</button>
          <button @click="showImportDialog = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 从 localStorage 读取数据，如果没有则使用默认值
      names: JSON.parse(localStorage.getItem('studentNames')) || [
        '苏然', '楚悦', '林宇轩', '叶诗涵', '简阳', '安晴', '陈梓豪', '沈语嫣',
        '赵启铭', '夏婉清', '杨逸晨', '陆芷萱', '吴俊辉', '唐雨薇', '周睿渊', '许梦琪',
        '郑浩然', '孟紫菱', '王梓骞', '宋雅琴', '李哲瀚', '范思瑶', '张致远', '石依琳',
        '刘俊驰', '姚静香', '黄雨泽', '谭曼柔', '徐烨伟', '汪雪慧', '胡明辉', '田雅芙',
        '支持', '直接', '导入', '班级', '名单',
        ],
      rolling: false,
      currentName: '',
      intervalId: null,
      showEditDialog: false,
      editingName: '',
      editingIndex: -1,
      showImportDialog: false,
      importNames: '',
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
      let lastIndex = -1;
      this.intervalId = setInterval(() => {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * this.names.length);
        } while (randomIndex === lastIndex);
        
        lastIndex = randomIndex;
        this.currentName = this.names[randomIndex];
      }, 100);
    },

    editName(index) {
      if (!this.rolling) {
        this.editingIndex = index;
        this.editingName = this.names[index];
        this.showEditDialog = true;
        this.$nextTick(() => {
          this.$refs.editInput.focus();
        });
      }
    },

    saveName() {
      if (this.editingName.trim()) {
        if (this.editingIndex === -1) {
          // 添加新名字
          this.names.push(this.editingName.trim());
        } else {
          // 编辑现有名字
          this.names[this.editingIndex] = this.editingName.trim();
        }
      }
      this.showEditDialog = false;
    },

    cancelEdit() {
      this.showEditDialog = false;
    },

    deleteName(index) {
      if (!this.rolling && this.names.length > 1) {
        this.names = this.names.filter((_, i) => i !== index);
      }
    },

    addNewName() {
      if (!this.rolling) {
        this.editingIndex = -1;
        this.editingName = '';
        this.showEditDialog = true;
        this.$nextTick(() => {
          this.$refs.editInput.focus();
        });
      }
    },

    importNameList() {
      if (this.importNames.trim()) {
        // 将文本分割成数组，过滤空行
        const nameList = this.importNames
          .split('\n')
          .map(name => name.trim())
          .filter(name => name);
        
        if (nameList.length > 0) {
          // 更新名单并保存到 localStorage
          this.names = nameList;
          localStorage.setItem('studentNames', JSON.stringify(nameList));
        }
      }
      this.showImportDialog = false;
      this.importNames = '';
    }
  },
  // 添加 watch 来监听 names 数组的变化
  watch: {
    names: {
      handler(newNames) {
        // 将新的名单保存到 localStorage
        localStorage.setItem('studentNames', JSON.stringify(newNames));
      },
      deep: true
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

.chinese-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.chinese-btn:hover::after {
  transform: translateX(100%);
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
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(139, 69, 19, 0.2);
}

.name-content {
  position: relative;
  z-index: 1;
}

.name-actions {
  position: absolute;
  top: 2px;
  right: 2px;
  display: none;
  gap: 0.2rem;
  padding: 0.2rem;
  z-index: 2;
  background: rgba(255, 248, 220, 0.9);
  border-radius: 4px;
}

.name-item:hover .name-actions {
  display: flex;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  color: #8B4513;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.2rem;
  line-height: 1;
  opacity: 0.7;
}

.edit-btn:hover, .delete-btn:hover {
  opacity: 1;
}

.edit-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edit-content {
  background: #FFF8DC;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-content input {
  padding: 0.5rem;
  font-size: 1.1rem;
  border: 1px solid #8B4513;
  border-radius: 4px;
  width: 200px;
}

.edit-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.save-btn, .cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.save-btn {
  background: #8B4513;
  color: #FFF8DC;
}

.cancel-btn {
  background: #D3D3D3;
  color: #4A4A4A;
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

.add-item {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(139, 69, 19, 0.1);
  border: 2px dashed #8B4513;
  font-size: 1.5rem;
  color: #8B4513;
  opacity: 0.7;
}

.add-item:hover {
  background: rgba(139, 69, 19, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(139, 69, 19, 0.2);
}

.add-content {
  font-size: 1.5rem;
  line-height: 1;
}

.add-item:hover .add-content {
  opacity: 1;
}

.name-item.active {
  background: #8B4513;
  color: #FFF8DC;
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
  animation: highlight 0.3s ease-in-out;
}

@keyframes highlight {
  0% {
    transform: scale(1);
    background: #FFF8DC;
    color: #4A4A4A;
  }
  50% {
    transform: scale(1.1);
    background: #8B4513;
    color: #FFF8DC;
  }
  100% {
    transform: scale(1.05);
    background: #8B4513;
    color: #FFF8DC;
  }
}

.button-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.import-btn {
  background: linear-gradient(145deg, #4A4A4A, #696969);
  color: #FFF8DC;
  border: none;
  padding: 18px 40px;
  font-size: 1.8rem;
  font-family: 'STKaiti', 'KaiTi', serif;
  border-radius: 50px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 6px 20px rgba(74, 74, 74, 0.25);
}

.import-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(74, 74, 74, 0.35);
  background: linear-gradient(145deg, #696969, #4A4A4A);
}

.import-textarea {
  width: 300px;
  padding: 0.5rem;
  font-size: 1.1rem;
  border: 1px solid #8B4513;
  border-radius: 4px;
  resize: vertical;
  font-family: 'STKaiti', 'KaiTi', serif;
}
</style>
