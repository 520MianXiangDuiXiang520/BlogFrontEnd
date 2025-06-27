import { ElMessage } from "element-plus";

export function errorMsg(msg) {
    ElMessage({
        message: msg,
        type: 'error',
    })
}

export function successMsg(msg) {
    ElMessage({
        message: msg,
        type: 'success',
    })
}