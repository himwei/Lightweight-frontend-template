<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex-between">
          <span>我的接诊列表</span>
          <el-button :icon="Refresh" circle @click="handleSearch" />
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="workDate" label="就诊日期" width="120" sortable>
          <template #default="{ row }">
            <!-- 这里的 row.workDate 就是那个很长的时间字符串 -->
            {{ formatDate(row.workDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="shiftType" label="时段" width="80">
          <template #default="{ row }">
            <el-tag :type="row.shiftType === 1 ? 'warning' : 'success'">
              {{ row.shiftType === 1 ? '上午' : '下午' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="patientName" label="患者姓名" width="120" />
        <el-table-column prop="patientPhone" label="手机号" width="150" />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'primary'">
              {{ row.status === 1 ? '已就诊' : '待就诊' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="diagnosis" label="诊断结果" show-overflow-tooltip />

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
                type="primary"
                size="small"
                :disabled="row.status !== 0"
                @click="openDiagnosis(row)"
            >
              接诊
            </el-button>
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
            @size-change="loadData"
            @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 诊断弹窗 -->
    <el-dialog title="填写病历" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-position="top">
        <el-form-item label="患者信息">
          <el-tag>{{ currentPatientName }}</el-tag>
        </el-form-item>
        <el-form-item label="诊断结果/医嘱" required>
          <el-input
              v-model="form.diagnosis"
              type="textarea"
              rows="4"
              placeholder="请输入病情诊断及用药建议..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交并完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { RegistrationControllerService, type RegistrationVO } from '@/api/generated'
import { ElMessage } from 'element-plus'
// 引入工具函数
import { formatDate } from '@/utils/dateUtil'

const loading = ref(false)
const tableData = ref<RegistrationVO[]>([])
const total = ref(0) // 总条数

// 🔥 新增：查询参数 (对应后端的 PageDTO)
const query = reactive({
  pageNum: 1,
  pageSize: 10
})

const dialogVisible = ref(false)
const currentPatientName = ref('')
const form = reactive({ regId: 0, diagnosis: '' })

const loadData = async () => {
  loading.value = true
  try {
    // 🔥 修复：必须传入 query 参数！
    const res = await RegistrationControllerService.getMyRegistrations(query)

    if (res.code === 0 && res.data) {
      tableData.value = res.data.records || []
      total.value = Number(res.data.total) || 0
      query.pageNum = Number(res.data.current) || 1
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch (e) {
    ElMessage.error('加载数据出错')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  query.pageNum = 1
  loadData()
}

const openDiagnosis = (row: RegistrationVO) => {
  form.regId = row.id!
  form.diagnosis = ''
  currentPatientName.value = row.patientName || '未知'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.diagnosis) return ElMessage.warning('请填写诊断内容')

  try {
    const res = await RegistrationControllerService.diagnosis(form)
    if (res.code === 0) {
      ElMessage.success('接诊完成')
      dialogVisible.value = false
      loadData() // 刷新列表
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.flex-between { display: flex; justify-content: space-between; align-items: center; }
</style>
