<script setup>
import { ref, watch, onMounted } from 'vue'
import { copyToClipboard } from '@/utils/clipboard'
import { CopyDocument, ArrowRight, ArrowLeft, Document } from '@element-plus/icons-vue'

// Base64编解码相关
const inputText = ref('') // 输入文本
const outputText = ref('') // 输出文本
const isEncoding = ref(true) // true为编码，false为解码
const textareaHeight = ref(6) // 文本框行数
const isMobile = ref(false) // 移动端检测

// Base64编码函数
function encodeBase64(text) {
  try {
    // 处理中文和特殊字符
    const encoder = new TextEncoder()
    const bytes = encoder.encode(text)
    return btoa(String.fromCharCode(...bytes))
  } catch (error) {
    return '编码失败'
  }
}

// Base64解码函数
function decodeBase64(text) {
  try {
    // 处理中文和特殊字符
    const binaryString = atob(text)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const decoder = new TextDecoder()
    return decoder.decode(bytes)
  } catch (error) {
    return '解码失败'
  }
}

// 执行编解码
function processText() {
  const input = inputText.value.trim()
  if (!input) {
    outputText.value = ''
    return
  }

  if (isEncoding.value) {
    outputText.value = encodeBase64(input)
  } else {
    outputText.value = decodeBase64(input)
  }
}

// 监听输入变化
watch([inputText, isEncoding], () => {
  processText()
})

// 监听文本框高度变化并同步
function syncTextareaHeight() {
  const inputTextarea = document.querySelector('.input-textarea textarea')
  const outputTextarea = document.querySelector('.output-textarea textarea')
  
  if (inputTextarea && outputTextarea) {
    // 获取左侧文本框的实际高度
    const inputHeight = inputTextarea.style.height || inputTextarea.offsetHeight
    const inputRows = Math.round(inputHeight / 20) // 估算行数
    
    // 同步到右侧文本框
    outputTextarea.style.height = inputHeight
    textareaHeight.value = Math.max(3, Math.min(20, inputRows))
  }
}

// 组件挂载后添加事件监听
onMounted(() => {
  // 检测移动端
  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
  }
  
  // 初始检测
  checkMobile()
  
  // 监听窗口大小变化
  window.addEventListener('resize', checkMobile)
  
  // 延迟执行，确保DOM已渲染
  setTimeout(() => {
    const inputTextarea = document.querySelector('.input-textarea textarea')
    const outputTextarea = document.querySelector('.output-textarea textarea')
    
    // 为两个文本框都添加resize监听
    function addResizeListener(textarea, isInput = true) {
      if (!textarea) return
      
      let isResizing = false
      let startHeight = 0
      let startY = 0
      
      textarea.addEventListener('mousedown', (e) => {
        // 检查是否点击在右下角调整区域
        const rect = textarea.getBoundingClientRect()
        const isBottomRight = e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20
        
        if (isBottomRight) {
          isResizing = true
          startHeight = textarea.offsetHeight
          startY = e.clientY
          
          const onMouseMove = (e) => {
            if (isResizing) {
              const deltaY = e.clientY - startY
              const newHeight = startHeight + deltaY
              const newRows = Math.round(newHeight / 20)
              
              if (newRows >= 3 && newRows <= 20) {
                // 更新当前文本框
                textarea.style.height = newHeight + 'px'
                textareaHeight.value = newRows
                
                // 同步另一个文本框
                const otherTextarea = isInput ? outputTextarea : inputTextarea
                if (otherTextarea) {
                  otherTextarea.style.height = newHeight + 'px'
                }
              }
            }
          }
          
          const onMouseUp = () => {
            isResizing = false
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
          }
          
          document.addEventListener('mousemove', onMouseMove)
          document.addEventListener('mouseup', onMouseUp)
        }
      })
    }
    
    // 为两个文本框添加监听
    addResizeListener(inputTextarea, true)
    addResizeListener(outputTextarea, false)
  }, 100)
})
</script>

<template>
  <div class="tool-base64-container">
    <h1 class="page-title">
      <el-icon class="title-icon"><Document /></el-icon>
      Base64编解码工具
    </h1>

    <el-card class="use-bgc space-16">
      <h3 class="card-title">
        <el-icon class="title-icon arrow-right"><ArrowRight /></el-icon>
        Base64编解码
      </h3>

      <el-row class="space-16 tool-row">
        <el-col :span="24">
          <div class="button-row">
            <el-button type="primary" size="large" class="action-btn" @click="isEncoding = true; processText()">
              <el-icon><ArrowRight /></el-icon>
              编码
            </el-button>
            
            <el-button type="success" size="large" class="action-btn" @click="isEncoding = false; processText()">
              <el-icon><ArrowLeft /></el-icon>
              解码
            </el-button>
          </div>
        </el-col>
      </el-row>

      <el-row class="space-16 tool-row" :gutter="16">
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <div class="text-area-wrapper input-textarea">
            <el-input v-model="inputText" type="textarea" :rows="textareaHeight" size="large" 
              :placeholder="isEncoding ? '请输入要编码的文本' : '请输入要解码的Base64字符串'"
              @input="processText">
            </el-input>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <div class="text-area-wrapper output-textarea">
            <el-input v-model="outputText" type="textarea" :rows="textareaHeight" size="large" 
              :placeholder="isEncoding ? '编码结果' : '解码结果'"
              class="clickable-output" @click="copyToClipboard(outputText)">
              <template #append>
                <el-button :icon="CopyDocument" @click="copyToClipboard(outputText)"/>
              </template>
            </el-input>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="use-bgc space-16">
      <h3 class="card-title">
        <el-icon class="title-icon"><Document /></el-icon>
        Base64编解码原理
      </h3>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <h4>编码过程</h4>
          <div class="principle-diagram">
            <div class="step">
              <div class="step-title">1. 原始数据</div>
              <div class="step-content">Hello World</div>
            </div>
            <div class="arrow">↓</div>
            <div class="step">
              <div class="step-title">2. 转换为字节</div>
              <div class="step-content">72 101 108 108 111 32 87 111 114 108 100</div>
            </div>
            <div class="arrow">↓</div>
            <div class="step">
              <div class="step-title">3. 按6位分组</div>
              <div class="step-content">010010 010110 0101 101100 101100 101111 100000 010101 110111 011011 110110 110100</div>
            </div>
            <div class="arrow">↓</div>
            <div class="step">
              <div class="step-title">4. 查表转换</div>
              <div class="step-content">SGVsbG8gV29ybGQ=</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <h4>解码过程</h4>
          <div class="principle-diagram">
            <div class="step">
              <div class="step-title">1. Base64字符串</div>
              <div class="step-content">SGVsbG8gV29ybGQ=</div>
            </div>
            <div class="arrow">↓</div>
            <div class="step">
              <div class="step-title">2. 查表转换</div>
              <div class="step-content">010010 010110 0101 101100 101100 101111 100000 010101 110111 011011 110110 110100</div>
            </div>
            <div class="arrow">↓</div>
            <div class="step">
              <div class="step-title">3. 按8位分组</div>
              <div class="step-content">72 101 108 108 111 32 87 111 114 108 100</div>
            </div>
            <div class="arrow">↓</div>
            <div class="step">
              <div class="step-title">4. 转换为字符</div>
              <div class="step-content">Hello World</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row class="space-12">
        <el-col :span="24">
          <h4>Base64字符表</h4>
          <div class="base64-table">
            <div class="table-row table-header">
              <div class="table-cell">索引</div>
              <div class="table-cell">字符</div>
              <div class="table-cell">索引</div>
              <div class="table-cell">字符</div>
              <div class="table-cell">索引</div>
              <div class="table-cell">字符</div>
              <div class="table-cell">索引</div>
              <div class="table-cell">字符</div>
            </div>
            <div class="table-row" v-for="i in 16" :key="i">
              <div class="table-cell">{{ i-1 }}</div>
              <div class="table-cell">{{ String.fromCharCode(65 + i - 1) }}</div>
              <div class="table-cell">{{ i+15 }}</div>
              <div class="table-cell">{{ String.fromCharCode(65 + i + 15) }}</div>
              <div class="table-cell">{{ i+31 }}</div>
              <div class="table-cell">{{ String.fromCharCode(97 + i - 1) }}</div>
              <div class="table-cell">{{ i+47 }}</div>
              <div class="table-cell">{{ String.fromCharCode(97 + i + 15) }}</div>
            </div>
            <div class="table-row">
              <div class="table-cell">62</div>
              <div class="table-cell">+</div>
              <div class="table-cell">63</div>
              <div class="table-cell">/</div>
              <div class="table-cell">64</div>
              <div class="table-cell">=</div>
              <div class="table-cell">-</div>
              <div class="table-cell">-</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row class="space-12">
        <el-col :span="24">
          <h4>技术特点</h4>
          <ul class="tech-features">
            <li><strong>编码效率</strong>：每3个字节编码为4个Base64字符，增加约33%的数据量</li>
            <li><strong>字符集</strong>：使用A-Z、a-z、0-9、+、/共64个字符，确保兼容性</li>
            <li><strong>填充字符</strong>：使用=作为填充字符，确保长度是4的倍数</li>
            <li><strong>应用场景</strong>：邮件传输、HTTP传输、数据存储、图片编码等</li>
          </ul>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped>
.tool-base64-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 24px;
  color: var(--titleColor);
  font-size: 2.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 2rem;
  color: var(--titleColor);
}

.card-title {
  margin-bottom: 16px;
  color: var(--bTextColor);
  font-size: 1.3em;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title .title-icon {
  font-size: 1.1em;
  color: var(--titleColor);
}

.card-title .title-icon.arrow-right {
  color: var(--titleColor);
}

.card-title .title-icon.arrow-left {
  color: var(--titleColor);
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.action-btn {
  min-width: 120px;
  height: 40px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.resizable-container {
  display: flex;
  align-items: stretch;
  width: 100%;
  position: relative;
}

.text-area-wrapper {
  flex-shrink: 0;
  transition: width 0.1s ease;
}

/* 桌面端拖拽控制区域 */
.desktop-resize-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.resize-handle {
  width: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  height: 40px;
  border-radius: 4px;
}

.resize-handle:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.resize-line {
  width: 2px;
  height: 30px;
  background-color: var(--titleColor);
  border-radius: 1px;
}

.resize-handle:hover .resize-line {
  background-color: var(--titleColor);
}

.height-resize-handle {
  height: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: row-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 8px;
  border-radius: 4px;
  padding: 0 12px;
}

.height-resize-handle:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.height-resize-line {
  width: 40px;
  height: 2px;
  background-color: var(--titleColor);
  border-radius: 1px;
  margin-right: 8px;
}

.height-resize-handle:hover .height-resize-line {
  background-color: var(--titleColor);
}

.height-indicator {
  font-size: 12px;
  color: var(--bTextColor);
  opacity: 0.7;
  user-select: none;
}

.tool-row {
  margin-bottom: 16px;
  align-items: center;
}

.space-12 {
  margin-bottom: 12px;
}

.space-16 {
  margin-bottom: 16px;
}

.use-bgc {
  background-color: var(--bPageBgColor);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.clickable-output {
  cursor: pointer;
  transition: all 0.2s;
}

.clickable-output:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.clickable-output:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.usage-list {
  margin: 8px 0;
  padding-left: 20px;
  color: var(--bTextColor);
  opacity: 0.8;
  line-height: 1.6;
}

.usage-list li {
  margin-bottom: 4px;
}

.principle-diagram {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.step {
  background: var(--bPageBgColor);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
}

.step-title {
  font-weight: 600;
  color: var(--titleColor);
  font-size: 14px;
  margin-bottom: 6px;
}

.step-content {
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  word-break: break-all;
  color: var(--bTextColor);
}

.arrow {
  text-align: center;
  font-size: 18px;
  color: var(--titleColor);
  font-weight: bold;
  margin: 8px 0;
}

.base64-table {
  background: var(--bPageBgColor);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.table-row {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  flex: 1;
  padding: 12px;
  text-align: center;
  color: var(--bTextColor);
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.table-header {
  background: rgba(255, 255, 255, 0.05);
  font-weight: 600;
  color: var(--titleColor);
}

.tech-features {
  margin: 8px 0;
  padding-left: 20px;
  color: var(--bTextColor);
  opacity: 0.8;
  line-height: 1.8;
}

.tech-features li {
  margin-bottom: 8px;
}

.tech-features strong {
  color: var(--bTextColor);
}

h4 {
  color: var(--bTextColor);
  margin-bottom: 8px;
  font-size: 1.1em;
  font-weight: 600;
}

/* 深色模式适配 */
html.dark .use-bgc {
  background-color: var(--bPageBgColor);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark .resize-handle {
  background-color: rgba(255, 255, 255, 0.1);
}

html.dark .resize-handle:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

html.dark .principle-diagram {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark .step {
  background: var(--bPageBgColor);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark .step-content {
  background: rgba(255, 255, 255, 0.05);
}

html.dark .base64-table {
  background: var(--bPageBgColor);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark .table-row {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

html.dark .table-header {
  background: rgba(255, 255, 255, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-base64-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 1.8rem;
    margin-bottom: 20px;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 1.4rem;
  }
  
  .card-title {
    font-size: 1.1em;
    margin-bottom: 12px;
  }
  
  .use-bgc {
    margin-bottom: 16px;
    padding: 16px;
  }
  
  .space-12 {
    margin-bottom: 8px;
  }
  
  .space-16 {
    margin-bottom: 12px;
  }
  
  /* 移动端按钮调整 */
  .button-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    min-width: 100%;
    height: 44px;
    font-size: 16px;
  }
  
  /* 移动端输入框调整 */
  .text-area-wrapper {
    width: 100% !important;
    margin-bottom: 12px;
  }
  
  /* 移动端输入框样式 */
  .el-textarea textarea {
    font-size: 14px;
    min-height: 80px;
  }
  
  /* 隐藏桌面端拖拽控制 */
  .desktop-resize-controls {
    display: none;
  }
  
  /* 移动端表格调整 */
  .base64-table {
    font-size: 12px;
  }
  
  .table-cell {
    padding: 8px 4px;
    font-size: 12px;
  }
  
  /* 移动端步骤图调整 */
  .principle-diagram {
    padding: 12px;
  }
  
  .step {
    padding: 8px;
  }
  
  .step-content {
    font-size: 11px;
    padding: 6px;
  }
  
  .arrow {
    font-size: 16px;
    margin: 6px 0;
  }
}

@media (max-width: 480px) {
  .tool-base64-container {
    padding: 12px;
  }
  
  .page-title {
    font-size: 1.6rem;
    flex-direction: column;
    gap: 6px;
  }
  
  .title-icon {
    font-size: 1.2rem;
  }
  
  .card-title {
    font-size: 1em;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .use-bgc {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .space-12 {
    margin-bottom: 6px;
  }
  
  .space-16 {
    margin-bottom: 8px;
  }
  
  /* 超小屏幕下的特殊处理 */
  .action-btn {
    height: 40px;
    font-size: 14px;
  }
  
  /* 超小屏幕表格调整 */
  .base64-table {
    font-size: 10px;
  }
  
  .table-cell {
    padding: 6px 2px;
    font-size: 10px;
  }
  
  /* 超小屏幕步骤图调整 */
  .principle-diagram {
    padding: 8px;
  }
  
  .step {
    padding: 6px;
  }
  
  .step-content {
    font-size: 10px;
    padding: 4px;
  }
  
  .arrow {
    font-size: 14px;
    margin: 4px 0;
  }
  
  /* 超小屏幕输入框调整 */
  .el-textarea textarea {
    font-size: 13px;
    min-height: 60px;
  }
  
  /* 隐藏拖拽手柄在超小屏幕上 */
  .resize-handle {
    display: none;
  }
  
  .text-area-wrapper {
    margin-bottom: 12px;
  }
}
</style> 