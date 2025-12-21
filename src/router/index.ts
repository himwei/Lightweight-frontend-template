import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import {RoleEnum} from "@/constants/RoleConstant.ts";

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
            },


            // --- 管理员模块 ---
            {
                path: 'admin/dept',
                name: 'admin-dept',
                component: () => import('../views/admin/DeptList.vue'),
                meta: { title: '科室管理', role: RoleEnum.ADMIN }
            },
            {
                path: 'admin/doctor',
                name: 'admin-doctor',
                component: () => import('../views/admin/DoctorList.vue'),
                meta: { title: '医生排班', role: RoleEnum.ADMIN }
            },
            // 🔥 新增：就诊管理
            {
                path: 'admin/registration',
                name: 'admin-registration',
                component: () => import('../views/admin/RegistrationList.vue'),
                meta: { title: '就诊管理', role: RoleEnum.ADMIN }
            },

            // --- 医生模块 ---
            {
                path: 'doctor/patients',
                name: 'doctor-patients',
                component: () => import('../views/doctor/MyPatients.vue'),
                meta: { title: '我的接诊', role: RoleEnum.DOCTOR }
            },
            {
                path: 'doctor/schedule',
                name: 'doctor-schedule',
                component: () => import('../views/doctor/MySchedule.vue'),
                meta: { title: '我的排班', role: RoleEnum.DOCTOR }
            },

            // --- 患者模块 ---
            {
                path: 'patient/home',
                name: 'patient-home',
                component: () => import('../views/patient/Home.vue'),
                meta: { title: '挂号大厅', role: RoleEnum.PATIENT }
            },
            {
                path: 'patient/record',
                name: 'patient-record',
                component: () => import('../views/patient/MyRecord.vue'),
                meta: { title: '挂号记录', role: RoleEnum.PATIENT }
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
