<script setup>
import { ref, watch } from 'vue'
import { copyToClipboard } from '@/utils/clipboard'
import { CopyDocument, ArrowRight, ArrowLeft, Switch } from '@element-plus/icons-vue'

// 进制转换相关
const inputValue = ref('') // 输入值
const inputBase = ref('10') // 输入进制
const outputValue = ref('') // 输出值
const outputBase = ref('16') // 输出进制

// 支持的进制选项
const baseOptions = [
  { label: '二进制 (2)', value: '2' },
  { label: '八进制 (8)', value: '8' },
  { label: '十进制 (10)', value: '10' },
  { label: '十六进制 (16)', value: '16' },
  { label: '三十二进制 (32)', value: '32' },
  { label: '六十四进制 (64)', value: '64' }
]

// 进制转换函数
function convertBase() {
  const input = inputValue.value.trim()
  if (!input) {
    outputValue.value = ''
    return
  }

  try {
    const inputBaseNum = parseInt(inputBase.value)
    const outputBaseNum = parseInt(outputBase.value)
    
    // 先转换为十进制
    let decimalValue
    if (inputBaseNum === 10) {
      decimalValue = parseInt(input)
    } else {
      decimalValue = parseInt(input, inputBaseNum)
    }
    
    if (isNaN(decimalValue)) {
      outputValue.value = '输入格式错误'
      return
    }
    
    // 再转换为目标进制
    if (outputBaseNum === 10) {
      outputValue.value = decimalValue.toString()
    } else if (outputBaseNum === 16) {
      outputValue.value = decimalValue.toString(16).toUpperCase()
    } else if (outputBaseNum === 2) {
      outputValue.value = decimalValue.toString(2)
    } else if (outputBaseNum === 8) {
      outputValue.value = decimalValue.toString(8)
    } else if (outputBaseNum === 32) {
      outputValue.value = decimalValue.toString(32).toUpperCase()
    } else if (outputBaseNum === 64) {
      // 简单的64进制实现
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/'
      let result = ''
      let num = decimalValue
      if (num === 0) {
        outputValue.value = '0'
        return
      }
      while (num > 0) {
        result = chars[num % 64] + result
        num = Math.floor(num / 64)
      }
      outputValue.value = result
    }
  } catch (error) {
    outputValue.value = '转换失败'
  }
}

// 自动检测输入进制
function detectInputBase(input) {
  if (!input || input.trim() === '') return
  
  const value = input.trim()
  
  // 检测十六进制 (以0x开头或包含A-F)
  if (value.startsWith('0x') || /^[0-9A-Fa-f]+$/.test(value)) {
    if (value.startsWith('0x')) {
      inputBase.value = '16'
    } else if (/^[0-9A-Fa-f]+$/.test(value) && /[A-Fa-f]/.test(value)) {
      inputBase.value = '16'
    }
  }
  // 检测二进制 (只包含0和1，且长度大于1)
  else if (/^[01]+$/.test(value) && value.length > 1) {
    inputBase.value = '2'
  }
  // 检测八进制 (以0开头且只包含0-7)
  else if (value.startsWith('0') && /^[0-7]+$/.test(value) && value.length > 1) {
    inputBase.value = '8'
  }
  // 检测十进制 (只包含0-9)
  else if (/^[0-9]+$/.test(value)) {
    inputBase.value = '10'
  }
  // 检测三十二进制 (包含0-9和A-V)
  else if (/^[0-9A-Va-v]+$/.test(value) && /[A-Va-v]/.test(value)) {
    inputBase.value = '32'
  }
  // 检测六十四进制 (包含特殊字符)
  else if (/^[0-9A-Za-z+/]+$/.test(value) && /[A-Za-z+/]/.test(value)) {
    inputBase.value = '64'
  }
}

// 快速转换函数
function quickConvert(targetBase) {
  outputBase.value = targetBase
  convertBase()
}

// 交换进制
function swapBases() {
  const temp = inputBase.value
  inputBase.value = outputBase.value
  outputBase.value = temp
  convertBase()
}

// 监听输入变化
watch([inputValue, inputBase, outputBase], () => {
  if (inputValue.value.trim()) {
    // 先自动检测输入进制
    detectInputBase(inputValue.value)
    // 然后进行转换
    convertBase()
  }
})
</script>

<template>
  <div class="tool-hex-container">
    <h1 class="page-title">
      <el-icon class="title-icon"><Switch /></el-icon>
      进制转换工具
    </h1>

    <el-card class="use-bgc space-16">
      <h3 class="card-title">
        <el-icon class="title-icon arrow-right"><ArrowRight /></el-icon>
        进制转换
      </h3>

      <el-row class="space-16 tool-row" :gutter="16">
        <el-col :xs="24" :sm="24" :md="10" :lg="8">
          <el-input v-model="inputValue" size="large" placeholder="请输入数值"
            @input="convertBase">
          </el-input>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-select v-model="inputBase" size="large" @change="convertBase">
            <el-option v-for="option in baseOptions" :key="option.value" 
              :label="option.label" :value="option.value" />
          </el-select>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="4" :lg="2">
          <el-button type="primary" size="large" class="transition-btn" @click="swapBases">
            <el-icon><Switch /></el-icon>
          </el-button>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" :lg="4">
          <el-select v-model="outputBase" size="large" @change="convertBase">
            <el-option v-for="option in baseOptions" :key="option.value" 
              :label="option.label" :value="option.value" />
          </el-select>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="10" :lg="6">
          <el-input v-model="outputValue" size="large" disabled placeholder="转换结果" 
            class="clickable-output" @click="copyToClipboard(outputValue)">
            <template #append>
              <el-button :icon="CopyDocument" @click="copyToClipboard(outputValue)"/>
            </template>
          </el-input>
        </el-col>
      </el-row>

      <el-row class="space-12" :gutter="12">
        <el-col :xs="12" :sm="6" :md="4" :lg="4" v-for="option in baseOptions" :key="option.value">
          <el-button type="success" size="default" class="quick-btn" 
            @click="quickConvert(option.value)">
            {{ option.label }}
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="use-bgc space-16">
      <h3 class="card-title">
        <el-icon class="title-icon"><Switch /></el-icon>
        常用进制对照表
      </h3>

      <el-table :data="[
        { decimal: '0', binary: '0', octal: '0', hex: '0' },
        { decimal: '1', binary: '1', octal: '1', hex: '1' },
        { decimal: '2', binary: '10', octal: '2', hex: '2' },
        { decimal: '3', binary: '11', octal: '3', hex: '3' },
        { decimal: '4', binary: '100', octal: '4', hex: '4' },
        { decimal: '5', binary: '101', octal: '5', hex: '5' },
        { decimal: '6', binary: '110', octal: '6', hex: '6' },
        { decimal: '7', binary: '111', octal: '7', hex: '7' },
        { decimal: '8', binary: '1000', octal: '10', hex: '8' },
        { decimal: '9', binary: '1001', octal: '11', hex: '9' },
        { decimal: '10', binary: '1010', octal: '12', hex: 'A' },
        { decimal: '11', binary: '1011', octal: '13', hex: 'B' },
        { decimal: '12', binary: '1100', octal: '14', hex: 'C' },
        { decimal: '13', binary: '1101', octal: '15', hex: 'D' },
        { decimal: '14', binary: '1110', octal: '16', hex: 'E' },
        { decimal: '15', binary: '1111', octal: '17', hex: 'F' }
      ]" style="width: 100%">
        <el-table-column prop="decimal" label="十进制" />
        <el-table-column prop="binary" label="二进制" />
        <el-table-column prop="octal" label="八进制" />
        <el-table-column prop="hex" label="十六进制" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.tool-hex-container {
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

.transition-btn {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  height: 40px;
  font-size: 14px;
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

/* 输入框样式优化 */
.el-input {
  border-radius: 8px;
}

.el-select {
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
  .tool-hex-container {
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
  .el-input,
  .el-select {
    width: 100%;
  }
  
  /* 移动端按钮调整 */
  .transition-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }
  
  /* 移动端快速按钮调整 */
  .quick-btn {
    height: 40px;
    font-size: 14px;
    margin-bottom: 8px;
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
  
  /* 移动端输入框样式优化 */
  .el-input {
    border-radius: 8px;
  }
  
  .el-select {
    border-radius: 8px;
  }
}

@media (max-width: 480px) {
  .tool-hex-container {
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
  
  /* 超小屏幕按钮调整 */
  .transition-btn {
    height: 40px;
    font-size: 14px;
  }
  
  .quick-btn {
    height: 36px;
    font-size: 12px;
    margin-bottom: 6px;
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
  
  /* 超小屏幕快速按钮网格调整 */
  .el-row .el-col {
    width: 50% !important;
  }
  
  .quick-btn {
    font-size: 11px;
    height: 32px;
  }
}

@media (max-width: 360px) {
  .tool-hex-container {
    padding: 8px;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .title-icon {
    font-size: 1rem;
  }
  
  .card-title {
    font-size: 0.9em;
  }
  
  .use-bgc {
    padding: 8px;
    margin-bottom: 8px;
  }
  
  /* 超小屏幕表格进一步调整 */
  .el-table {
    font-size: 9px;
  }
  
  .el-table th,
  .el-table td {
    padding: 4px 1px;
    font-size: 9px;
  }
  
  /* 超小屏幕快速按钮进一步调整 */
  .el-row .el-col {
    width: 50% !important;
  }
  
  .quick-btn {
    font-size: 10px;
    height: 28px;
    margin-bottom: 4px;
  }
}
</style> 