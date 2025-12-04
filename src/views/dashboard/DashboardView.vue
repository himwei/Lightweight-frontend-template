<template>
  <div class="dashboard-container">
    <!-- 1. 欢迎卡片 -->
    <el-card class="welcome-card" shadow="hover">
      <div class="welcome-content">
        <el-avatar :size="64" :src="userStore.userInfo?.avatar" class="avatar">
          {{ userStore.userInfo?.nickName?.charAt(0) }}
        </el-avatar>
        <div class="info">
          <h2 class="title">
            {{ timePeriod }}好，{{ userStore.userInfo?.nickName }}，祝你今天工作愉快！
          </h2>
          <p class="subtitle">
            当前身份：
            <el-tag effect="dark" :type="roleTagType">
              {{ roleName }}
            </el-tag>
            <span class="dept-info" v-if="userStore.hasRole(RoleEnum.DOCTOR)">
               | 所属科室：心血管内科 <!-- 这里其实应该从后端通过 DoctorVO 拿到 -->
            </span>
          </p>
        </div>
        <div class="extra-stat">
          <div class="stat-item">
            <div class="label">系统消息</div>
            <div class="value">12</div>
          </div>
          <div class="stat-item">
            <div class="label">待办事项</div>
            <div class="value">3</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 2. 快捷功能入口 (根据角色显示不同) -->
    <el-row :gutter="20" class="shortcut-row">

      <!-- 管理员快捷入口 -->
      <template v-if="userStore.hasRole(RoleEnum.ADMIN)">
        <el-col :span="6" v-for="item in adminShortcuts" :key="item.title">
          <el-card shadow="hover" class="shortcut-card" @click="router.push(item.path)">
            <el-icon :size="32" :color="item.color"><component :is="item.icon" /></el-icon>
            <div class="text">{{ item.title }}</div>
          </el-card>
        </el-col>
      </template>

      <!-- 医生快捷入口 -->
      <template v-if="userStore.hasRole(RoleEnum.DOCTOR)">
        <el-col :span="6" v-for="item in doctorShortcuts" :key="item.title">
          <el-card shadow="hover" class="shortcut-card" @click="router.push(item.path)">
            <el-icon :size="32" :color="item.color"><component :is="item.icon" /></el-icon>
            <div class="text">{{ item.title }}</div>
          </el-card>
        </el-col>
      </template>

      <!-- 患者快捷入口 -->
      <template v-if="userStore.hasRole(RoleEnum.PATIENT)">
        <el-col :span="8" v-for="item in patientShortcuts" :key="item.title">
          <el-card shadow="hover" class="shortcut-card" @click="router.push(item.path)">
            <el-icon :size="32" :color="item.color"><component :is="item.icon" /></el-icon>
            <div class="text">{{ item.title }}</div>
          </el-card>
        </el-col>
      </template>

    </el-row>

    <!-- 3. 底部图表或公告 (Mock) -->
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card header="医院公告" shadow="hover" class="notice-card">
          <el-timeline>
            <el-timeline-item timestamp="2023/12/01" placement="top" type="primary">
              <el-card>
                <h4>系统升级通知</h4>
                <p>我们将于本周日凌晨进行系统维护，届时挂号服务将暂停。</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2023/11/20" placement="top" color="#0bbd87">
              <h4>流感疫苗接种开始啦</h4>
              <p>请各位患者前往预防保健科预约。</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="联系我们" shadow="hover">
          <div class="contact-info">
            <p><el-icon><Phone /></el-icon> 急诊热线：120</p>
            <p><el-icon><Service /></el-icon> 客服电话：010-12345678</p>
            <p><el-icon><Location /></el-icon> 地址：北京市朝阳区XX路88号</p>
          </div>
<!--          <img src="https://via.placeholder.com/300x150?text=Hospital+Map" style="width:100%; border-radius:4px; margin-top:10px;"/>-->
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { RoleEnum, RoleNameMap } from '@/constants/RoleConstant'
import {
  OfficeBuilding, UserFilled, List, Plus, Tickets, User,
  Phone, Service, Location, Odometer, Calendar
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()

// 计算时间段问候
const timePeriod = computed(() => {
  const hour = new Date().getHours()
  if (hour < 9) return '早上'
  if (hour < 12) return '上午'
  if (hour < 14) return '中午'
  if (hour < 18) return '下午'
  return '晚上'
})

// 计算角色标签颜色
const roleTagType = computed(() => {
  if (userStore.hasRole(RoleEnum.ADMIN)) return 'danger'
  if (userStore.hasRole(RoleEnum.DOCTOR)) return 'success'
  return 'primary'
})

// 计算当前角色名称
const roleName = computed(() => {
  const roles = userStore.userInfo?.roles || []
  if (roles.length > 0) return RoleNameMap[roles[0]] || roles[0]
  return '用户'
})

// --- 快捷菜单配置 ---
const adminShortcuts = [
  { title: '科室管理', icon: OfficeBuilding, path: '/admin/dept', color: '#409EFF' },
  { title: '医生排班', icon: UserFilled, path: '/admin/doctor', color: '#67C23A' },
  { title: '用户管理', icon: User, path: '/user', color: '#E6A23C' },
]

const doctorShortcuts = [
  { title: '我的接诊', icon: List, path: '/doctor/patients', color: '#409EFF' },
  { title: '我的排班', icon: Calendar, path: '/doctor/schedule', color: '#67C23A' },
  { title: '个人中心', icon: User, path: '/dashboard', color: '#909399' },
]

const patientShortcuts = [
  { title: '挂号大厅', icon: Plus, path: '/patient/home', color: '#F56C6C' },
  { title: '我的记录', icon: Tickets, path: '/patient/record', color: '#409EFF' },
  { title: '个人信息', icon: User, path: '/dashboard', color: '#E6A23C' },
]
</script>

<style scoped lang="scss">
.dashboard-container {
  .welcome-card {
    margin-bottom: 20px;
    .welcome-content {
      display: flex;
      align-items: center;
      .avatar { margin-right: 20px; background-color: #409EFF; }
      .info {
        flex: 1;
        .title { margin: 0 0 10px 0; font-size: 20px; color: #303133; }
        .subtitle { color: #909399; font-size: 14px; }
        .dept-info { margin-left: 10px; color: #606266; }
      }
      .extra-stat {
        display: flex;
        gap: 40px;
        padding-right: 40px;
        .stat-item {
          text-align: center;
          .label { color: #909399; font-size: 13px; margin-bottom: 5px; }
          .value { font-size: 24px; font-weight: bold; color: #303133; }
        }
      }
    }
  }

  .shortcut-row {
    margin-bottom: 20px;
    .shortcut-card {
      cursor: pointer;
      text-align: center;
      padding: 15px 0;
      transition: all 0.3s;
      &:hover { transform: translateY(-5px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .text { margin-top: 10px; font-weight: 500; color: #606266; }
    }
  }

  .contact-info {
    p { margin: 10px 0; color: #606266; display: flex; align-items: center; gap: 8px; }
  }
}
</style>
