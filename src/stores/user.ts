import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // 引入 computed
import { UserControllerService, type UserVO } from '@/api/generated'

export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('satoken') || '')
    const userInfo = ref<UserVO | null>(null)

    // --- 新增：计算当前用户拥有的角色列表 ---
    // 防止 userInfo 为空时报错
    const userRoles = computed(() => userInfo.value?.roles || [])

    // --- 新增：判断是否拥有某个角色 ---
    function hasRole(roleCode: string): boolean {
        return userRoles.value.includes(roleCode)
    }

    function setToken(newToken: string) {
        token.value = newToken
        localStorage.setItem('satoken', newToken)
    }

    async function logout() {
        try {
            // 1. 告诉后端注销 (即使后端报错也不影响前端退出，所以不用 await 结果)
            if (token.value) {
                await UserControllerService.logout()
            }
        } catch (e) {
            console.warn('后端退出接口调用失败', e)
        } finally {
            // 2. 无论如何，前端都要清除数据
            token.value = ''
            userInfo.value = null
            localStorage.removeItem('satoken')
        }
    }

    async function fetchUserInfo() {
        try {
            const res = await UserControllerService.getCurrentUser()
            if (res.code === 0 && res.data) {
                userInfo.value = res.data
            }
        } catch (error) {
            console.error(error)
        }
    }

    // 记得把 userRoles 和 hasRole 导出
    return { token, userInfo, userRoles, hasRole, setToken, logout, fetchUserInfo }
})
