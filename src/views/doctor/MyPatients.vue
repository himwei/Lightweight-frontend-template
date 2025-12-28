<template>
  <div class="page-container">
    <el-card shadow="never" class="patients-card">
      <!-- ... 顶部的 Tabs 和 Action Bar 保持不变 ... -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs">
        <el-tab-pane name="today" label="今日接诊" />
        <el-tab-pane name="future" label="未来预约" />
        <el-tab-pane name="history" label="历史记录" />
      </el-tabs>

      <div class="action-bar">
        <div class="tip-text">
          <el-tag v-if="activeTab === 'today'" type="success" effect="dark">当前共有 {{ total }} 位患者待诊</el-tag>
          <span v-else style="color: #909399; font-size: 13px;">切换标签查看不同时段的就诊情况</span>
        </div>
        <el-button :icon="Refresh" circle @click="loadData" />
      </div>

      <!-- 表格部分 (保持你刚才发的逻辑) -->
      <el-table :data="tableData" v-loading="loading" border stripe>
        <!-- ... 原有列 ... -->
        <el-table-column prop="workDate" label="就诊时间" width="150">
          <template #default="{ row }">
            <strong>{{ formatDate(row.workDate) }}</strong>
            <div style="font-size: 12px; color: #999;">{{ row.shiftType === 1 ? '上午' : '下午' }}</div>
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

      <!-- 分页 (保持不变) -->
      <div class="pagination-bar">
        <el-pagination v-model:current-page="query.pageNum" :total="total" @current-change="loadData" />
      </div>
    </el-card>

    <!-- ✅ 重点：补全接诊/详情对话框 -->
    <el-dialog
        :title="isViewMode ? '就诊详情' : '填写病历'"
        v-model="dialogVisible"
        width="500px"
    >
      <el-form :model="form" label-position="top">
        <!-- 患者核心信息 -->
        <el-descriptions :column="2" border size="small" class="mb-20">
          <el-descriptions-item label="患者姓名">{{ currentPatient.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentPatient.phone }}</el-descriptions-item>
        </el-descriptions>

        <!-- ✅ 新增：展示患者挂号时的自述 -->
        <el-form-item label="患者自述">
          <div class="complaint-box">
            {{ currentPatient.complaint || '（该患者未填写自述）' }}
          </div>
        </el-form-item>

        <el-form-item label="诊断结果 / 医嘱" required>
          <el-input
              v-model="form.diagnosis"
              type="textarea"
              :rows="5"
              :readonly="isViewMode"
              :placeholder="isViewMode ? '未录入诊断' : '请输入详细的诊断结果和用药建议...'"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ isViewMode ? '关闭' : '取消' }}</el-button>
        <el-button
            v-if="!isViewMode"
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
        >
          提交并完成
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Refresh, Calendar, Timer, Collection } from '@element-plus/icons-vue'
import { RegistrationControllerService, type RegistrationVO } from '@/api/generated'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils/dateUtil'
import dayjs from 'dayjs'

// --- 基础状态 ---
const activeTab = ref('today')
const loading = ref(false)
const tableData = ref<RegistrationVO[]>([])
const total = ref(0)
const query = reactive({ pageNum: 1, pageSize: 10, startDate: '', endDate: '' })

// --- 弹窗状态 ---
const dialogVisible = ref(false)
const isViewMode = ref(false)
const submitting = ref(false)
const form = reactive({ regId: 0, diagnosis: '' })

// 存储当前选中的患者展示信息
const currentPatient = reactive({
  name: '',
  phone: '',
  complaint: ''
})

const handleTabChange = () => {
  query.pageNum = 1
  const today = dayjs().format('YYYY-MM-DD')
  if (activeTab.value === 'today') {
    query.startDate = today; query.endDate = today
  } else if (activeTab.value === 'history') {
    query.startDate = ''; query.endDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  } else if (activeTab.value === 'future') {
    query.startDate = dayjs().add(1, 'day').format('YYYY-MM-DD'); query.endDate = ''
  }
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await RegistrationControllerService.getMyRegistrations(query)
    if (res.code === 0 && res.data) {
      tableData.value = res.data.records || []
      total.value = Number(res.data.total) || 0
    }
  } finally { loading.value = false }
}

// ✅ 核心逻辑：设置弹窗回显数据
const setPatientInfo = (row: RegistrationVO) => {
  currentPatient.name = row.patientName || '未知'
  currentPatient.phone = row.patientPhone || '-'
  currentPatient.complaint = row.patientComplaint || '' // 来自后端新加字段
}

const openDiagnosis = (row: RegistrationVO) => {
  isViewMode.value = false
  form.regId = row.id!
  form.diagnosis = ''
  setPatientInfo(row)
  dialogVisible.value = true
}

const viewDetail = (row: RegistrationVO) => {
  isViewMode.value = true
  form.regId = row.id!
  form.diagnosis = row.diagnosis || ''
  setPatientInfo(row)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.diagnosis) return ElMessage.warning('请填写诊断内容')
  submitting.value = true
  try {
    const res = await RegistrationControllerService.diagnosis(form)
    if (res.code === 0) {
      ElMessage.success('接诊处理完成')
      dialogVisible.value = false
      loadData()
    }
  } finally { submitting.value = false }
}

const getStatusType = (s: number) => ['primary', 'success', 'info'][s] || 'info'
const getStatusText = (s: number) => ['待就诊', '已完成', '已取消'][s] || '未知'

onMounted(() => handleTabChange())
</script>

<style scoped>
/* ... 保持原有样式 ... */
.patients-card { border-top: 3px solid #409EFF; }
.tab-label { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; }
.action-bar { display: flex; justify-content: space-between; align-items: center; margin: 15px 0; }
.pagination-bar { margin-top: 20px; display: flex; justify-content: flex-end; }
.mb-20 { margin-bottom: 20px; }

/* ✅ 自述框样式：稍微突出一点，用柔和的背景色 */
.complaint-box {
  background-color: #fdf6ec;
  border-left: 4px solid #e6a23c;
  padding: 12px;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
  border-radius: 4px;
}
</style>
