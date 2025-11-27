<template>
  <div style="height: 100vh; display: flex; justify-content: center; align-items: center;">
    <el-card style="width: 350px;">
      <h2 style="text-align: center;">系统登录</h2>
      <el-form :model="form">
        <el-form-item>
          <el-input v-model="form.username" placeholder="账号" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" show-password />
        </el-form-item>
        <el-button type="primary" style="width: 100%;" @click="handleLogin">登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { UserControllerService } from '@/api/generated'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const form = reactive({ username: '', password: '' })

const handleLogin = async () => {
  try {
    const res = await UserControllerService.login(form)
    if (res.code === 0 && res.data) {
      userStore.setToken(res.data.token || '')
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {
    ElMessage.error('登录失败')
  }
}
</script>
