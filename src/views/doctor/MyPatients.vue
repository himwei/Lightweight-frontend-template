<template>
  <div class="page-container">
    <el-card shadow="never" class="patients-card">
      <!-- 顶部状态切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs">
        <el-tab-pane name="today">
          <template #label>
            <span class="tab-label">
              <el-icon><Calendar /></el-icon> 今日接诊
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="future">
          <template #label>
            <span class="tab-label">
              <el-icon><Timer /></el-icon> 未来预约
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="history">
          <template #label>
            <span class="tab-label">
              <el-icon><Collection /></el-icon> 历史记录
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 搜索/刷新栏 -->
      <div class="action-bar">
        <div class="tip-text">
          <el-tag v-if="activeTab === 'today'" type="success" effect="dark">当前共有 {{ total }} 位患者待诊</el-tag>
          <span v-else-if="activeTab === 'future'" style="color: #909399; font-size: 13px;">查看未来预约，提前了解病患详情</span>
        </div>
        <el-button :icon="Refresh" circle @click="loadData" />
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="workDate" label="就诊时间" width="150">
          <template #default="{ row }">
            <div :class="{ 'is-today': activeTab === 'today' }">
              <strong>{{ formatDate(row.workDate) }}</strong>
              <div style="font-size: 12px; color: #999;">{{ row.shiftType === 1 ? '上午' : '下午' }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="patientName" label="患者姓名" width="120" />
        <el-table-column prop="patientPhone" label="手机号" width="130" />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="diagnosis" label="诊断结果" show-overflow-tooltip />

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <!-- 仅在“今日”标签且“待就诊”状态时，按钮才可用 -->
            <el-button
                v-if="activeTab === 'today'"
                type="primary"
                size="small"
                :disabled="row.status !== 0"
                @click="openDiagnosis(row)"
            >
              接诊
            </el-button>
            <el-button
                v-else
                type="info"
                size="small"
                plain
                @click="viewDetail(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar">
        <el-pagination
            v-model:current-page="query.pageNum"
            v-model:page-size="query.pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 接诊对话框 (原有逻辑) -->
    <!-- ... -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Refresh, Calendar, Timer, Collection } from '@element-plus/icons-vue'
import { RegistrationControllerService } from '@/api/generated'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils/dateUtil'
import dayjs from 'dayjs'

const activeTab = ref('today')
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  startDate: '', // 传给后端的过滤条件
  endDate: ''
})

// 根据 Tab 切换计算日期范围
const handleTabChange = () => {
  query.pageNum = 1
  const today = dayjs().format('YYYY-MM-DD')

  if (activeTab.value === 'today') {
    query.startDate = today
    query.endDate = today
  } else if (activeTab.value === 'history') {
    query.startDate = '' // 不设限
    query.endDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  } else if (activeTab.value === 'future') {
    query.startDate = dayjs().add(1, 'day').format('YYYY-MM-DD')
    query.endDate = '' // 不设限
  }
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    // 🔥 注意：这里假设你后端接口已经升级，可以接收带 startDate/endDate 的对象
    // 如果还没升，你得传 query。如果后端还是 PageDTO，这些参数会被忽略。
    const res = await RegistrationControllerService.getMyRegistrations(query as any)
    if (res.code === 0 && res.data) {
      tableData.value = res.data.records || []
      total.value = Number(res.data.total) || 0
    }
  } finally {
    loading.value = false
  }
}

const getStatusType = (s: number) => ['primary', 'success', 'info'][s] || 'info'
const getStatusText = (s: number) => ['待就诊', '已完成', '已取消'][s] || '未知'

const viewDetail = (row: any) => {
  // 可以弹窗展示详细病历，或者只是提示
  ElMessage.info(`查看患者: ${row.patientName} 的历史信息`)
}

// 初始化默认加载今日
onMounted(() => {
  handleTabChange()
})
</script>

<style scoped>
.patients-card { border-top: 3px solid #409EFF; }
.tab-label { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; }
.action-bar { display: flex; justify-content: space-between; align-items: center; margin: 15px 0; }
.is-today { color: #409EFF; }
.pagination-bar { margin-top: 20px; display: flex; justify-content: flex-end; }
.custom-tabs :deep(.el-tabs__item) { height: 50px; }
</style>
