// 完全移除 moment 依赖，使用原生 JavaScript 日期 API

// 格式化时间日期 按本地时间
// 2024/11/12 16:38:19
export function formatDate(date) {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);
}

// 根据时间戳格式化时间日期 ms
export function formatDateByTimestamp(timestamp) {
    return formatDate(new Date(timestamp))
}

// 转换为毫秒级时间戳
export function date2MsTimestamp(date) {
    return date.getTime();
}

// 转换为秒级时间戳
export function date2STimestamp(date) {
    return parseInt(date.getTime() / 1000);
}

// 使用原生 JavaScript 替代 moment
export function timestamp2time(stamp, timeZone) {
    if (typeof stamp === 'string') {
        stamp = parseInt(stamp);
    }
    
    const date = new Date(stamp);
    
    if (timeZone) {
        // 使用 Intl.DateTimeFormat 处理时区
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: timeZone
        }).format(date);
    }
    
    return formatDate(date);
}