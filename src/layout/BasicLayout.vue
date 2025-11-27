<template>
  <el-container style="height: 100vh;">
    <el-aside width="200px" style="background-color: #001529;">
      <div style="height:60px; line-height:60px; text-align:center; color:#fff; font-weight:bold;">
        Admin System
      </div>
      <el-menu router :default-active="$route.path" background-color="#001529" text-color="#fff">
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon><span>控制台</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><User /></el-icon><span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="border-bottom: 1px solid #eee; display: flex; justify-content: flex-end; align-items: center;">
        <span style="margin-right: 15px;">{{ userStore.userInfo?.nickname || '用户' }}</span>
        <el-button link type="primary" @click="handleLogout">退出</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>
