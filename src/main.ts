import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { initApiConfig } from '@/api/config.ts'
import { setupRouterGuard } from '@/router/guard' // <--- 引入

// 1. 初始化 API
initApiConfig()

const app = createApp(App)
const pinia = createPinia()

// 2. 注册状态管理 (必须在 router 之前注册，因为 guard 用到了 store)
app.use(pinia)

// 3. 注册路由
app.use(router)

// 4. ★★★ 初始化路由守卫 ★★★
setupRouterGuard(router)

// 5. UI 组件
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')
