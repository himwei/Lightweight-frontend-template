import axios from 'axios'; // <--- 引入 axios
import { OpenAPI } from './generated/core/OpenAPI';

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
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Token 过期或无效，清理并跳转登录
                localStorage.removeItem('satoken');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
}
