<template>
  <div class="page-container">
    <el-card shadow="never">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="query" class="search-form" @submit.prevent>
        <el-form-item label="患者姓名">
          <el-input
              v-model="query.patientName"
              placeholder="搜索患者"
              clearable
              @keyup.enter="loadData"
              @clear="loadData"
          />
        </el-form-item>
        <el-form-item label="医生姓名">
          <el-input
              v-model="query.doctorName"
              placeholder="搜索医生"
              clearable
              @keyup.enter="loadData"
              @clear="loadData"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
              v-model="query.status"
              placeholder="全部状态"
              clearable
              style="width: 120px"
              @change="loadData"
              @clear="loadData"
          >
            <el-option label="待就诊" :value="0" />
            <el-option label="已完成" :value="1" />
            <el-option label="已取消" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column label="就诊信息" min-width="200">
          <template #default="{ row }">
            <div style="font-weight: bold; font-size: 15px;">{{ row.doctorName }}</div>
            <div style="font-size: 12px; color: #666;">
              <el-tag size="small" type="info" effect="plain" style="margin-right: 5px">{{ row.deptName }}</el-tag>
              {{ formatDate(row.workDate) }} ({{ row.shiftType === 1 ? '上午' : '下午' }})
            </div>
          </template>
        </el-table-column>

        <el-table-column label="患者信息" width="180">
          <template #default="{ row }">
            <div style="font-weight: 500">{{ row.patientName }}</div>
            <div style="font-size: 12px; color: #909399;">
              <el-icon style="vertical-align: middle"><Iphone /></el-icon>
              {{ row.patientPhone || '-' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="price" label="挂号费" width="100">
          <template #default="{ row }">
            <span style="color: #F56C6C;">￥{{ row.price }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="挂号时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <!-- 仅待就诊状态可以取消 -->
            <el-popconfirm
                v-if="row.status === 0"
                title="确定强制取消该挂号吗？号源将自动恢复。"
                confirm-button-text="确认退号"
                cancel-button-text="取消"
                confirm-button-type="danger"
                @confirm="handleCancel(row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">强制退号</el-button>
              </template>
            </el-popconfirm>
            <span v-else style="color: #c0c4cc; font-size: 12px;">不可操作</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="margin-top: 20px; text-align: right">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Iphone } from '@element-plus/icons-vue'
import {
  RegistrationControllerService,
  type RegistrationVO,
  type RegistrationQueryDTO // ✅ 引入新生成的 DTO
} from '@/api/generated'
import { formatDate, formatDateTime } from '@/utils/dateUtil'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref<RegistrationVO[]>([])
const total = ref(0)

// ✅ 使用强类型 RegistrationQueryDTO
const query = reactive<RegistrationQueryDTO>({
  pageNum: 1,
  pageSize: 10,
  patientName: '',
  doctorName: '',
  status: undefined
})

// 状态字典
const getStatusType = (status: number) => {
  const map: Record<number, string> = { 0: 'primary', 1: 'success', 2: 'info' }
  return map[status] || 'info'
}
const getStatusText = (status: number) => {
  const map: Record<number, string> = { 0: '待就诊', 1: '已完成', 2: '已取消' }
  return map[status] || '未知'
}

const loadData = async () => {
  loading.value = true
  try {
    // ✅ 调用生成的管理员专属接口 pageRegistrationsByAdmin
    const res = await RegistrationControllerService.pageRegistrationsByAdmin(query)
    if (res.code === 0 && res.data) {
      tableData.value = res.data.records || []
      total.value = Number(res.data.total) || 0
    }
  } catch (e) {
    // 错误一般由拦截器处理
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  query.patientName = ''
  query.doctorName = ''
  query.status = undefined
  // 重置后重新查询
  loadData()
}

const handleCancel = async (row: RegistrationVO) => {
  if (!row.id) return
  try {
    // ✅ 调用生成的管理员强制退号接口 cancelByAdmin
    const res = await RegistrationControllerService.cancelByAdmin({ regId: row.id })

    if (res.code === 0) {
      ElMessage.success('强制退号成功')
      loadData() // 刷新列表
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (e) {
    // error
  }
}

onMounted(() => {
  loadData()
})
</script>
