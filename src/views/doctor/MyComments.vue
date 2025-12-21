<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="header-box">
          <span>患者评价反馈</span>
          <el-button :icon="Refresh" circle @click="loadData" />
        </div>
      </template>

      <!-- 评价统计概览 (轻量化展示) -->
      <div class="stats-overview" v-if="tableData.length > 0">
        <el-statistic title="收到评价数" :value="total" />
        <el-statistic title="平均分" :value="avgScore" :precision="1">
          <template #suffix>
            <el-icon style="vertical-align: -2px; color: #E6A23C"><StarFilled /></el-icon>
          </template>
        </el-statistic>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="margin-top: 20px">

        <!-- ✅ 展开行：展示当时的诊疗信息 -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="diagnosis-detail">
              <h4>📋 诊疗回顾</h4>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="就诊日期">
                  {{ formatDate(row.workDate) }} {{ row.shiftType === 1 ? '上午' : '下午' }}
                </el-descriptions-item>
                <el-descriptions-item label="患者姓名">
                  {{ row.patientName }}
                </el-descriptions-item>
                <el-descriptions-item label="诊断结果" :span="2">
                  <div class="diagnosis-text">{{ row.diagnosis || '（未录入诊断）' }}</div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>


        <el-table-column prop="createTime" label="评价时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="patientName" label="患者" width="120">
          <template #default="{ row }">
            {{ row.patientName || '匿名患者' }}
          </template>
        </el-table-column>

        <el-table-column prop="score" label="评分" width="160">
          <template #default="{ row }">
            <el-rate v-model="row.score" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>

        <el-table-column prop="content" label="评价内容" min-width="250">
          <template #default="{ row }">
            <div class="comment-content">{{ row.content }}</div>
          </template>
        </el-table-column>
      </el-table>

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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { CommentControllerService, type CommentVO } from '@/api/generated'
import { Refresh, StarFilled } from '@element-plus/icons-vue'
import {formatDate, formatDateTime} from '@/utils/dateUtil'

const loading = ref(false)
const tableData = ref<CommentVO[]>([])
const total = ref(0)
const query = reactive({ pageNum: 1, pageSize: 10 })

// 计算平均分 (仅针对当前页，演示用。生产环境建议后端返回总平均分)
const avgScore = computed(() => {
  if (tableData.value.length === 0) return 0
  const sum = tableData.value.reduce((acc, cur) => acc + (cur.score || 0), 0)
  return sum / tableData.value.length
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await CommentControllerService.getMyComments(query)
    if (res.code === 0 && res.data) {
      tableData.value = res.data.records || []
      total.value = Number(res.data.total) || 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.header-box { display: flex; justify-content: space-between; align-items: center; }
.stats-overview {
  display: flex; gap: 50px; padding: 20px;
  background: #fdfaf5; border-radius: 8px; border: 1px solid #faecd8;
}
.comment-content { line-height: 1.6; color: #444; }
.pagination-bar { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
