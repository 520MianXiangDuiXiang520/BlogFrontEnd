<template>
  <div class="easter-egg-container">
    <div class="content">
      <div class="emoji">😊</div>
      <div class="question">{{ questionText }}</div>
      <div class="buttons" v-if="!accepted">
        <button 
          class="btn yes-btn" 
          :style="{ transform: `scale(${yesScale})` }"
          @click="handleYes"
        >
          可以
        </button>
        <button 
          class="btn no-btn" 
          :style="{ transform: `scale(${noScale})` }"
          @click="handleNo"
        >
          {{ getNoButtonText() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EasterEggView',
  data() {
    return {
      questionText: '你愿意成为我儿子吗？',
      accepted: false,
      yesScale: 1,
      noScale: 1,
      noClickCount: 0,
      noButtonTexts: [
        '不行',
        '真的吗？',
        '你是认真的吗？',
        '再考虑一下？',
        '不要这样嘛',
        '求你了',
        '真的不行吗？',
        '再想想？',
        '拜托了',
        '真的真的不行吗？',
        '最后一次机会',
        '真的确定吗？',
        '不要拒绝我',
        '再给一次机会',
        '真的真的真的不行吗？'
      ]
    }
  },
  methods: {
    handleYes() {
      this.accepted = true;
      this.questionText = '我喜欢你！！！！';
    },
    handleNo() {
      this.noClickCount++;
      // 每次点击"不行"，"可以"按钮变大，"不行"按钮变小
      this.yesScale += 0.3;
      this.noScale = Math.max(0.1, this.noScale - 0.2);
      
      // 如果"可以"按钮已经很大了，让它充满整个屏幕
      if (this.yesScale > 10) {
        this.yesScale = 50;
        this.noScale = 0.01;
      }
    },
    getNoButtonText() {
      // 根据点击次数返回不同的文本，如果超出数组长度就循环使用
      const index = this.noClickCount % this.noButtonTexts.length;
      return this.noButtonTexts[index];
    }
  }
}
</script>

<style scoped>
.easter-egg-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #ff69b4, #ff1493, #ff69b4);
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}

.content {
  text-align: center;
  color: white;
  font-family: 'Arial', sans-serif;
}

.emoji {
  font-size: 8rem;
  margin-bottom: 2rem;
  animation: bounce 2s infinite;
}

.question {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: pulse 1.5s infinite;
}

.buttons {
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: center;
}

.btn {
  padding: 1rem 3rem;
  font-size: 1.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.yes-btn {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
}

.yes-btn:hover {
  background: linear-gradient(45deg, #45a049, #4CAF50);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.no-btn {
  background: linear-gradient(45deg, #f44336, #da190b);
  color: white;
}

.no-btn:hover {
  background: linear-gradient(45deg, #da190b, #f44336);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .emoji {
    font-size: 6rem;
  }
  
  .question {
    font-size: 2rem;
  }
  
  .buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn {
    padding: 0.8rem 2rem;
    font-size: 1.2rem;
  }
}
</style> 