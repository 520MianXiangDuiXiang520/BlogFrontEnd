import axios from "axios";
import { ElMessage } from "element-plus";
import { debounce } from "lodash-es";
import { removeEmptyInObj } from "@/utils/common";

const debounceErr = debounce(msg => {
    ElMessage.error(msg);
}, 200);

const instance = axios.create({
    baseURL: "https://junebao.top/api",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
    timeout: 60 * 1000, // 请求超时秒数
});

// 添加请求拦截器
instance.interceptors.request.use(
    function (config) {
        // 在发送请求之前做些什么
        config.params = removeEmptyInObj(config.params);
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 添加响应拦截器
instance.interceptors.response.use(
    function (response) {
        console.log(response);
        let appCode = response.data.code;
        if(appCode != 200) {
            debounceErr(response.data.msg);
        } 
        
        return response.data;
    },
    function (error) {
        debounceErr("server error: " + error.code);
        return Promise.reject(error);
    }
);

export default instance;