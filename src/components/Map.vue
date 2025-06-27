<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import moment from 'moment-timezone';
import timezoneData from '@/assets/timezone-meta.json';
import spanOffset from '@/assets/map-span.json'

const centers = ref([]);
const labelName = ref('');
const labelTime = ref('');
const axisXStyle = ref({ left: '0%' });
const axisYStyle = ref({ top: '0%' });
const lastCenter = ref(null);

// 改变中心
function changeCenter(center) {
    if (lastCenter.value === center) return;
    if (lastCenter.value) {
        lastCenter.value.deactivate();
    }
    center.activate();
    lastCenter.value = center;
}

// Center 类
class Center {
    constructor(data) {
        this.name = data.name;
        this.x = (180 + data.long) / 360;
        this.y = (90 - data.lat) / 180;
        this.dom = null;
        this.activate = function () {
            const m = moment().tz(this.name);
            labelName.value = this.name;
            labelTime.value = m.format("hh:mm a ") + m.zoneAbbr();
            axisXStyle.value = { left: `${this.x * 100}%` };
            axisYStyle.value = { top: `${this.y * 100}%` };
        };
        this.deactivate = function () {
            // 逻辑来移除激活状态
        };
        this.distSqr = function (x, y) {
            var dx = this.x - x,
                dy = this.y - y;
            return dx * dx + dy * dy;
        };
    }
}

function loadTimeZoneData() {
    for (const name in timezoneData.zones) {
        centers.value.push(new Center(timezoneData.zones[name]));
    }
    // 自动激活猜测的时区
    const guess = moment.tz.guess();
    const guessedCenter = centers.value.find(c => c.name === guess);
    if (guessedCenter) {
        changeCenter(guessedCenter);
    }
}

function handleMouseMove(event) {
    const map = document.querySelector('.map-inset');
    const rect = map.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;
    let closestCenter = null;
    let closestDist = 100;
    console.log(event.clientX, event.clientY, rect.left,
        rect.top, rect.width, rect.height, px, py);

    for (const center of centers.value) {
        const dist = center.distSqr(px, py);
        if (dist < closestDist) {
            closestCenter = center;
            closestDist = dist;
        }
    }
    if (closestCenter && closestCenter !== lastCenter.value) {
        changeCenter(closestCenter);
    }
}

onMounted(() => {
    loadTimeZoneData();
});

</script>

<template>
    <code>

        <div class="map">
            <h3 class="map-label">
                <div class="map-label-name">{{ labelName }}</div>
                <div class="map-label-time">{{ labelTime }}</div>
            </h3>

            <div class="map-wrap" @mousemove.stop="handleMouseMove">
                <div class="map-inset">
                    <div class="map-axis-x" :style="axisXStyle"></div>
                    <div class="map-axis-y" :style="axisYStyle"></div>
                    <span v-for="item in spanOffset" :key="item.id"
                    :style="{ left: item.left + '%', top: item.top + '%' }"></span>
                </div>
            </div>
        </div>

    </code>

</template>

<style>
.map {
    margin: 0 auto;
    max-width: 1024px;
    padding: 40px;
}

.map-wrap {
    background: #4e7cad url(@/assets/bg.png);
    padding: 1px;
    border-radius: 3px;
    position: relative;
}

.map-label {
    line-height: 60px;
    font-size: 24px;
    margin: 0;
    color: #4e7cad;
    font-family: monospace
}

.map-label span {
    display: block
}

.map-label .map-label-name {
    float: left;
    width: 50%;
    padding-right: 10px;
    text-align: right
}

.map-label .map-label-time {
    margin-left: 50%;
    padding-left: 10px;
    text-align: left
}

.map-inset {
    padding-bottom: 50%;
    background: url(@/assets/world.png) 50% 50%;
    background-size: cover;
    position: relative;
    border-radius: 2px;
}

.map-inset span {
    width: 6px;
    height: 6px;
    margin: -3px 0 0 -3px;
    background: #fff;
    position: absolute;
    border-radius: 3px;
    border: 1px solid #4e7cad;
}


.map-inset span.active {
    background: #4e7cad
}


.map-inset .map-axis-x {
    position: absolute;
    top: 0;
    bottom: 0;
    border-left: 1px solid rgba(78, 124, 173, .5);
    width: 0;
    transition: left 50ms ease-out;
}

.map-inset .map-axis-y {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1px solid rgba(78, 124, 173, .5);
    height: 0;
    transition: top 50ms ease-out;
}
</style>