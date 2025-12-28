import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

export function setupRouterGuard(router: Router) {
    router.beforeEach(async (to, from, next) => {
        const userStore = useUserStore()

        // 1. 登录页逻辑
        if (to.path === '/login' && userStore.token) {
            next('/')
            return
        }

        // 2. 鉴权逻辑
        // 你的路由配置里 admin/doctor/patient 都隐含了 requiresAuth (因为在 Layout 下)
        // 或者显式判断 meta.role 存在也需要登录
        if (to.meta.requiresAuth || to.meta.role) {

            if (!userStore.token) {
                next('/login')
                return
            }

            // 刷新页面恢复用户信息
            if (!userStore.userInfo) {
                try {
                    await userStore.fetchUserInfo()
                } catch (error) {
                    userStore.logout()
                    next('/login')
                    return
                }
            }

            // --- 🔥 新增：角色权限拦截 ---
            const requireRole = to.meta.role as string
            // 如果路由配置了 role，但用户没有这个 role
            if (requireRole && !userStore.hasRole(requireRole)) {
                ElMessage.error('权限不足，无法访问')
                // 也可以跳到 403 页面
                next('/dashboard')
                return
            }
        }

        next()
    })
}
