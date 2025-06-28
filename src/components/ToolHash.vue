<script setup>
import { ref, watch } from 'vue'
import { copyToClipboard } from '@/utils/clipboard'
import { CopyDocument, ArrowRight, ArrowLeft, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import CryptoJS from 'crypto-js'

// 哈希相关
const inputText = ref('') // 输入文本
const outputHash = ref('') // 输出哈希值
const selectedAlgorithm = ref('SHA-256') // 选择的哈希算法
const isUpperCase = ref(true) // 是否大写

// 支持的哈希算法
const hashAlgorithms = [
  { label: 'MD5', value: 'MD5', description: '128位哈希，常用于文件完整性校验', type: 'crypto-js' },
  { label: 'SHA-1', value: 'SHA-1', description: '160位哈希，已不推荐用于安全场景', type: 'web-crypto' },
  { label: 'SHA-256', value: 'SHA-256', description: '256位哈希，比特币等加密货币使用', type: 'web-crypto' },
  { label: 'SHA-384', value: 'SHA-384', description: '384位哈希，SHA-2系列', type: 'web-crypto' },
  { label: 'SHA-512', value: 'SHA-512', description: '512位哈希，SHA-2系列，最高安全性', type: 'web-crypto' },
  { label: 'SHA-224', value: 'SHA-224', description: '224位哈希，SHA-2系列', type: 'web-crypto' },
  { label: 'RIPEMD-160', value: 'RIPEMD-160', description: '160位哈希，比特币地址生成使用', type: 'crypto-js' },
  { label: 'Whirlpool', value: 'Whirlpool', description: '512位哈希，ISO/IEC 10118-3标准', type: 'crypto-js' }
]

// 计算哈希值
async function calculateHash() {
  const input = inputText.value.trim()
  if (!input) {
    outputHash.value = ''
    return
  }

  try {
    const algorithm = hashAlgorithms.find(alg => alg.value === selectedAlgorithm.value)
    if (!algorithm) {
      outputHash.value = '不支持的算法'
      return
    }

    let hashHex = ''
    
    if (algorithm.type === 'web-crypto') {
      // 使用Web Crypto API
      const encoder = new TextEncoder()
      const data = encoder.encode(input)
      const hashBuffer = await crypto.subtle.digest(selectedAlgorithm.value, data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } else if (algorithm.type === 'crypto-js') {
      // 使用crypto-js库
      switch (selectedAlgorithm.value) {
        case 'MD5':
          hashHex = CryptoJS.MD5(input).toString()
          break
        case 'RIPEMD-160':
          hashHex = CryptoJS.RIPEMD160(input).toString()
          break
        case 'Whirlpool':
          hashHex = CryptoJS.Whirlpool(input).toString()
          break
        default:
          throw new Error('不支持的算法')
      }
    }
    
    // 根据设置决定大小写
    outputHash.value = isUpperCase.value ? hashHex.toUpperCase() : hashHex.toLowerCase()
  } catch (error) {
    console.error('哈希计算错误:', error)
    outputHash.value = '计算失败'
    ElMessage.error('哈希计算失败，请检查输入内容')
  }
}

// 清空输入输出
function clearAll() {
  inputText.value = ''
  outputHash.value = ''
}

// 监听输入变化
watch([inputText, selectedAlgorithm, isUpperCase], () => {
  if (inputText.value.trim()) {
    calculateHash()
  } else {
    outputHash.value = ''
  }
})

// 获取当前算法的描述
function getCurrentAlgorithmDescription() {
  const algorithm = hashAlgorithms.find(alg => alg.value === selectedAlgorithm.value)
  return algorithm ? algorithm.description : ''
}

// 复制到剪贴板并显示提示
async function copyHashResult() {
  if (!outputHash.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  
  try {
    await copyToClipboard(outputHash.value)
    ElMessage.success('哈希值已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<template>
  <div class="tool-hash-container">
    <h1 class="page-title">
      <el-icon class="title-icon"><Key /></el-icon>
      哈希计算工具
    </h1>

    <el-card class="use-bgc space-16">
      <h3 class="card-title">
        <el-icon class="title-icon arrow-right"><ArrowRight /></el-icon>
        哈希计算
      </h3>

      <el-row class="space-16 tool-row">
        <el-col :span="24">
          <div class="input-section">
            <el-input v-model="inputText" type="textarea" :rows="4" size="large" 
              placeholder="请输入要计算哈希的文本"
              @input="calculateHash">
            </el-input>
          </div>
        </el-col>
      </el-row>

      <el-row class="space-16 tool-row" :gutter="16">
        <el-col :xs="24" :sm="24" :md="8" :lg="8">
          <el-select v-model="selectedAlgorithm" size="large" @change="calculateHash">
            <el-option v-for="algorithm in hashAlgorithms" :key="algorithm.value" 
              :label="algorithm.label" :value="algorithm.value">
              <div class="algorithm-option">
                <span class="algorithm-name">{{ algorithm.label }}</span>
                <span class="algorithm-desc">{{ algorithm.description }}</span>
              </div>
            </el-option>
          </el-select>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="4" :lg="4">
          <el-switch v-model="isUpperCase" active-text="大写" inactive-text="小写" 
            @change="calculateHash" />
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="4" :lg="4">
          <el-button type="success" size="large" @click="clearAll">
            清空
          </el-button>
        </el-col>
        
        <el-col :xs="24" :sm="24" :md="8" :lg="8">
          <div class="algorithm-info">
            <span class="info-text">{{ getCurrentAlgorithmDescription() }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row class="space-16 tool-row">
        <el-col :span="24">
          <div class="output-section">
            <el-input v-model="outputHash" type="textarea" :rows="6" size="large" disabled 
              :placeholder="`${selectedAlgorithm} 哈希值`"
              class="clickable-output" @click="copyHashResult">
              <template #prepend>
                <span class="hash-label">{{ selectedAlgorithm }}:</span>
              </template>
            </el-input>
            <div class="copy-button-container">
              <el-button type="primary" size="large" class="copy-btn" 
                :icon="CopyDocument" @click="copyHashResult"
                :disabled="!outputHash">
                复制结果
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="use-bgc space-16">
      <h3 class="card-title">
        <el-icon class="title-icon"><Key /></el-icon>
        哈希算法说明
      </h3>

      <el-row>
        <el-col :span="24">
          <el-table :data="hashAlgorithms" style="width: 100%">
            <el-table-column prop="label" label="算法" width="120" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="示例" width="200">
              <template #default="scope">
                <el-button size="small" @click="inputText = 'Hello World'; selectedAlgorithm = scope.row.value; calculateHash()">
                  测试
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <el-row class="space-12">
        <el-col :span="24">
          <h4>使用建议</h4>
          <ul class="usage-tips">
            <li><strong>文件完整性校验</strong>：使用MD5或SHA-256计算文件哈希值</li>
            <li><strong>密码存储</strong>：使用SHA-256或SHA-512，并配合盐值</li>
            <li><strong>数字签名</strong>：使用SHA-256或SHA-512</li>
            <li><strong>区块链应用</strong>：比特币使用SHA-256，以太坊使用Keccak-256</li>
            <li><strong>安全要求</strong>：避免使用MD5和SHA-1进行安全相关应用，推荐使用SHA-256或SHA-512</li>
          </ul>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped>
.tool-hash-container {
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

.algorithm-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.algorithm-name {
  font-weight: 600;
  color: var(--bTextColor);
}

.algorithm-desc {
  font-size: 12px;
  color: var(--bTextColor);
  opacity: 0.7;
}

.algorithm-info {
  display: flex;
  align-items: center;
  height: 100%;
}

.info-text {
  font-size: 14px;
  color: var(--bTextColor);
  opacity: 0.8;
  line-height: 1.4;
}

.hash-label {
  font-weight: 600;
  color: var(--titleColor);
  min-width: 80px;
  display: flex;
  align-items: flex-start;
  padding-top: 8px;
}

.quick-btn {
  width: 100%;
  margin-bottom: 12px;
  font-size: 12px;
  height: 36px;
  border-radius: 6px;
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

/* 输出区域特殊样式 */
.clickable-output .el-textarea__inner {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 12px;
  resize: none;
}

.output-section {
  position: relative;
}

.copy-button-container {
  margin-top: 12px;
  text-align: center;
}

.copy-btn {
  min-width: 120px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.copy-btn:disabled {
  transform: none;
  box-shadow: none;
}

.usage-tips {
  margin: 8px 0;
  padding-left: 20px;
  color: var(--bTextColor);
  opacity: 0.8;
  line-height: 1.8;
}

.usage-tips li {
  margin-bottom: 8px;
}

.usage-tips strong {
  color: var(--bTextColor);
}

h4 {
  color: var(--bTextColor);
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

/* 深色模式适配 */
html.dark .use-bgc {
  background-color: var(--bPageBgColor);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark .clickable-output:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

html.dark .clickable-output:active {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-hash-container {
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
  
  .tool-row {
    margin-bottom: 12px;
  }
  
  /* 移动端布局调整 */
  .el-col {
    margin-bottom: 12px;
  }
  
  /* 移动端输入框调整 */
  .input-section {
    margin-bottom: 12px;
  }
  
  .el-textarea textarea {
    font-size: 14px;
    min-height: 80px;
  }
  
  /* 移动端选择器调整 */
  .el-select {
    width: 100%;
  }
  
  /* 移动端按钮调整 */
  .el-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }
  
  /* 移动端开关调整 */
  .el-switch {
    width: 100%;
    justify-content: center;
  }
  
  /* 移动端算法信息调整 */
  .algorithm-info {
    text-align: center;
    margin-top: 8px;
  }
  
  .info-text {
    font-size: 13px;
  }
  
  /* 移动端输出区域调整 */
  .output-section {
    margin-top: 12px;
  }
  
  .hash-label {
    min-width: 60px;
    font-size: 14px;
  }
  
  /* 移动端复制按钮调整 */
  .copy-button-container {
    margin-top: 8px;
  }
  
  .copy-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }
  
  /* 移动端表格调整 */
  .el-table {
    font-size: 12px;
  }
  
  .el-table th,
  .el-table td {
    padding: 8px 4px;
    font-size: 12px;
  }
  
  /* 移动端使用提示调整 */
  .usage-tips {
    font-size: 13px;
    padding-left: 16px;
  }
  
  .usage-tips li {
    margin-bottom: 6px;
  }
  
  h4 {
    font-size: 1em;
    margin-bottom: 6px;
  }
}

@media (max-width: 480px) {
  .tool-hash-container {
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
  
  .tool-row {
    margin-bottom: 8px;
  }
  
  /* 超小屏幕下的特殊处理 */
  .el-col {
    width: 100% !important;
    margin-bottom: 6px;
  }
  
  /* 超小屏幕输入框调整 */
  .el-textarea textarea {
    font-size: 13px;
    min-height: 60px;
  }
  
  /* 超小屏幕按钮调整 */
  .el-button {
    height: 40px;
    font-size: 14px;
  }
  
  .copy-btn {
    height: 40px;
    font-size: 14px;
  }
  
  /* 超小屏幕算法信息调整 */
  .algorithm-info {
    margin-top: 6px;
  }
  
  .info-text {
    font-size: 12px;
  }
  
  /* 超小屏幕表格调整 */
  .el-table {
    font-size: 10px;
  }
  
  .el-table th,
  .el-table td {
    padding: 6px 2px;
    font-size: 10px;
  }
  
  /* 超小屏幕使用提示调整 */
  .usage-tips {
    font-size: 12px;
    padding-left: 12px;
  }
  
  .usage-tips li {
    margin-bottom: 4px;
  }
  
  h4 {
    font-size: 0.9em;
    margin-bottom: 4px;
  }
  
  /* 超小屏幕哈希标签调整 */
  .hash-label {
    min-width: 50px;
    font-size: 12px;
  }
}
</style> 