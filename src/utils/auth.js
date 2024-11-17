import { useCookies } from "vue3-cookies";
import { ElMessage } from "element-plus";
import { useRouter } from 'vue-router'


const { cookies } = useCookies();

export function checkLogined() {
    let session = cookies.get("SESSION_ID");
    return (session && session != "");
}

export function checkAuth() {
    if (checkLogined()) {
        return true;
    }
    ElMessage.error("please login...");
    useRouter().push('/')
}

