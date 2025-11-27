import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'

/**
 * 路由守卫配置
 * @param router 路由实例
 */
export function setupRouterGuard(router: Router) {

    router.beforeEach(async (to, from, next) => {
        const userStore = useUserStore()

        // 1. 如果去的是登录页，且已经登录了，直接去首页
        if (to.path === '/login' && userStore.token) {
            next('/')
            return
        }

        // 2. 如果页面需要鉴权
        if (to.meta.requiresAuth) {
            // 没有 Token，强制跳登录
            if (!userStore.token) {
                next('/login')
                return
            }

            // 有 Token 但没有用户信息 (刷新页面场景)，尝试获取用户信息
            if (!userStore.userInfo) {
                try {
                    await userStore.fetchUserInfo()
                } catch (error) {
                    // 获取用户信息失败（可能是Token失效），登出并跳登录
                    userStore.logout()
                    next('/login')
                    return
                }
            }
        }

        // 放行
        next()
    })
}
