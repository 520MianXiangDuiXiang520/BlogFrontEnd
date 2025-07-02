<script setup>
import { ref, watch, onMounted } from 'vue'
import { copyToClipboard } from '@/utils/clipboard'
import { DocumentCopy, Sort, Filter, Refresh, ArrowRight } from '@element-plus/icons-vue'

const inputText = ref('')
const outputText = ref('')
const functionType = ref('dedup') // dedup: 去重, sort: 排序
const sortOrder = ref('asc') // asc: 升序, desc: 降序
const removeEmpty = ref(true) // 是否移除空行
const trimWhitespace = ref(true) // 是否忽略首尾空白字符
const caseSensitive = ref(false) // 是否区分大小写
const delimiter = ref('whitespace') // 分隔符
const customDelimiter = ref('') // 自定义分隔符
const outputDelimiter = ref('whitespace') // 输出分隔符
const customOutputDelimiter = ref('') // 自定义输出分隔符
const stats = ref({ original: 0, processed: 0, removed: 0 }) // 处理统计
const textareaHeight = ref(15) // 文本框行数
const isMobile = ref(false) // 移动端检测

// 处理字符串去重和排序
function processString() {
  if (!inputText.value.trim()) {
    outputText.value = ''
    return
  }

  try {
    // 第一步：根据分隔符分割字符串
    let lines = []
    if (delimiter.value === 'custom') {
      lines = inputText.value.split(customDelimiter.value)
    } else if (delimiter.value === 'whitespace') {
      // 空白字符分割：空格、回车、制表符等
      lines = inputText.value.split(/\s+/)
    } else if (delimiter.value === 'newline') {
      // 换行符分割
      lines = inputText.value.split('\n')
    } else {
      lines = inputText.value.split(delimiter.value)
    }
    
    console.log('分割后的字符串:', lines)
    
    // 第二步：如果启用了忽略首尾空白，对所有分割后的字符串进行trim处理
    console.log('trimWhitespace开关状态:', trimWhitespace.value)
    if (trimWhitespace.value) {
      lines = lines.map(line => line.trim())
      console.log('trim处理后的字符串:', lines)
    } else {
      console.log('未启用trim，保持原始字符串:', lines)
    }
    
    // 第三步：移除空行（如果启用）
    if (removeEmpty.value) {
      lines = lines.filter(line => line !== '')
      console.log('移除空行后的字符串:', lines)
    }
    
    // 更新统计信息
    stats.value.original = lines.length
    
    let resultLines = []
    
    // 第四步：根据选择的功能进行处理
    if (functionType.value === 'dedup') {
      // 去重功能
      if (caseSensitive.value) {
        // 区分大小写去重
        resultLines = [...new Set(lines)]
      } else {
        // 不区分大小写去重
        const seen = new Set()
        resultLines = lines.filter(line => {
          const lowerLine = line.toLowerCase()
          if (seen.has(lowerLine)) {
            return false
          }
          seen.add(lowerLine)
          return true
        })
      }
    } else if (functionType.value === 'sort') {
      // 排序功能
      resultLines = [...lines]
      if (sortOrder.value === 'asc') {
        resultLines.sort((a, b) => {
          if (caseSensitive.value) {
            return a.localeCompare(b)
          } else {
            return a.toLowerCase().localeCompare(b.toLowerCase())
          }
        })
      } else {
        resultLines.sort((a, b) => {
          if (caseSensitive.value) {
            return b.localeCompare(a)
          } else {
            return b.toLowerCase().localeCompare(a.toLowerCase())
          }
        })
      }
    }
    
    console.log('最终处理结果:', resultLines)
    
    // 更新统计信息
    stats.value.processed = resultLines.length
    stats.value.removed = stats.value.original - stats.value.processed
    
    // 第五步：根据输出分隔符重新组合
    let outputSeparator = ''
    if (outputDelimiter.value === 'custom') {
      outputSeparator = customOutputDelimiter.value
    } else if (outputDelimiter.value === 'whitespace') {
      outputSeparator = ' '
    } else if (outputDelimiter.value === 'newline') {
      outputSeparator = '\n'
    } else {
      outputSeparator = outputDelimiter.value
    }
    outputText.value = resultLines.join(outputSeparator)
    
  } catch (error) {
    outputText.value = '处理出错：' + error.message
  }
}

// 清空输入
function clearInput() {
  inputText.value = ''
  outputText.value = ''
}

// 清空输出
function clearOutput() {
  outputText.value = ''
}

// 交换输入输出
function swapInputOutput() {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
}

// 基础去重测试
function loadBasicDedupTest() {
  functionType.value = 'dedup'
  caseSensitive.value = true
  removeEmpty.value = true
  trimWhitespace.value = true
  inputText.value = `apple
banana
apple
cherry
banana
apple
cherry`
}

// 大小写敏感去重测试
function loadCaseSensitiveDedupTest() {
  functionType.value = 'dedup'
  caseSensitive.value = true
  removeEmpty.value = true
  trimWhitespace.value = true
  inputText.value = `Apple
apple
APPLE
Banana
banana
Apple`
}

// 大小写不敏感去重测试
function loadCaseInsensitiveDedupTest() {
  functionType.value = 'dedup'
  caseSensitive.value = false
  removeEmpty.value = true
  trimWhitespace.value = true
  inputText.value = `Apple
apple
APPLE
Banana
banana
Apple`
}

// 空白字符处理测试
function loadWhitespaceTest() {
  functionType.value = 'dedup'
  caseSensitive.value = true
  removeEmpty.value = true
  trimWhitespace.value = true
  inputText.value = `  apple  
banana
	cherry	
  grape  
apple
	banana	`
}

// 数字排序测试
function loadNumberSortTest() {
  functionType.value = 'sort'
  sortOrder.value = 'asc'
  caseSensitive.value = true
  removeEmpty.value = true
  trimWhitespace.value = true
  inputText.value = `100
10
1
1000
50
5
500`
}

// 字母排序测试
function loadLetterSortTest() {
  functionType.value = 'sort'
  sortOrder.value = 'asc'
  caseSensitive.value = true
  removeEmpty.value = true
  trimWhitespace.value = true
  inputText.value = `zebra
apple
banana
cherry
delta
echo`
}

// 混合排序测试
function loadMixedSortTest() {
  functionType.value = 'sort'
  sortOrder.value = 'asc'
  caseSensitive.value = true
  removeEmpty.value = true
  trimWhitespace.value = true
  inputText.value = `file1.txt
file10.txt
file2.txt
file20.txt
file3.txt
file30.txt`
}

// 中文排序测试
function loadChineseSortTest() {
  functionType.value = 'sort'
  sortOrder.value = 'asc'
  caseSensitive.value = true
  removeEmpty.value = true
  trimWhitespace.value = true
  inputText.value = `张三
李四
王五
赵六
钱七
孙八`
}

// 特殊字符处理测试
function loadSpecialCharTest() {
  functionType.value = 'dedup'
  caseSensitive.value = true
  removeEmpty.value = true
  trimWhitespace.value = true
  inputText.value = `file@test.com
file#test.com
file$test.com
file%test.com
file@test.com
file#test.com`
}

// 空行处理测试
function loadEmptyLineTest() {
  functionType.value = 'dedup'
  caseSensitive.value = true
  removeEmpty.value = true
  trimWhitespace.value = true
  inputText.value = `line1

line2

line3

line1

line2`
}









// 监听输入变化，自动处理
watch([inputText, functionType, sortOrder, removeEmpty, trimWhitespace, caseSensitive, delimiter, customDelimiter, outputDelimiter, customOutputDelimiter], () => {
  processString()
}, { deep: true })



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
              
              if (newRows >= 8 && newRows <= 30) {
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
  <div>
    <div class="page-header">
      <h1 class="page-title">
        <el-icon class="title-icon"><DocumentCopy /></el-icon>
        字符串去重排序工具
      </h1>
    </div>

    <el-card class="use-bgc space-12">
      <h3 class="card-title">
        <el-icon class="title-icon"><Filter /></el-icon>
        处理选项
      </h3>
      
      <el-row :gutter="16" class="space-8">
        <el-col :xs="24" :sm="12" :md="6">
          <el-form-item label="功能选择">
            <div class="function-buttons">
              <el-button 
                :type="functionType === 'dedup' ? 'primary' : 'default'"
                @click="functionType = 'dedup'"
                size="large"
              >
                <el-icon><Filter /></el-icon>
                去重
              </el-button>
              <el-button 
                :type="functionType === 'sort' ? 'primary' : 'default'"
                @click="functionType = 'sort'"
                size="large"
              >
                <el-icon><Sort /></el-icon>
                排序
              </el-button>
            </div>
          </el-form-item>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" v-if="functionType === 'sort'">
          <el-form-item label="排序方式">
            <el-select v-model="sortOrder" placeholder="选择排序方式">
              <el-option label="升序 (A-Z)" value="asc" />
              <el-option label="降序 (Z-A)" value="desc" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-form-item label="大小写敏感">
            <el-switch v-model="caseSensitive" />
          </el-form-item>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-form-item label="移除空行">
            <el-switch v-model="removeEmpty" />
          </el-form-item>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-form-item label="忽略首尾空白">
            <el-switch v-model="trimWhitespace" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="16" class="space-8">
        <el-col :xs="24" :sm="12" :md="6">
          <el-form-item label="输入分隔符">
            <el-select v-model="delimiter" placeholder="选择分隔符">
              <el-option label="空白字符" value="whitespace" />
              <el-option label="换行符" value="newline" />
              <el-option label="制表符" value="\t" />
              <el-option label="空格" value=" " />
              <el-option label="逗号" value="," />
              <el-option label="分号" value=";" />
              <el-option label="自定义" value="custom" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-form-item label="输出分隔符">
            <el-select v-model="outputDelimiter" placeholder="选择输出分隔符">
              <el-option label="空白字符" value="whitespace" />
              <el-option label="换行符" value="newline" />
              <el-option label="制表符" value="\t" />
              <el-option label="空格" value=" " />
              <el-option label="逗号" value="," />
              <el-option label="分号" value=";" />
              <el-option label="自定义" value="custom" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row v-if="delimiter === 'custom' || outputDelimiter === 'custom'" :gutter="16" class="space-8">
        <el-col :xs="24" :sm="12" :md="6" v-if="delimiter === 'custom'">
          <el-form-item label="自定义输入分隔符">
            <el-input v-model="customDelimiter" placeholder="输入自定义分隔符" />
          </el-form-item>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" v-if="outputDelimiter === 'custom'">
          <el-form-item label="自定义输出分隔符">
            <el-input v-model="customOutputDelimiter" placeholder="输入自定义输出分隔符" />
          </el-form-item>
        </el-col>
      </el-row>
      
    </el-card>

    <el-row :gutter="16" class="space-12">
      <el-col :xs="24" :lg="12">
        <el-card class="use-bgc">
          <template #header>
            <div class="card-header">
              <span>输入文本</span>
              <div class="header-actions">
                <el-button size="small" @click="clearInput" :icon="Refresh">
                  清空
                </el-button>
                <el-button size="small" @click="swapInputOutput" :icon="ArrowRight">
                  交换
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="input-container input-textarea">
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="textareaHeight"
              placeholder="请输入需要处理的文本，每行一个字符串..."
              resize="vertical"
            />
            <div v-if="stats.original > 0" class="stats-corner">
              {{ stats.original }}→{{ stats.processed }}
              <span v-if="stats.removed > 0">(-{{ stats.removed }})</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="use-bgc">
          <template #header>
            <div class="card-header">
              <span>处理结果</span>
              <div class="header-actions">
                <el-button size="small" @click="clearOutput" :icon="Refresh">
                  清空
                </el-button>
                <el-button 
                  size="small" 
                  @click="copyToClipboard(outputText)" 
                  :icon="DocumentCopy"
                  :disabled="!outputText"
                >
                  复制
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="output-textarea">
            <el-input
              v-model="outputText"
              type="textarea"
              :rows="textareaHeight"
              placeholder="处理结果将在这里显示..."
              resize="vertical"
              readonly
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 测试用例区域 -->
    <el-card class="use-bgc space-12">
      <h3 class="card-title">
        <el-icon class="title-icon"><Sort /></el-icon>
        测试用例
      </h3>
      
      <div class="test-cases-grid">
        <!-- 基础去重测试 -->
        <div class="test-case-item">
          <div class="test-case-header">
            <h4>基础去重</h4>
            <el-button @click="loadBasicDedupTest" size="small" type="primary" plain>
              测试
            </el-button>
          </div>
          <div class="test-case-desc">测试基本去重功能，包含重复项和空行</div>
          <div class="test-case-data">
            <code>apple
banana
apple
cherry
banana
apple
cherry</code>
          </div>
        </div>

        <!-- 大小写敏感去重 -->
        <div class="test-case-item">
          <div class="test-case-header">
            <h4>大小写敏感去重</h4>
            <el-button @click="loadCaseSensitiveDedupTest" size="small" type="primary" plain>
              测试
            </el-button>
          </div>
          <div class="test-case-desc">测试大小写敏感的去重功能</div>
          <div class="test-case-data">
            <code>Apple
apple
APPLE
Banana
banana
Apple</code>
          </div>
        </div>

        <!-- 大小写不敏感去重 -->
        <div class="test-case-item">
          <div class="test-case-header">
            <h4>大小写不敏感去重</h4>
            <el-button @click="loadCaseInsensitiveDedupTest" size="small" type="primary" plain>
              测试
            </el-button>
          </div>
          <div class="test-case-desc">测试大小写不敏感的去重功能</div>
          <div class="test-case-data">
            <code>Apple
apple
APPLE
Banana
banana
Apple</code>
          </div>
        </div>

        <!-- 空白字符处理 -->
        <div class="test-case-item">
          <div class="test-case-header">
            <h4>空白字符处理</h4>
            <el-button @click="loadWhitespaceTest" size="small" type="primary" plain>
              测试
            </el-button>
          </div>
          <div class="test-case-desc">测试包含空格、制表符的文本处理</div>
          <div class="test-case-data">
            <code>  apple  
banana
	cherry	
  grape  
apple
	banana	</code>
          </div>
        </div>

        <!-- 数字排序 -->
        <div class="test-case-item">
          <div class="test-case-header">
            <h4>数字排序</h4>
            <el-button @click="loadNumberSortTest" size="small" type="primary" plain>
              测试
            </el-button>
          </div>
          <div class="test-case-desc">测试数字的升序和降序排序</div>
          <div class="test-case-data">
            <code>100
10
1
1000
50
5
500</code>
          </div>
        </div>

        <!-- 字母排序 -->
        <div class="test-case-item">
          <div class="test-case-header">
            <h4>字母排序</h4>
            <el-button @click="loadLetterSortTest" size="small" type="primary" plain>
              测试
            </el-button>
          </div>
          <div class="test-case-desc">测试字母的升序和降序排序</div>
          <div class="test-case-data">
            <code>zebra
apple
banana
cherry
delta
echo</code>
          </div>
        </div>

        <!-- 混合排序 -->
        <div class="test-case-item">
          <div class="test-case-header">
            <h4>混合排序</h4>
            <el-button @click="loadMixedSortTest" size="small" type="primary" plain>
              测试
            </el-button>
          </div>
          <div class="test-case-desc">测试包含数字、字母、符号的混合排序</div>
          <div class="test-case-data">
            <code>file1.txt
file10.txt
file2.txt
file20.txt
file3.txt
file30.txt</code>
          </div>
        </div>

        <!-- 中文排序 -->
        <div class="test-case-item">
          <div class="test-case-header">
            <h4>中文排序</h4>
            <el-button @click="loadChineseSortTest" size="small" type="primary" plain>
              测试
            </el-button>
          </div>
          <div class="test-case-desc">测试中文字符的排序</div>
          <div class="test-case-data">
            <code>张三
李四
王五
赵六
钱七
孙八</code>
          </div>
        </div>

        <!-- 特殊字符处理 -->
        <div class="test-case-item">
          <div class="test-case-header">
            <h4>特殊字符处理</h4>
            <el-button @click="loadSpecialCharTest" size="small" type="primary" plain>
              测试
            </el-button>
          </div>
          <div class="test-case-desc">测试包含特殊字符的文本处理</div>
          <div class="test-case-data">
            <code>file@test.com
file#test.com
file$test.com
file%test.com
file@test.com
file#test.com</code>
          </div>
        </div>

        <!-- 空行处理 -->
        <div class="test-case-item">
          <div class="test-case-header">
            <h4>空行处理</h4>
            <el-button @click="loadEmptyLineTest" size="small" type="primary" plain>
              测试
            </el-button>
          </div>
          <div class="test-case-desc">测试包含空行的文本处理</div>
          <div class="test-case-data">
            <code>line1

line2

line3

line1

line2</code>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--titleColor);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}



.title-icon {
  font-size: 1.8rem;
  color: var(--titleColor);
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--bTextColor);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.function-buttons {
  display: flex;
  gap: 12px;
}

.function-buttons .el-button {
  flex: 1;
  min-width: 80px;
}

.input-container {
  position: relative;
}

.input-textarea,
.output-textarea {
  position: relative;
}







.stats-corner {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: monospace;
  z-index: 10;
}

.test-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.test-case-item {
  border: 1px solid var(--bBorderColor);
  border-radius: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
}

.test-case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.test-case-header h4 {
  margin: 0;
  color: var(--titleColor);
  font-size: 1rem;
  font-weight: 600;
}

.test-case-desc {
  color: var(--bTextColor);
  opacity: 0.8;
  font-size: 0.9rem;
  margin-bottom: 12px;
  line-height: 1.4;
}

.test-case-data {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  max-height: 120px;
  overflow-y: auto;
}

.test-case-data code {
  color: var(--bTextColor);
  background: none;
  padding: 0;
  border: none;
  white-space: pre-wrap;
  word-break: break-all;
}

.space-8 {
  margin-bottom: 8px;
}

.space-12 {
  margin-bottom: 12px;
}

.use-bgc {
  background-color: var(--bPageBgColor);
  border: 1px solid var(--bBorderColor);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    margin-bottom: 32px;
  }
  
  .page-title {
    font-size: 2rem;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 1.6rem;
  }
  

  
  .card-title {
    font-size: 1.1rem;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .header-actions .el-button {
    width: 100%;
  }
  
  .function-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .function-buttons .el-button {
    width: 100%;
  }
  
  .test-cases-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .test-case-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .test-case-header .el-button {
    width: 100%;
  }
  
  .test-case-data {
    max-height: 100px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 6px;
  }
  
  .title-icon {
    font-size: 1.4rem;
  }
  

  
  .card-title {
    font-size: 1rem;
  }
}
</style> 