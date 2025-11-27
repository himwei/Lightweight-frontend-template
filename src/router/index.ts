import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 路由表
const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/LoginView.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/',
        name: 'Layout',
        component: () => import('@/layout/BasicLayout.vue'),
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/DashboardView.vue'),
                meta: { title: '首页', requiresAuth: true }
            },
            {
                path: 'user',
                name: 'UserManage',
                component: () => import('@/views/system/UserView.vue'),
                meta: { title: '用户管理', requiresAuth: true }
            }
        ]
    },
    // 404 路由 (可选)
    // {
    //   path: '/:pathMatch(.*)*',
    //   name: 'NotFound',
    //   component: () => import('@/views/error/404.vue')
    // }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
