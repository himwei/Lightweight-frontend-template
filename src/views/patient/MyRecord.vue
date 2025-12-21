<template>
  <div class="page-container">
    <el-card shadow="never" header="我的挂号记录">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="createTime" label="下单时间" width="180" >
          <template #default="{ row }">
            <div><strong>{{ formatDateTime(row.createTime) }}</strong></div>
          </template>
        </el-table-column>

        <el-table-column label="就诊信息" min-width="200">
          <template #default="{ row }">
            <div><strong>{{ formatDate(row.workDate) }}</strong> {{ row.shiftType === 1 ? '上午' : '下午' }}</div>
            <div style="color: #666">{{ row.deptName }} - {{ row.doctorName }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="patientComplaint" label="病情自述" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="color: #606266;">{{ row.patientComplaint || '（未填写）' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="费用" width="100">
          <template #default="{ row }">￥{{ row.price }}</template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="diagnosis" label="医嘱/诊断" show-overflow-tooltip />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作/评价" min-width="220" fixed="right">
          <template #default="{ row }">

            <!-- 情况 A: 待就诊 (status=0) -> 允许取消 -->
            <el-popconfirm v-if="row.status === 0" title="确定取消预约？" @confirm="handleCancel(row)">
              <template #reference>
                <el-button type="danger" link size="small">取消预约</el-button>
              </template>
            </el-popconfirm>

            <!-- 情况 B: 已完成 (status=1) -->
            <div v-else-if="row.status === 1">
              <!-- 1. 尚未评价 -> 显示评价按钮 -->
              <el-button
                  v-if="!row.comment"
                  type="primary"
                  size="small"
                  plain
                  @click="openComment(row)"
              >
                填写评价
              </el-button>

              <!-- 2. 已经评价 -> 直接展示精简内容 -->
              <div v-else class="evaluated-box">
                <el-rate v-model="row.comment.score" disabled size="small" />
                <el-tooltip :content="row.comment.content" placement="top">
                  <div class="comment-text">{{ row.comment.content }}</div>
                </el-tooltip>
              </div>
            </div>

            <!-- 情况 C: 已取消 (status=2) -->
            <span v-else style="color: #999; font-size: 12px;">服务已终止</span>

          </template>
        </el-table-column>
      </el-table>

      <!-- ✅ 引入评价弹窗 -->
      <CommentDialog
          v-model="commentVisible"
          :reg-id="selectedRegId"
          @success="loadData"
      />

      <div class="pagination-bar">
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
import {ref, onMounted, reactive} from 'vue'
import {type DepartmentQueryDTO, RegistrationControllerService, type RegistrationVO} from '@/api/generated'
import { ElMessage } from 'element-plus'
import {formatDate, formatDateTime} from "../../utils/dateUtil.ts";
import CommentDialog from './CommentDialog.vue'

const loading = ref(false)
const tableData = ref<RegistrationVO[]>([])

const query = reactive<DepartmentQueryDTO>({
  pageNum: 1,
  pageSize: 10,
})
const total = ref(0)


// 字典映射
const getStatusType = (status: number) => {
  const map: Record<number, string> = { 0: 'primary', 1: 'success', 2: 'info' }
  return map[status]
}
const getStatusText = (status: number) => {
  const map: Record<number, string> = { 0: '已预约', 1: '已完成', 2: '已取消' }
  return map[status]
}


// ✅ 评价弹窗控制
const commentVisible = ref(false)
const selectedRegId = ref(0)

const openComment = (row: RegistrationVO) => {
  selectedRegId.value = row.id
  commentVisible.value = true
}


const loadData = async () => {
  loading.value = true
  const res = await RegistrationControllerService.getMyRegistrations(query)
  tableData.value = res.data?.records || []
  loading.value = false
  total.value = Number(res.data.total) || 0
}

const handleCancel = async (row: RegistrationVO) => {
  if (!row.id) return

  try {
    // 1. 调用后端取消接口 (参数传 id)
    await RegistrationControllerService.cancelRegistration({regId: row.id})

    // 2. 提示成功
    ElMessage.success('取消成功')

    // 3. 重新加载列表 (刷新状态)
    loadData()

  } catch (error: any) {
    // 全局拦截器通常会处理错误提示，这里可以留空或者打印日志
    console.error(error)
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.pagination-bar {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
