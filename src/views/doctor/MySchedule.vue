<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex-between">
          <div class="title-box">
            <span>我的排班表</span>
            <el-tag type="info" class="ml-10">未来 7 天展示</el-tag>
          </div>
          <el-button :icon="Refresh" circle @click="initData" />
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%">
        <!-- 日期列 -->
        <el-table-column prop="workDate" label="出诊日期" min-width="120" sortable>
          <template #default="{ row }">
            <div class="date-cell">
              <el-icon><Calendar /></el-icon>
              <!-- 🔥 格式化日期 -->
              <span style="margin-left: 5px; font-weight: bold;">{{ formatDate(row.workDate) }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 时段列 -->
        <el-table-column prop="shiftType" label="时段" width="100">
          <template #default="{ row }">
            <el-tag :type="row.shiftType === 1 ? 'warning' : 'success'" effect="dark">
              {{ row.shiftType === 1 ? '上午' : '下午' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 号源使用情况 (进度条) -->
        <el-table-column label="号源使用率" min-width="200">
          <template #default="{ row }">
            <div class="quota-box">
              <el-progress
                  :percentage="calcPercentage(row)"
                  :status="getProgressStatus(row)"
                  :stroke-width="15"
                  text-inside
                  striped
                  striped-flow
              >
                <span>{{ row.bookedNum }} / {{ row.quota }}</span>
              </el-progress>
            </div>
          </template>
        </el-table-column>

        <!-- 挂号费 -->
        <el-table-column prop="price" label="挂号费" width="100">
          <template #default="{ row }">
            <span style="color: #F56C6C; font-weight: bold;">￥{{ row.price }}</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success" effect="plain">正常出诊</el-tag>
            <el-tag v-else type="danger" effect="plain">已停诊</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 🔥 新增：分页组件 -->
      <div style="margin-top: 20px; display: flex; justify-content: flex-end;">

        <el-pagination
            v-model:current-page="query.pageNum"
            v-model:page-size="query.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="initData"
            @current-change="initData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Calendar, Refresh } from '@element-plus/icons-vue'
import {
  ScheduleControllerService,
  DoctorControllerService,
  type ScheduleVO
} from '@/api/generated'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils/dateUtil' // 🔥 引入日期工具

const loading = ref(false)
const tableData = ref<ScheduleVO[]>([])
const total = ref(0) // 总条数
const currentDoctorId = ref<number | null>(null) // 缓存医生ID，不用每次都查

// 分页参数
const query = reactive({
  pageNum: 1,
  pageSize: 10
})

// 计算进度条百分比
const calcPercentage = (row: ScheduleVO) => {
  if (!row.quota || row.quota === 0) return 0
  const p = Math.floor(((row.bookedNum || 0) / row.quota) * 100)
  return p > 100 ? 100 : p
}

// 进度条颜色状态
const getProgressStatus = (row: ScheduleVO) => {
  const p = calcPercentage(row)
  if (p >= 100) return 'exception'
  if (p > 80) return 'warning'
  return 'success'
}

const initData = async () => {
  loading.value = true
  try {
    // 1. 先获取当前医生的ID (只在第一次加载时获取)
    if (!currentDoctorId.value) {
      const profileRes = await DoctorControllerService.getProfile()
      if (profileRes.code !== 0 || !profileRes.data) {
        ElMessage.warning('无法获取医生信息')
        return
      }
      currentDoctorId.value = profileRes.data.id!
    }

    // 2. 根据 doctorId 查排班
    const res = await ScheduleControllerService.listSchedules({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      doctorId: currentDoctorId.value
    })

    if (res.code === 0 && res.data) {
      tableData.value = res.data.records || []
      total.value = Number(res.data.total) || 0
      query.pageNum = Number(res.data.current) || 1
    }
  } catch (e) {
    ElMessage.error('加载排班失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-box {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}
.ml-10 { margin-left: 10px; }
.date-cell {
  display: flex;
  align-items: center;
  color: #606266;
}
.quota-box {
  padding-right: 20px;
}
</style>
