<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { formatDate, date2STimestamp, date2MsTimestamp, timestamp2time } from '@/utils/date'
import { copyToClipboard } from '@/utils/clipboard'
import { VideoPause, VideoPlay, CopyDocument, Clock, Timer, Calendar, ArrowRight, ArrowLeft } from '@element-plus/icons-vue'
import moment from 'moment-timezone';
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

let timer = 0

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
    toTime();
}

function toTime(){
    if (!inputTimeTamp.value.trim()) {
        outputTime.value = '';
        return;
    }
    
    if (inputSOrMs.value == '1') {
        outputTime.value = timestamp2time(inputTimeTamp.value*1000, selectTimeZone.value)
    } else {
        outputTime.value = timestamp2time(inputTimeTamp.value, selectTimeZone.value)
    }
}

// 时间转时间戳
function onDateTimeInput() {
    const inputValue = inputDateTime.value.trim();
    if (inputValue === '') {
        outputTimestamp.value = '';
        return;
    }
    toTimestamp();
}

function toTimestamp(){
    if (!inputDateTime.value.trim()) {
        outputTimestamp.value = '';
        return;
    }
    
    try {
        let momentObj;
        // 尝试解析多种时间格式
        const formats = [
            'YYYY/MM/DD HH:mm:ss',
            'YYYY-MM-DD HH:mm:ss',
            'YYYY/MM/DD HH:mm',
            'YYYY-MM-DD HH:mm',
            'YYYY/MM/DD',
            'YYYY-MM-DD'
        ];
        
        let parsed = false;
        for (const format of formats) {
            if (moment(inputDateTime.value, format, true).isValid()) {
                momentObj = moment(inputDateTime.value, format);
                parsed = true;
                break;
            }
        }
        
        if (!parsed) {
            // 如果标准格式都解析失败，尝试自动解析
            momentObj = moment(inputDateTime.value);
        }
        
        if (momentObj.isValid()) {
            if (selectTimeZone.value) {
                momentObj.tz(selectTimeZone.value);
            }
            
            if (outputSOrMs.value == '1') {
                outputTimestamp.value = momentObj.unix().toString();
            } else {
                outputTimestamp.value = momentObj.valueOf().toString();
            }
        } else {
            outputTimestamp.value = '时间格式错误';
        }
    } catch (error) {
        outputTimestamp.value = '时间格式错误';
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
    allCountry.value = moment.tz.countries();
    selectByTimeZone();
})

onBeforeUnmount(() => {
    clearInterval(timer)
    timer = 0
})
</script>


<template>
    <div>
        <h1 class="page-title">
            <el-icon class="title-icon"><Clock /></el-icon>
            时间日期转换工具
        </h1>

        <el-card class="use-bgc space-12">
            <h3 class="card-title">
                <el-icon class="title-icon"><Timer /></el-icon>
                当前时间
            </h3>
            <el-row class="space-8">
                <el-col :span="8" @click="copyToClipboard(formatDate(nowTime))">
                    <el-tooltip content="点击复制" placement="bottom">
                        <p class="clickable">
                            <span class="now-number">{{ formatDate(nowTime) }}</span>
                        </p>
                    </el-tooltip>
                </el-col>
                <el-col :span="8" @click="copyToClipboard(date2MsTimestamp(nowTime))">
                    <el-tooltip content="点击复制" placement="bottom">
                        <p class="clickable">
                            <span class="now-number">{{ date2MsTimestamp(nowTime) }}</span><span>毫秒 </span>
                        </p>
                    </el-tooltip>
                </el-col>
                <el-col :span="6" @click="copyToClipboard(date2STimestamp(nowTime))">
                    <el-tooltip content="点击复制" placement="bottom">
                        <p class="clickable">
                            <span class="now-number">{{ date2STimestamp(nowTime) }}</span><span>秒</span>
                        </p>
                    </el-tooltip>
                </el-col>
            </el-row>

            <el-button :icon="VideoPlay" type="success" v-if="timerStoped" @click="restartInterval()"> 开始 </el-button>
            <el-button :icon="VideoPause" type="danger" v-else @click="pauseInterval()"> 停止 </el-button>
        </el-card>


<!-- 
        
功能：
 1. 自动识别是时间戳转时间还是时间转时间戳
 2. 时区按照国家搜索 
 3. 中文时区
 4. 支持多种时间格式
 5. 支持时区多选
 6. 支持历史记录
-->

        <el-card class="use-bgc space-12">
            <h3 class="card-title">
                <el-icon class="title-icon arrow-right"><ArrowRight /></el-icon>
                时间戳转时间
            </h3>

            <el-row class="space-12 tool-row">
                <el-col :span="9">
                    <el-input v-model="inputTimeTamp" size="large" placeholder="请输入时间戳"
                        class="input-with-select" @input="onTampInput">
                        <template #append>
                            <el-select v-model="inputSOrMs" placeholder="毫秒(ms)" style="width: 115px" size="large">
                                <el-option label="秒(s)" value="1" />
                                <el-option label="毫秒(ms)" value="2" />
                            </el-select>
                        </template>
                    </el-input>
                </el-col>
               
                <el-col :span="4">
                    <el-select v-model="selectTimeZone" filterable placeholder="Asia/Shanghai" size="large">
                        <el-option v-for="item in selectOption" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-col>
                <el-col :span="2">
                    <el-button type="default" size="large" class="transition-btn" @click="toTime">转换</el-button>
                </el-col>
                <el-col :span="9">
                    <el-input v-model="outputTime" size="large" disabled placeholder="转换结果" 
                        class="clickable-output" @click="copyToClipboard(outputTime)">
                        <template #append>
                            <el-button :icon="CopyDocument" @click="copyToClipboard(outputTime)"/>
                        </template>
                    </el-input>
                </el-col>
            </el-row>
        </el-card>

        <el-card class="use-bgc space-12">
            <h3 class="card-title">
                <el-icon class="title-icon arrow-left"><ArrowLeft /></el-icon>
                时间转时间戳
            </h3>

            <el-row class="space-12 tool-row">
                <el-col :span="9">
                    <el-input v-model="inputDateTime" size="large" placeholder="请输入时间 (如: 2024/11/12 16:38:19)"
                        @input="onDateTimeInput">
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-select v-model="selectTimeZone" filterable placeholder="Asia/Shanghai" size="large">
                        <el-option v-for="item in selectOption" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-col>
                <el-col :span="2">
                    <el-button type="default" size="large" class="transition-btn" @click="toTimestamp">转换</el-button>
                </el-col>
                <el-col :span="9">
                    <el-input v-model="outputTimestamp" size="large" disabled placeholder="转换结果"
                        class="input-with-select clickable-output" @click="copyToClipboard(outputTimestamp)">
                        <template #append>
                            <el-select v-model="outputSOrMs" placeholder="秒(s)" style="width: 115px" size="large">
                                <el-option label="秒(s)" value="1" />
                                <el-option label="毫秒(ms)" value="2" />
                            </el-select>
                        </template>
                        <template #suffix>
                            <el-button :icon="CopyDocument" @click="copyToClipboard(outputTimestamp)" :disabled="!outputTimestamp"/>
                        </template>
                    </el-input>
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>

<style>
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

.now-number {
    font: 2em sans-serif;
    margin-right: 7px;
}

.clickable {
    cursor: pointer;
    transition: opacity 0.2s;
}

.clickable:hover {
    opacity: 0.7;
}

.button-group {
    display: flex;
    gap: 8px;
    align-items: center;
    height: 100%;
}

.button-group .el-button {
    flex: 1;
}

.transition-btn {
    display: block;
    margin-left: auto;
    margin-right: auto;
}

.tool-row {
    margin-bottom: 10px;
}

.space-8 {
    margin-bottom: 8px;
}

.space-12 {
    margin-bottom: 12px;
}

.mt-4 {
    margin-top: 4px;
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

.use-bgc {
    background-color: #fafafa;
    margin-bottom: 16px;
}

/* 让复制按钮与输入框高度一致 */
.el-input .el-button {
    height: 100%;
    border: none;
    background: transparent;
}

.el-input .el-button:hover {
    background-color: #f5f7fa;
}

/* 可点击的输出框样式 */
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
</style>