<script setup>
import { ref, watch, onMounted } from 'vue'
import { copyToClipboard } from '@/utils/clipboard'
import { CopyDocument, ArrowRight, ArrowLeft, Document } from '@element-plus/icons-vue'

// Base64编解码相关
const inputText = ref('') // 输入文本
const outputText = ref('') // 输出文本
const isEncoding = ref(true) // true为编码，false为解码
const leftWidth = ref(50) // 左侧文本框宽度百分比
const textareaHeight = ref(6) // 文本框行数

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

// 拖拽调整大小
let isDragging = false
let startX = 0
let startWidth = 0

// 高度拖拽调整
let isHeightDragging = false
let startY = 0
let startHeight = 0

function startDrag(event) {
  isDragging = true
  startX = event.clientX
  startWidth = leftWidth.value
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function startHeightDrag(event) {
  isHeightDragging = true
  startY = event.clientY
  startHeight = textareaHeight.value
  document.addEventListener('mousemove', onHeightDrag)
  document.addEventListener('mouseup', stopHeightDrag)
  document.body.style.cursor = 'row-resize'
  document.body.style.userSelect = 'none'
}

function onDrag(event) {
  if (!isDragging) return
  
  const container = document.querySelector('.resizable-container')
  if (!container) return
  
  const containerRect = container.getBoundingClientRect()
  const deltaX = event.clientX - startX
  const containerWidth = containerRect.width
  const newWidth = ((startWidth / 100) * containerWidth + deltaX) / containerWidth * 100
  
  // 限制最小和最大宽度
  leftWidth.value = Math.max(20, Math.min(80, newWidth))
}

function onHeightDrag(event) {
  if (!isHeightDragging) return
  
  const deltaY = event.clientY - startY
  const lineHeight = 20 // 估算每行的高度
  const deltaRows = Math.round(deltaY / lineHeight)
  const newHeight = startHeight + deltaRows
  
  // 限制最小和最大高度
  textareaHeight.value = Math.max(3, Math.min(20, newHeight))
}

function stopDrag() {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

function stopHeightDrag() {
  isHeightDragging = false
  document.removeEventListener('mousemove', onHeightDrag)
  document.removeEventListener('mouseup', stopHeightDrag)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
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

      <el-row class="space-16 tool-row">
        <div class="resizable-container">
          <div class="text-area-wrapper input-textarea" :style="{ width: leftWidth + '%' }">
            <el-input v-model="inputText" type="textarea" :rows="textareaHeight" size="large" 
              :placeholder="isEncoding ? '请输入要编码的文本' : '请输入要解码的Base64字符串'"
              @input="processText">
            </el-input>
          </div>
          
          <div class="resize-handle" @mousedown="startDrag">
            <div class="resize-line"></div>
          </div>
          
          <div class="text-area-wrapper output-textarea" :style="{ width: (100 - leftWidth) + '%' }">
            <el-input v-model="outputText" type="textarea" :rows="textareaHeight" size="large" 
              :placeholder="isEncoding ? '编码结果' : '解码结果'"
              class="clickable-output" @click="copyToClipboard(outputText)">
              <template #append>
                <el-button :icon="CopyDocument" @click="copyToClipboard(outputText)"/>
              </template>
            </el-input>
          </div>
        </div>
        
        <div class="height-resize-handle" @mousedown="startHeightDrag">
          <div class="height-resize-line"></div>
          <span class="height-indicator">{{ textareaHeight }} 行</span>
        </div>
      </el-row>
    </el-card>

    <el-card class="use-bgc space-16">
      <h3 class="card-title">
        <el-icon class="title-icon"><Document /></el-icon>
        Base64编解码原理
      </h3>

      <el-row>
        <el-col :span="12">
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
        <el-col :span="12">
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
            <div class="table-row">
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

<style>
.tool-base64-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 24px;
  color: #303133;
  font-size: 2em;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 1.2em;
  color: #409eff;
}

.card-title {
  margin-bottom: 16px;
  color: #303133;
  font-size: 1.3em;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title .title-icon {
  font-size: 1.1em;
  color: #67c23a;
}

.card-title .title-icon.arrow-right {
  color: #409eff;
}

.card-title .title-icon.arrow-left {
  color: #e6a23c;
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

.resize-handle {
  width: 8px;
  background-color: #f0f0f0;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.resize-handle:hover {
  background-color: #e0e0e0;
}

.resize-line {
  width: 2px;
  height: 30px;
  background-color: #c0c0c0;
  border-radius: 1px;
}

.resize-handle:hover .resize-line {
  background-color: #409eff;
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
  background-color: #fafafa;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.clickable-output {
  cursor: pointer;
  transition: all 0.2s;
}

.clickable-output:hover {
  background-color: #f5f7fa;
}

.clickable-output:active {
  background-color: #e4e7ed;
}

.usage-list {
  margin: 8px 0;
  padding-left: 20px;
  color: #606266;
  line-height: 1.6;
}

.usage-list li {
  margin-bottom: 4px;
}

.principle-diagram {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.step {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
}

.step-title {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
  margin-bottom: 6px;
}

.step-content {
  font-family: 'Courier New', monospace;
  background: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  word-break: break-all;
  color: #303133;
}

.arrow {
  text-align: center;
  font-size: 18px;
  color: #409eff;
  font-weight: bold;
  margin: 8px 0;
}

.base64-table {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  flex: 1;
  padding: 8px 12px;
  text-align: center;
  font-size: 14px;
  border-right: 1px solid #f0f0f0;
  background: #fafafa;
}

.table-row:first-child .table-cell {
  background: #409eff;
  color: white;
  font-weight: 600;
}

.table-cell:last-child {
  border-right: none;
}

.tech-features {
  margin: 8px 0;
  padding-left: 20px;
  color: #606266;
  line-height: 1.8;
}

.tech-features li {
  margin-bottom: 8px;
}

.tech-features strong {
  color: #303133;
}

h4 {
  color: #303133;
  margin-bottom: 8px;
  font-size: 1.1em;
  font-weight: 600;
}

/* 输入框样式优化 */
.el-input {
  border-radius: 8px;
}

.el-textarea {
  border-radius: 8px;
}

/* 确保textarea可以resize */
.el-textarea textarea {
  resize: vertical;
  min-height: 60px;
  max-height: 400px;
}

/* 拖拽时的样式 */
.el-textarea textarea:active {
  cursor: row-resize;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-base64-container {
    padding: 10px;
  }
  
  .page-title {
    font-size: 1.8em;
    margin-bottom: 20px;
  }
  
  .card-title {
    font-size: 1.2em;
  }
  
  .action-btn {
    min-width: 100px;
    height: 36px;
    font-size: 12px;
  }
  
  .resize-handle {
    width: 6px;
  }
  
  .resize-line {
    height: 20px;
  }
  
  .height-resize-handle {
    height: 16px;
  }
  
  .height-resize-line {
    width: 30px;
  }
  
  .height-indicator {
    font-size: 11px;
  }
  
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
  
  .table-cell {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .tech-features {
    font-size: 14px;
  }
}

.resize-handle:hover .resize-line {
  background-color: #409eff;
}

.height-resize-handle {
  height: 20px;
  background-color: #f0f0f0;
  cursor: row-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 8px;
  border-radius: 4px;
}

.height-resize-handle:hover {
  background-color: #e0e0e0;
}

.height-resize-line {
  width: 40px;
  height: 2px;
  background-color: #c0c0c0;
  border-radius: 1px;
  margin-right: 8px;
}

.height-resize-handle:hover .height-resize-line {
  background-color: #409eff;
}

.height-indicator {
  font-size: 12px;
  color: #606266;
  user-select: none;
}
</style> 