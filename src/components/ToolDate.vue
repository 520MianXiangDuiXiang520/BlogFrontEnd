<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { formatDate, date2STimestamp, date2MsTimestamp, timestamp2time } from '@/utils/date'
import { copyToClipboard } from '@/utils/clipboard'
import { VideoPause, VideoPlay, CopyDocument } from '@element-plus/icons-vue'
import moment from 'moment-timezone';
// import Map from './map.vue'

const nowTime = ref(new Date);
const timerStoped = ref(false);
const allTimeZone = ref([]); // 支持的所有时区
const selectTimeZone = ref(''); // 选择的时区
const selectOption = ref([]);
const allCountry = ref([]);
// const selectByCountrySwitch = ref(false);
const selectNoMapSwitch = ref(true);
const mapDialogVisible = ref(false);

const inputTimeTamp = ref(''); //输入的时间戳
const outputTime = ref(); // 计算出的时间
const inputSOrMs = ref(''); // 输入的秒还是毫秒

let timer = 0

function selectByTimeZone() {
    selectNoMapSwitch.value = true;
    selectOption.value = allTimeZone.value;
}

function startInterval() {
    timer = setInterval(() => {
        nowTime.value = new Date;
    }, 109)
}

function pauseInterval() {
    clearInterval(timer);
    timerStoped.value = true;
}

function restartInterval() {
    startInterval();
    timerStoped.value = false;
    console.log("stop");
}

function onTampInput() {
    const inputValue = inputTimeTamp.value.trim();
    if (inputValue === '') {
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
    if (inputSOrMs.value == '1') {
        outputTime.value = timestamp2time(inputTimeTamp.value*1000, selectTimeZone.value)
    } else {
        outputTime.value = timestamp2time(inputTimeTamp.value, selectTimeZone.value)
    }
}

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
        <h1>时间日期转换工具</h1>

        <el-card class="use-bgc space-12">
            <h3 class="card-title">当前时间</h3>
            <el-row class="space-8">
                <el-col :span="8" @click="copyToClipboard(formatDate(nowTime))">
                    <el-tooltip content="复制" placement="bottom">
                        <p>
                            <span class="now-number">{{ formatDate(nowTime) }}</span>
                        </p>
                    </el-tooltip>

                </el-col>
                <el-col :span="8" @click="copyToClipboard(date2MsTimestamp(nowTime))">
                    <p>
                        <span class="now-number">{{ date2MsTimestamp(nowTime) }}</span><span>毫秒 </span>
                    </p>
                </el-col>
                <el-col :span="6" @click="copyToClipboard(date2STimestamp(nowTime))">
                    <p>
                        <span class="now-number">{{ date2STimestamp(nowTime) }}</span><span>秒</span>
                    </p>
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
            <h3 class="space-8">时间戳转换</h3>

            <!-- 时间戳转时间 -->
            <el-row class="space-12 tool-row">
                <el-col :span="9">
                    <div class="mt-4">
                        <el-input v-model="inputTimeTamp" size="large" placeholder="Please input"
                            class="input-with-select" @input="onTampInput">
                            <template #append>
                                <el-select v-model="inputSOrMs" placeholder="毫秒(ms)" style="width: 115px" size="large">
                                    <el-option label="秒(s)" value="1" />
                                    <el-option label="毫秒(ms)" value="2" />
                                </el-select>
                            </template>
                        </el-input>
                    </div>
                </el-col>
                <el-col :span="2">
                    <el-button type="default" size="large" class="transition-btn" @click="toTime">转换</el-button>
                </el-col>
                <el-col :span="4">
                    <el-select v-model="selectTimeZone" filterable placeholder="Asia/Shanghai" size="large">
                        <el-option v-for="item in selectOption" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-col>
                <el-col :span="9">
                    <el-input v-model="outputTime" size="large" disabled >
                        <template #append>
                            <el-button :icon="CopyDocument" @click="copyToClipboard(outputTime)"/>
                        </template>
                    </el-input>
                </el-col>
            </el-row>

           
        </el-card>



        <el-card class="use-bgc space-12">
            <h3 class="space-8">时间转换</h3>

             <!-- 时间转时间戳 -->

             <el-row class="space-12 tool-row">
                <el-col :span="9">
                    <el-input v-model="outputTime" size="large" disabled >
                        <template #append>
                            <el-button :icon="CopyDocument" @click="copyToClipboard(outputTime)"/>
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
                    <div class="mt-4">
                        <el-input v-model="inputTimeTamp" size="large" placeholder="Please input"
                            class="input-with-select" @input="onTampInput">
                            <template #append>
                                <el-select v-model="inputSOrMs" placeholder="毫秒(ms)" style="width: 115px" size="large">
                                    <el-option label="秒(s)" value="1" />
                                    <el-option label="毫秒(ms)" value="2" />
                                </el-select>
                            </template>
                        </el-input>
                    </div>
                </el-col>

                
                
            </el-row>
        </el-card>
    </div>




</template>

<style>
.now-number {
    font: 2em sans-serif;
    margin-right: 7px;
}

.transition-btn {
    display: block;
    margin-left: auto;
    margin-right: auto;
}
.tool-row {
    margin-bottom: 10px;
}
</style>