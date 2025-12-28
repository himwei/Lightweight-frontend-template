import axios from 'axios'; // <--- 引入 axios
import { OpenAPI } from './generated/core/OpenAPI';
import {ElMessage} from "element-plus";

export function initApiConfig() {
    // 1. 配置生成的代码的基础路径
    OpenAPI.BASE = '/api';

    // 2. 直接给全局 axios 添加拦截器
    // 因为生成的代码底层默认使用全局 axios 发送请求
    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem('satoken');
        if (token) {
            // 这里的 header key 必须和你后端 sa-token.token-name 一致
            config.headers['satoken'] = token;
        }
        return config;
    });

    // 3. (可选) 响应拦截器：自动处理 401 未登录
    axios.interceptors.response.use(
        (response) => {
            const { data } = response

            if (data.code === 40100) {
                ElMessage.warning('未登录')
                // Token 过期或无效，清理并跳转登录
                localStorage.removeItem('satoken');
                window.location.href = '/login';
            }

            // 如果响应为 NOT_FOUND_ERROR(40400, "请求数据不存在") 则跳转至404页面
            if(data.code === 40400){
                // message.warning('请求数据不存在')
                setTimeout(()=>{
                    window.location.href = `/404`
                },1000)
            }

            return response;

        },
        (error) => {
            return Promise.reject(error);
        }
    );
}
