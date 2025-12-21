<template>
  <div class="dashboard-container">
    <!-- 1. 欢迎卡片 (通用) -->
    <el-card class="welcome-card" shadow="hover">
      <div class="welcome-content">
        <el-avatar :size="64" :src="userStore.userInfo?.avatar" class="avatar">
          {{ userStore.userInfo?.nickName?.charAt(0) }}
        </el-avatar>
        <div class="info">
          <h2 class="title">
            {{ timePeriod }}好，{{ userStore.userInfo?.nickName }}
          </h2>
          <p class="subtitle">
            当前身份：
            <el-tag effect="dark" :type="roleTagType" size="small">
              {{ roleName }}
            </el-tag>
            <span class="date-info">
              {{ currentDate }}
            </span>
          </p>
        </div>
      </div>
    </el-card>

    <!-- 2. 角色专属数据面板 (核心改造部分) -->

    <!-- [管理员] 数据统计面板 -->
    <div v-if="userStore.hasRole(RoleEnum.ADMIN)" class="role-panel">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>用户总数</span>
                <el-tag type="primary" effect="plain">User</el-tag>
              </div>
            </template>
            <div class="stat-value">
              <el-icon class="icon-bg"><User /></el-icon>
              <span>{{ stats.userCount }}</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>注册医生</span>
                <el-tag type="success" effect="plain">Doctor</el-tag>
              </div>
            </template>
            <div class="stat-value">
              <el-icon class="icon-bg"><FirstAidKit /></el-icon>
              <span>{{ stats.doctorCount }}</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>开设科室</span>
                <el-tag type="warning" effect="plain">Dept</el-tag>
              </div>
            </template>
            <div class="stat-value">
              <el-icon class="icon-bg"><OfficeBuilding /></el-icon>
              <span>{{ stats.deptCount }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- [医生] 下次排班预告 -->
    <div v-if="userStore.hasRole(RoleEnum.DOCTOR)" class="role-panel">
      <el-card shadow="hover" header="我的近期排班">
        <div v-if="nextSchedule" class="next-item-box">
          <div class="left-icon success-bg">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="right-info">
            <div class="main-text">
              {{ formatDate(nextSchedule.workDate) }}
              <span class="highlight">{{ nextSchedule.shiftType === 1 ? '上午' : '下午' }}</span>
            </div>
            <div class="sub-text">
              挂号费：￥{{ nextSchedule.price }} |
              预约情况：{{ nextSchedule.bookedNum }} / {{ nextSchedule.quota }}
            </div>
          </div>
          <el-button type="primary" round size="small" @click="router.push('/doctor/schedule')">查看详情</el-button>
        </div>
        <el-empty v-else description="近期暂无排班" :image-size="60" />
      </el-card>
    </div>

    <!-- [患者] 待就诊提醒 -->
    <div v-if="userStore.hasRole(RoleEnum.PATIENT)" class="role-panel">
      <el-card shadow="hover" header="待就诊提醒">
        <div v-if="nextAppointment" class="next-item-box">
          <div class="left-icon warning-bg">
            <el-icon><Bell /></el-icon>
          </div>
          <div class="right-info">
            <div class="main-text">
              {{ formatDate(nextAppointment.workDate) }}
              {{ nextAppointment.shiftType === 1 ? '上午' : '下午' }}
            </div>
            <div class="sub-text">
              {{ nextAppointment.deptName }} - {{ nextAppointment.doctorName }} 医生
            </div>
          </div>
          <el-button type="primary" round size="small" @click="router.push('/patient/record')">查看详情</el-button>
        </div>
        <div v-else class="empty-appointment">
          <el-empty description="当前无待就诊预约" :image-size="60">
            <el-button type="primary" @click="router.push('/patient/home')">去挂号</el-button>
          </el-empty>
        </div>
      </el-card>
    </div>

    <!-- 3. 快捷功能入口 (保持原逻辑，布局微调) -->
    <h3 class="section-title">快捷导航</h3>
    <el-row :gutter="20" class="shortcut-row">
      <!-- 管理员快捷入口 -->
      <template v-if="userStore.hasRole(RoleEnum.ADMIN)">
        <el-col :span="6" v-for="item in adminShortcuts" :key="item.title">
          <el-card shadow="hover" class="shortcut-card" @click="router.push(item.path)">
            <div class="sc-content">
              <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
              <div class="text">{{ item.title }}</div>
            </div>
          </el-card>
        </el-col>
      </template>

      <!-- 医生快捷入口 -->
      <template v-if="userStore.hasRole(RoleEnum.DOCTOR)">
        <el-col :span="6" v-for="item in doctorShortcuts" :key="item.title">
          <el-card shadow="hover" class="shortcut-card" @click="router.push(item.path)">
            <div class="sc-content">
              <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
              <div class="text">{{ item.title }}</div>
            </div>
          </el-card>
        </el-col>
      </template>

      <!-- 患者快捷入口 -->
      <template v-if="userStore.hasRole(RoleEnum.PATIENT)">
        <el-col :span="8" v-for="item in patientShortcuts" :key="item.title">
          <el-card shadow="hover" class="shortcut-card" @click="router.push(item.path)">
            <div class="sc-content">
              <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
              <div class="text">{{ item.title }}</div>
            </div>
          </el-card>
        </el-col>
      </template>
    </el-row>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { RoleEnum, RoleNameMap } from '@/constants/RoleConstant'
import dayjs from 'dayjs'
import { formatDate } from '@/utils/dateUtil'
import {
  OfficeBuilding, UserFilled, List, Plus, Tickets, User,
  Calendar, FirstAidKit, Bell
} from '@element-plus/icons-vue'
import {
  UserControllerService,
  DoctorControllerService,
  DepartmentControllerService,
  RegistrationControllerService,
  ScheduleControllerService,
  type RegistrationVO,
  type ScheduleVO
} from '@/api/generated'

const userStore = useUserStore()
const router = useRouter()

// --- 基础信息 ---
const timePeriod = computed(() => {
  const hour = new Date().getHours()
  if (hour < 9) return '早上'
  if (hour < 12) return '上午'
  if (hour < 14) return '中午'
  if (hour < 18) return '下午'
  return '晚上'
})
const currentDate = dayjs().format('YYYY年MM月DD日 dddd')

const roleTagType = computed(() => {
  if (userStore.hasRole(RoleEnum.ADMIN)) return 'danger'
  if (userStore.hasRole(RoleEnum.DOCTOR)) return 'success'
  return 'primary'
})

const roleName = computed(() => {
  const roles = userStore.userInfo?.roles || []
  if (roles.length > 0) return RoleNameMap[roles[0]] || roles[0]
  return '用户'
})

// --- 动态数据 State ---

// 管理员统计数据
const stats = reactive({
  userCount: 0,
  doctorCount: 0,
  deptCount: 0
})

// 患者下一次预约
const nextAppointment = ref<RegistrationVO | null>(null)
// 医生下一次排班
const nextSchedule = ref<ScheduleVO | null>(null)

// --- 数据加载逻辑 ---
const initDashboardData = async () => {
  // 1. 如果是管理员，获取统计数据
  if (userStore.hasRole(RoleEnum.ADMIN)) {
    // 并发请求，利用 pageSize=1 获取 total 即可
    const [uRes, dRes, deptRes] = await Promise.all([
      UserControllerService.pageUsers({ pageNum: 1, pageSize: 1 }),
      DoctorControllerService.listDoctors({ pageNum: 1, pageSize: 1 }),
      DepartmentControllerService.getDepartmentList({ pageNum: 1, pageSize: 1 })
    ])
    stats.userCount = Number(uRes.data?.total) || 0
    stats.doctorCount = Number(dRes.data?.total) || 0
    stats.deptCount = Number(deptRes.data?.total) || 0
  }

  // 2. 如果是患者，获取最近待就诊记录
  if (userStore.hasRole(RoleEnum.PATIENT)) {
    // 获取最近 10 条记录
    const res = await RegistrationControllerService.getMyRegistrations({ pageNum: 1, pageSize: 10 })
    const list = res.data?.records || []
    // 筛选出 status === 0 (已预约/待就诊) 的第一条
    // 注意：假设后端返回是按时间倒序的，我们需要找到未来的。
    // 简单逻辑：找到第一个 status == 0 的即可
    nextAppointment.value = list.find((item: RegistrationVO) => item.status === 0) || null
  }

  // 3. 如果是医生，获取最近排班
  if (userStore.hasRole(RoleEnum.DOCTOR)) {
    // 获取医生ID
    const profile = await DoctorControllerService.getProfile()
    if (profile.data?.id) {
      const res = await ScheduleControllerService.listSchedules({
        pageNum: 1,
        pageSize: 10, // 取前10条
        doctorId: profile.data.id,
        status: 1 // 正常的排班
      })
      // 找到第一条日期 >= 今天的
      const list = res.data?.records || []
      const today = dayjs().format('YYYY-MM-DD')
      // 假设后端排序是按日期升序，或者我们自己找
      nextSchedule.value = list.find((s: ScheduleVO) => s.workDate! >= today) || null
    }
  }
}

onMounted(() => {
  initDashboardData()
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
  { title: '个人信息', icon: User, path: '/dashboard', color: '#909399' },
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
    border: none;
    background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
    .welcome-content {
      display: flex;
      align-items: center;
      .avatar {
        margin-right: 20px;
        background-color: #409EFF;
        font-size: 24px;
      }
      .info {
        .title { margin: 0 0 8px 0; font-size: 20px; color: #303133; font-weight: 600; }
        .subtitle {
          color: #606266; font-size: 14px; display: flex; align-items: center; gap: 10px;
          .date-info { color: #909399; font-size: 13px; margin-left: 10px; }
        }
      }
    }
  }

  .role-panel {
    margin-bottom: 30px;
    .stat-card {
      border: none;
      .card-header {
        display: flex; justify-content: space-between; align-items: center;
      }
      .stat-value {
        margin-top: 10px;
        display: flex; align-items: center; justify-content: space-between;
        span { font-size: 32px; font-weight: bold; color: #303133; }
        .icon-bg {
          font-size: 48px; color: #f2f3f5; transform: rotate(-15deg);
        }
      }
    }

    .next-item-box {
      display: flex; align-items: center; padding: 10px 0;
      .left-icon {
        width: 48px; height: 48px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        margin-right: 15px;
        font-size: 24px;
        &.success-bg { background: #f0f9eb; color: #67C23A; }
        &.warning-bg { background: #fdf6ec; color: #E6A23C; }
      }
      .right-info {
        flex: 1;
        .main-text { font-size: 16px; font-weight: bold; color: #303133; margin-bottom: 4px; }
        .sub-text { font-size: 13px; color: #909399; }
        .highlight { color: #409EFF; margin-left: 5px; }
      }
    }
  }

  .section-title {
    font-size: 16px; margin: 0 0 15px 0; padding-left: 10px;
    border-left: 4px solid #409EFF; color: #303133;
  }

  .shortcut-row {
    .shortcut-card {
      cursor: pointer;
      border: none;
      transition: all 0.3s;
      &:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
      .sc-content {
        display: flex; align-items: center; justify-content: center; flex-direction: column;
        padding: 15px 0;
        .text { margin-top: 10px; font-weight: 500; color: #606266; }
      }
    }
  }
}
</style>
