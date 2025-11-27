import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UserControllerService, type UserVO } from '@/api/generated'

export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('satoken') || '')
    const userInfo = ref<UserVO | null>(null)

    // 登录成功后调用
    function setToken(newToken: string) {
        token.value = newToken
        localStorage.setItem('satoken', newToken)
    }

    // 退出登录
    function logout() {
        token.value = ''
        userInfo.value = null
        localStorage.removeItem('satoken')
    }

    // 获取用户信息
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

    return { token, userInfo, setToken, logout, fetchUserInfo }
})
