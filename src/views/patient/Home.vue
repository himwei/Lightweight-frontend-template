<template>
  <div class="home-container">
    <el-container style="height: calc(100vh - 100px);">
      <!-- 左侧科室导航 -->
      <el-aside width="220px" style="background: #fff; border-right: 1px solid #eee;">
        <div class="aside-header">科室分类</div>
        <el-menu
            :default-active="activeDeptId"
            @select="handleDeptSelect"
            class="dept-menu"
        >
          <el-menu-item index="">
            <el-icon><Menu /></el-icon><span>全部科室</span>
          </el-menu-item>
          <el-menu-item v-for="dept in deptList" :key="dept.id" :index="String(dept.id)">
            <el-icon><FirstAidKit /></el-icon>
            <span>{{ dept.deptName }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧医生列表 -->
      <el-main style="background: #f5f7fa; padding: 20px;">
        <!-- 搜索栏 -->
        <div class="filter-bar">
          <el-input
              v-model="query.keyword"
              placeholder="搜索医生姓名或简介..."
              style="width: 300px;"
              clearable
              @clear="loadDoctors"
              @keyup.enter="loadDoctors"
          >
            <template #append><el-button :icon="Search" @click="loadDoctors"/></template>
          </el-input>
        </div>

        <!-- 列表 -->
        <el-empty v-if="!loading && doctorList.length === 0" description="暂无相关医生" />

        <el-row :gutter="20" v-loading="loading">
          <el-col :span="8" v-for="doc in doctorList" :key="doc.id" style="margin-bottom: 20px;">
            <el-card shadow="hover" class="doctor-card" :body-style="{ padding: '0px' }">
              <div class="card-content">
                <div class="header">
                  <el-avatar :size="60" :src="doc.avatar" class="avatar">{{ doc.doctorName?.charAt(0) }}</el-avatar>
                  <div class="base-info">
                    <div class="name">{{ doc.doctorName }}</div>
                    <div class="tags">
                      <el-tag size="small" effect="plain">{{ doc.title }}</el-tag>
                      <el-tag size="small" type="info">{{ doc.deptName }}</el-tag>
                    </div>
                  </div>
                </div>
                <div class="intro">
                  {{ doc.intro || '这位医生很忙，暂时没有写简介...' }}
                </div>
                <div class="footer">
                  <div class="price">挂号费: <span>￥{{ doc.price }}</span></div>
                  <el-button type="primary" size="small" round @click="openBooking(doc)">
                    预约挂号
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 🔥 新增：分页组件 (放在 el-main 底部) -->
        <div class="pagination-container" v-if="total > 0">
          <el-pagination
              background
              v-model:current-page="query.pageNum"
              v-model:page-size="query.pageSize"
              :total="total"
              :page-sizes="[6, 12, 24]"
              layout="total, prev, pager, next"
              @current-change="loadDoctors"
          />
        </div>
      </el-main>
    </el-container>

    <!-- 引入子组件 -->
    <BookingDialog
        v-model="bookingVisible"
        :doctor-id="currentDoc.id"
        :doctor-name="currentDoc.name"
        @success="handleBookingSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, reactive} from 'vue'
import { Search, Menu, FirstAidKit } from '@element-plus/icons-vue'
import {
  DepartmentControllerService,
  DoctorControllerService,
  type TDepartment,
  type DoctorVO
} from '@/api/generated'
import BookingDialog from './BookingDialog.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const deptList = ref<TDepartment[]>([])
const doctorList = ref<DoctorVO[]>([])


const query = reactive({
  pageNum: 1,
  pageSize: 6, // 每页显示 6 个比较合适 (3列x2行)
  deptId: undefined as number | undefined,
  keyword: ''
})
const total = ref(0)


const activeDeptId = ref('') // 选中的科室ID，空字符串代表全部
const searchKeyword = ref('')

// 弹窗控制
const bookingVisible = ref(false)
const currentDoc = ref({ id: 0, name: '' })

// 1. 加载科室
const loadDepts = async () => {
  const res = await DepartmentControllerService.getDepartmentList({
    pageNum: 1,
    pageSize: 100,
  })
  deptList.value = res.data.records || []
}

// 2. 加载医生
const loadDoctors = async () => {
  loading.value = true
  try {
    const res = await DoctorControllerService.listDoctors({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      deptId: query.deptId, // 使用 query 对象里的参数
      keyword: query.keyword
    })

    if (res.code === 0 && res.data) {
      doctorList.value = res.data.records || []
      total.value = Number(res.data.total) || 0 // 记得转 Number
    }
  } finally {
    loading.value = false
  }
}

// 切换科室
const handleDeptSelect = (index: string) => {
  query.deptId = index ? Number(index) : undefined
  query.pageNum = 1 // 切换科室时重置到第一页
  loadDoctors()
}

// 打开挂号弹窗
const openBooking = (doc: DoctorVO) => {
  currentDoc.value = { id: doc.id!, name: doc.doctorName! }
  bookingVisible.value = true
}

// 挂号成功后跳转到记录页
const handleBookingSuccess = () => {
  router.push('/patient/record')
}

onMounted(() => {
  loadDepts()
  loadDoctors()
})
</script>

<style scoped lang="scss">
.aside-header {
  height: 50px; line-height: 50px; padding-left: 20px;
  font-weight: bold; color: #333; border-bottom: 1px solid #f0f0f0;
}
.dept-menu { border-right: none; }

.filter-bar { margin-bottom: 20px; display: flex; justify-content: space-between; }

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.doctor-card {
  transition: transform 0.2s;
  &:hover { transform: translateY(-3px); }

  .card-content {
    padding: 20px;
    .header {
      display: flex;
      gap: 15px;
      .base-info {
        .name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .tags { display: flex; gap: 5px; }
      }
    }
    .intro {
      margin: 15px 0; font-size: 13px; color: #666;
      line-height: 1.5; height: 40px; overflow: hidden;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .footer {
      display: flex; justify-content: space-between; align-items: center;
      border-top: 1px solid #f5f5f5; padding-top: 12px;
      .price { color: #F56C6C; font-weight: bold; span { font-size: 18px; } }
    }
  }
}
</style>
