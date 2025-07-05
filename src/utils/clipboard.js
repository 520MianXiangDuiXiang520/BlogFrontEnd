import { successMsg, errorMsg } from "@/utils/msg";

export function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            successMsg("已复制！");
        }).catch(err => {
            errorMsg("复制失败！");
        });
    } else {
        errorMsg("复制失败！");
    }
}
