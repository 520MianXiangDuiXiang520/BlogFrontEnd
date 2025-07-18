<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { formatDate, date2STimestamp, date2MsTimestamp, timestamp2time } from '@/utils/date'
import { copyToClipboard } from '@/utils/clipboard'
import { VideoPause, VideoPlay, CopyDocument, Clock, Timer, Calendar, ArrowRight, ArrowLeft, Delete, Document } from '@element-plus/icons-vue'
// import Map from './map.vue'

const nowTime = ref(new Date);
const timerStoped = ref(false);
const allTimeZone = ref([]); // 支持的所有时区
const selectTimeZone = ref('Asia/Shanghai'); // 选择的时区
const selectOption = ref([]);
const allCountry = ref([]);
// const selectByCountrySwitch = ref(false);
const selectNoMapSwitch = ref(true);
const mapDialogVisible = ref(false);

// 时间戳转时间相关
const inputTimeTamp = ref(''); //输入的时间戳
const outputTime = ref(''); // 计算出的时间
const inputSOrMs = ref('1'); // 输入的秒还是毫秒

// 时间转时间戳相关
const inputDateTime = ref(''); // 输入的时间
const outputTimestamp = ref(''); // 输出的时间戳
const outputSOrMs = ref('1'); // 输出的秒还是毫秒

// 历史记录相关
const historyRecords = ref([]);
const maxHistoryCount = 50; // 最大历史记录数量

// 防抖相关
let debounceTimer = null;
const debounceDelay = 500; // 500ms 防抖延迟

let timer = 0

// 历史记录管理
function addToHistory(type, input, output, timezone) {
    const record = {
        id: Date.now(),
        type: type, // 'timestamp2time' 或 'time2timestamp'
        input: input,
        output: output,
        timezone: timezone,
        timestamp: new Date().toISOString()
    };
    
    // 检查是否已存在相同的记录
    const existingIndex = historyRecords.value.findIndex(item => 
        item.type === record.type && 
        item.input === record.input && 
        item.timezone === record.timezone
    );
    
    if (existingIndex !== -1) {
        // 如果存在相同记录，更新输出和时间戳
        historyRecords.value[existingIndex].output = record.output;
        historyRecords.value[existingIndex].timestamp = record.timestamp;
        // 将更新的记录移到顶部
        const updatedRecord = historyRecords.value.splice(existingIndex, 1)[0];
        historyRecords.value.unshift(updatedRecord);
    } else {
        // 添加新记录到顶部
        historyRecords.value.unshift(record);
        
        // 限制历史记录数量
        if (historyRecords.value.length > maxHistoryCount) {
            historyRecords.value = historyRecords.value.slice(0, maxHistoryCount);
        }
    }
    
    // 保存到本地存储
    saveHistoryToStorage();
}

function removeHistoryRecord(id) {
    const index = historyRecords.value.findIndex(record => record.id === id);
    if (index !== -1) {
        historyRecords.value.splice(index, 1);
        saveHistoryToStorage();
    }
}

function clearAllHistory() {
    historyRecords.value = [];
    saveHistoryToStorage();
}

function loadHistoryFromStorage() {
    try {
        const stored = localStorage.getItem('toolDateHistory');
        if (stored) {
            historyRecords.value = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Failed to load history from storage:', error);
    }
}

function saveHistoryToStorage() {
    try {
        localStorage.setItem('toolDateHistory', JSON.stringify(historyRecords.value));
    } catch (error) {
        console.error('Failed to save history to storage:', error);
    }
}

function useHistoryRecord(record) {
    if (record.type === 'timestamp2time') {
        inputTimeTamp.value = record.input;
        selectTimeZone.value = record.timezone;
        onTampInput();
    } else if (record.type === 'time2timestamp') {
        inputDateTime.value = record.input;
        selectTimeZone.value = record.timezone;
        onDateTimeInput();
    }
}

function formatHistoryTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
        return '刚刚';
    } else if (diff < 3600000) { // 1小时内
        return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 1天内
        return `${Math.floor(diff / 3600000)}小时前`;
    } else {
        return date.toLocaleDateString();
    }
}

function selectByTimeZone() {
    selectNoMapSwitch.value = true;
    selectOption.value = allTimeZone.value;
}

function startInterval() {
    timer = setInterval(() => {
        nowTime.value = new Date;
    }, 100) // 改为100ms刷新
}

function pauseInterval() {
    clearInterval(timer);
    timerStoped.value = true;
}

function restartInterval() {
    startInterval();
    timerStoped.value = false;
}

// 时间戳转时间
function onTampInput() {
    const inputValue = inputTimeTamp.value.trim();
    if (inputValue === '') {
        outputTime.value = '';
        return;
    }
    const num = Number(inputValue);
    if (!isNaN(num)) {
        if (num >= 9999999999) { // UTC 2286-11-20 17:46:39
            inputSOrMs.value = '2';  // ms
        } else {
            inputSOrMs.value = '1';  // s
        }
    }
    
    // 清除之前的防抖定时器
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    
    // 设置新的防抖定时器
    debounceTimer = setTimeout(() => {
        toTime();
    }, debounceDelay);
}

function toTime(){
    if (!inputTimeTamp.value.trim()) {
        outputTime.value = '';
        return;
    }
    
    try {
        if (inputSOrMs.value == '1') {
            outputTime.value = timestamp2time(inputTimeTamp.value*1000, selectTimeZone.value)
        } else {
            outputTime.value = timestamp2time(inputTimeTamp.value, selectTimeZone.value)
        }
    } catch (error) {
        outputTime.value = '转换失败';
    }
}

// 手动转换时间戳转时间（添加到历史记录）
function toTimeWithHistory(){
    toTime();
    // 只有在转换成功时才添加到历史记录
    if (outputTime.value && outputTime.value !== '转换失败') {
        addToHistory('timestamp2time', inputTimeTamp.value, outputTime.value, selectTimeZone.value);
    }
}

// 时间转时间戳
function onDateTimeInput() {
    const inputValue = inputDateTime.value.trim();
    if (inputValue === '') {
        outputTimestamp.value = '';
        return;
    }
    
    // 清除之前的防抖定时器
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    
    // 设置新的防抖定时器
    debounceTimer = setTimeout(() => {
        toTimestamp();
    }, debounceDelay);
}

function toTimestamp(){
    if (!inputDateTime.value.trim()) {
        outputTimestamp.value = '';
        return;
    }
    
    try {
        // 使用原生 JavaScript 解析时间
        let date;
        const input = inputDateTime.value.trim();
        
        // 尝试解析多种时间格式
        const formats = [
            /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/, // YYYY/MM/DD HH:mm:ss
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, // YYYY-MM-DD HH:mm:ss
            /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/, // YYYY/MM/DD HH:mm
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, // YYYY-MM-DD HH:mm
            /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
            /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD
        ];
        
        let parsed = false;
        for (const format of formats) {
            if (format.test(input)) {
                date = new Date(input);
                if (!isNaN(date.getTime())) {
                    parsed = true;
                    break;
                }
            }
        }
        
        if (!parsed) {
            // 如果标准格式都解析失败，尝试自动解析
            date = new Date(input);
        }
        
        if (!isNaN(date.getTime())) {
            if (outputSOrMs.value == '1') {
                outputTimestamp.value = Math.floor(date.getTime() / 1000).toString();
            } else {
                outputTimestamp.value = date.getTime().toString();
            }
        } else {
            outputTimestamp.value = '时间格式错误';
        }
    } catch (error) {
        outputTimestamp.value = '时间格式错误';
    }
}

// 手动转换时间转时间戳（添加到历史记录）
function toTimestampWithHistory(){
    toTimestamp();
    // 只有在转换成功时才添加到历史记录
    if (outputTimestamp.value && outputTimestamp.value !== '时间格式错误') {
        addToHistory('time2timestamp', inputDateTime.value, outputTimestamp.value, selectTimeZone.value);
    }
}

// 监听时区变化，自动重新计算
watch(selectTimeZone, () => {
    if (inputTimeTamp.value.trim()) {
        toTime();
    }
    if (inputDateTime.value.trim()) {
        toTimestamp();
    }
});

// 监听输出格式变化
watch(outputSOrMs, () => {
    if (inputDateTime.value.trim()) {
        toTimestamp();
    }
});

onMounted(() => {
    startInterval();
    allTimeZone.value = Intl.supportedValuesOf('timeZone');
    
    // 移除 moment 依赖，简化国家列表
    allCountry.value = [];
    
    selectByTimeZone();
    
    // 加载历史记录
    loadHistoryFromStorage();
})

onBeforeUnmount(() => {
    clearInterval(timer)
    timer = 0
    
    // 清理防抖定时器
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
})
</script>


<template>
    <div class="tool-date-container">
        <!-- 页面标题 -->
        <div class="page-header">
            <h1 class="page-title">
                <el-icon class="title-icon"><Clock /></el-icon>
                时间日期转换工具
            </h1>
            <p class="page-subtitle">快速转换时间戳与日期时间格式</p>
        </div>

        <!-- 当前时间显示 -->
        <div class="current-time-section">
            <div class="time-display">
                <div class="time-item" @click="copyToClipboard(formatDate(nowTime))">
                    <div class="time-label">当前时间</div>
                    <div class="time-value">{{ formatDate(nowTime) }}</div>
                </div>
                <div class="time-item" @click="copyToClipboard(date2MsTimestamp(nowTime))">
                    <div class="time-label">毫秒时间戳</div>
                    <div class="time-value">{{ date2MsTimestamp(nowTime) }}</div>
                </div>
                <div class="time-item" @click="copyToClipboard(date2STimestamp(nowTime))">
                    <div class="time-label">秒时间戳</div>
                    <div class="time-value">{{ date2STimestamp(nowTime) }}</div>
                </div>
            </div>
            
            <div class="time-controls">
                <el-button 
                    :icon="timerStoped ? VideoPlay : VideoPause" 
                    :type="timerStoped ? 'success' : 'danger'"
                    size="large"
                    @click="timerStoped ? restartInterval() : pauseInterval()"
                    class="control-btn"
                >
                    {{ timerStoped ? '开始' : '停止' }}
                </el-button>
            </div>
        </div>

        <!-- 转换工具区域 -->
        <div class="conversion-tools">
            <!-- 时间戳转时间 -->
            <div class="tool-section">
                <div class="tool-header">
                    <el-icon class="tool-icon"><ArrowRight /></el-icon>
                    <h2 class="tool-title">时间戳转时间</h2>
                </div>
                
                <div class="tool-content">
                    <div class="input-group">
                        <el-input 
                            v-model="inputTimeTamp" 
                            size="large" 
                            placeholder="请输入时间戳"
                            class="main-input"
                            @input="onTampInput"
                        >
                            <template #append>
                                <el-select v-model="inputSOrMs" placeholder="单位" style="width: 100px" size="large">
                                    <el-option label="秒" value="1" />
                                    <el-option label="毫秒" value="2" />
                                </el-select>
                            </template>
                        </el-input>
                        
                        <el-select 
                            v-model="selectTimeZone" 
                            filterable 
                            placeholder="选择时区" 
                            size="large"
                            class="timezone-select"
                        >
                            <el-option v-for="item in selectOption" :key="item" :label="item" :value="item" />
                        </el-select>
                        
                        <el-button 
                            type="primary" 
                            size="large" 
                            @click="toTimeWithHistory"
                            class="convert-btn"
                        >
                            转换
                        </el-button>
                    </div>
                    
                    <div class="output-group">
                        <el-input 
                            v-model="outputTime" 
                            size="large" 
                            disabled 
                            placeholder="转换结果"
                            class="result-input"
                            @click="copyToClipboard(outputTime)"
                        >
                            <template #suffix>
                                <el-button 
                                    :icon="CopyDocument" 
                                    @click="copyToClipboard(outputTime)"
                                    :disabled="!outputTime"
                                    class="copy-btn"
                                />
                            </template>
                        </el-input>
                    </div>
                </div>
            </div>

            <!-- 时间转时间戳 -->
            <div class="tool-section">
                <div class="tool-header">
                    <el-icon class="tool-icon"><ArrowLeft /></el-icon>
                    <h2 class="tool-title">时间转时间戳</h2>
                </div>
                
                <div class="tool-content">
                    <div class="input-group">
                        <el-input 
                            v-model="inputDateTime" 
                            size="large" 
                            placeholder="请输入时间 (如: 2024/11/12 16:38:19)"
                            class="main-input"
                            @input="onDateTimeInput"
                        />
                        
                        <el-select 
                            v-model="selectTimeZone" 
                            filterable 
                            placeholder="选择时区" 
                            size="large"
                            class="timezone-select"
                        >
                            <el-option v-for="item in selectOption" :key="item" :label="item" :value="item" />
                        </el-select>
                        
                        <el-button 
                            type="primary" 
                            size="large" 
                            @click="toTimestampWithHistory"
                            class="convert-btn"
                        >
                            转换
                        </el-button>
                    </div>
                    
                    <div class="output-group">
                        <el-input 
                            v-model="outputTimestamp" 
                            size="large" 
                            disabled 
                            placeholder="转换结果"
                            class="result-input"
                            @click="copyToClipboard(outputTimestamp)"
                        >
                            <template #append>
                                <el-select v-model="outputSOrMs" placeholder="单位" style="width: 100px" size="large">
                                    <el-option label="秒" value="1" />
                                    <el-option label="毫秒" value="2" />
                                </el-select>
                            </template>
                            <template #suffix>
                                <el-button 
                                    :icon="CopyDocument" 
                                    @click="copyToClipboard(outputTimestamp)"
                                    :disabled="!outputTimestamp"
                                    class="copy-btn"
                                />
                            </template>
                        </el-input>
                    </div>
                </div>
            </div>
        </div>

        <!-- 历史记录区域 -->
        <div class="history-section" v-if="historyRecords.length > 0">
            <div class="history-header">
                <div class="history-title">
                    <el-icon class="history-icon"><Document /></el-icon>
                    <h2 class="history-title-text">转换历史记录</h2>
                    <span class="history-count">({{ historyRecords.length }} 条)</span>
                </div>
                <el-button 
                    type="danger" 
                    size="small" 
                    :icon="Delete"
                    @click="clearAllHistory"
                >
                    清空历史
                </el-button>
            </div>
            
            <div class="history-list">
                <div 
                    v-for="record in historyRecords" 
                    :key="record.id" 
                    class="history-item"
                    @click="useHistoryRecord(record)"
                >
                    <div class="history-content">
                        <div class="history-type">
                            <el-icon class="type-icon">
                                <ArrowRight v-if="record.type === 'timestamp2time'" />
                                <ArrowLeft v-else />
                            </el-icon>
                            <span class="type-text">
                                {{ record.type === 'timestamp2time' ? '时间戳转时间' : '时间转时间戳' }}
                            </span>
                        </div>
                        <div class="history-details">
                            <div class="history-input">
                                <span class="label">输入:</span>
                                <span class="value">{{ record.input }}</span>
                            </div>
                            <div class="history-output">
                                <span class="label">输出:</span>
                                <span class="value">{{ record.output }}</span>
                            </div>
                            <div class="history-timezone">
                                <span class="label">时区:</span>
                                <span class="value">{{ record.timezone }}</span>
                            </div>
                        </div>
                        <div class="history-time">
                            {{ formatHistoryTime(record.timestamp) }}
                        </div>
                    </div>
                    <div class="history-actions">
                        <el-button 
                            type="danger" 
                            size="small" 
                            :icon="Delete"
                            @click.stop="removeHistoryRecord(record.id)"
                            circle
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tool-date-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* 页面头部 */
.page-header {
    text-align: center;
    margin-bottom: 48px;
    padding: 40px 0;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--titleColor);
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.title-icon {
    font-size: 2rem;
    color: var(--titleColor);
}

.page-subtitle {
    font-size: 1.1rem;
    color: var(--bTextColor);
    opacity: 0.8;
    margin: 0;
}

.header-actions {
    margin-top: 16px;
}

/* 当前时间区域 */
.current-time-section {
    background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 48px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--el-border-color-lighter);
}

.time-display {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
}

.time-item {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
}

.time-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.95);
}

.time-label {
    font-size: 0.9rem;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
    font-weight: 500;
}

.time-value {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--el-text-color-primary);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.time-controls {
    display: flex;
    justify-content: center;
}

.control-btn {
    min-width: 120px;
    height: 48px;
    font-weight: 600;
    border-radius: 12px;
}

/* 转换工具区域 */
.conversion-tools {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.tool-section {
    background: var(--el-bg-color);
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--el-border-color-lighter);
}

.tool-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
}

.tool-icon {
    font-size: 1.1em;
    color: var(--titleColor);
}

.tool-title {
    font-size: 1.3em;
    font-weight: 600;
    color: var(--bTextColor);
    margin: 0;
}

.tool-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.input-group {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 16px;
    align-items: start;
}

.main-input {
    min-width: 0;
}

.timezone-select {
    min-width: 200px;
}

.convert-btn {
    min-width: 100px;
    height: 44px;
    font-weight: 600;
    border-radius: 10px;
}

.output-group {
    display: flex;
    gap: 16px;
}

.result-input {
    flex: 1;
}

.copy-btn {
    border: none;
    background: transparent;
    color: var(--el-text-color-regular);
    transition: color 0.2s ease;
}

.copy-btn:hover {
    color: var(--el-color-primary);
    background: transparent;
}

.copy-btn:disabled {
    color: var(--el-text-color-placeholder);
}

/* 深色模式适配 */
html.dark .current-time-section {
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
    border-color: var(--el-border-color);
}

html.dark .time-item {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
}

html.dark .time-item:hover {
    background: rgba(255, 255, 255, 0.08);
}

html.dark .tool-section {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .tool-date-container {
        padding: 0 16px;
    }
    
    .page-header {
        margin-bottom: 32px;
        padding: 24px 0;
    }
    
    .page-title {
        font-size: 2rem;
        gap: 8px;
    }
    
    .title-icon {
        font-size: 1.6rem;
    }
    
    .page-subtitle {
        font-size: 1rem;
    }
    
    .current-time-section {
        padding: 24px;
        margin-bottom: 32px;
        border-radius: 16px;
    }
    
    .time-display {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .time-item {
        padding: 20px;
    }
    
    .time-value {
        font-size: 1.2rem;
    }
    
    .tool-section {
        padding: 24px;
        border-radius: 16px;
    }
    
    .tool-header {
        margin-bottom: 20px;
    }
    
    .input-group {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .timezone-select {
        min-width: auto;
    }
    
    .convert-btn {
        width: 100%;
        height: 48px;
    }
    
    .output-group {
        flex-direction: column;
        gap: 12px;
    }
}

@media (max-width: 480px) {
    .tool-date-container {
        padding: 0 12px;
    }
    
    .page-header {
        margin-bottom: 24px;
        padding: 20px 0;
    }
    
    .page-title {
        font-size: 1.8rem;
        flex-direction: column;
        gap: 6px;
    }
    
    .title-icon {
        font-size: 1.4rem;
    }
    
    .page-subtitle {
        font-size: 0.9rem;
    }
    
    .current-time-section {
        padding: 20px;
        margin-bottom: 24px;
        border-radius: 12px;
    }
    
    .time-item {
        padding: 16px;
    }
    
    .time-value {
        font-size: 1.1rem;
    }
    
    .tool-section {
        padding: 20px;
        border-radius: 12px;
    }
    
    .tool-header {
        margin-bottom: 20px;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
    
    .tool-title {
        font-size: 1.2rem;
    }
    
    .input-group {
        gap: 10px;
    }
    
    .convert-btn {
        height: 44px;
    }
}

/* 历史记录样式 */
.history-section {
    background: var(--el-bg-color);
    border-radius: 20px;
    padding: 32px;
    margin-top: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--el-border-color-lighter);
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.history-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.history-icon {
    font-size: 1.5rem;
    color: var(--el-color-primary);
}

.history-title-text {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
}

.history-count {
    font-size: 0.9rem;
    color: var(--el-text-color-regular);
    font-weight: 400;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--el-bg-color);
}

.history-item:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.history-content {
    flex: 1;
    min-width: 0;
}

.history-type {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
}

.type-icon {
    font-size: 0.9rem;
    color: var(--el-color-primary);
}

.type-text {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.history-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
}

.history-input,
.history-output,
.history-timezone {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
}

.label {
    color: var(--el-text-color-secondary);
    min-width: 40px;
}

.value {
    color: var(--el-text-color-primary);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    word-break: break-all;
}

.history-time {
    font-size: 0.75rem;
    color: var(--el-text-color-placeholder);
}

.history-actions {
    flex-shrink: 0;
}

/* 深色模式适配 */
html.dark .history-section {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
}

html.dark .history-item {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
}

html.dark .history-item:hover {
    border-color: var(--el-color-primary);
    background: var(--el-bg-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .history-section {
        padding: 24px;
        margin-top: 24px;
        border-radius: 16px;
    }
    
    .history-header {
        margin-bottom: 20px;
    }
    
    .history-title-text {
        font-size: 1.2rem;
    }
    
    .history-item {
        padding: 12px;
        gap: 8px;
    }
    
    .history-details {
        gap: 2px;
    }
    
    .history-input,
    .history-output,
    .history-timezone {
        font-size: 0.8rem;
    }
    
    .label {
        min-width: 35px;
    }
}

@media (max-width: 480px) {
    .history-section {
        padding: 20px;
        margin-top: 20px;
        border-radius: 12px;
    }
    
    .history-header {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
        margin-bottom: 16px;
    }
    
    .history-title {
        gap: 8px;
    }
    
    .history-title-text {
        font-size: 1.1rem;
    }
    
    .history-item {
        padding: 10px;
        gap: 6px;
    }
    
    .history-type {
        margin-bottom: 6px;
    }
    
    .history-details {
        margin-bottom: 6px;
    }
    
    .history-input,
    .history-output,
    .history-timezone {
        font-size: 0.75rem;
    }
    
    .label {
        min-width: 30px;
    }
    
    .history-time {
        font-size: 0.7rem;
    }
}
</style>