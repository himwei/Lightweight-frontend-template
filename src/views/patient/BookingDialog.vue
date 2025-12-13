<template>
  <el-dialog
      :title="`预约挂号 - ${doctorName}`"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      width="600px"
  >
    <el-alert title="请选择合适的就诊时段" type="info" show-icon :closable="false" class="mb-20"/>

    <el-table :data="scheduleList" v-loading="loading" border stripe>
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
      <el-table-column label="号源情况">
        <template #default="{ row }">
          <span v-if="row.bookedNum >= row.quota" style="color: red">已满</span>
          <span v-else style="color: green">余号 {{ row.quota - row.bookedNum }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="挂号费">
        <template #default="{ row }">￥{{ row.price }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
              type="primary"
              size="small"
              :disabled="row.bookedNum >= row.quota"
              @click="handleBooking(row)"
          >
            预约
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ScheduleControllerService, RegistrationControllerService, type ScheduleVO } from '@/api/generated'
import { ElMessage, ElMessageBox } from 'element-plus'
import {formatDate} from "@/utils/dateUtil.ts";

const props = defineProps<{ modelValue: boolean, doctorId: number, doctorName: string }>()
const emit = defineEmits(['update:modelValue', 'success'])

const loading = ref(false)
const scheduleList = ref<ScheduleVO[]>([])

// 加载该医生的可用排班
const loadSchedules = async () => {
  loading.value = true
  try {
    const res = await ScheduleControllerService.listSchedules({
      pageNum: 1, pageSize: 50,
      doctorId: props.doctorId,
      status: 1 // 只查正常出诊的
    })
    scheduleList.value = res.data?.records || []
  } finally {
    loading.value = false
  }
}

// 提交挂号
const handleBooking = (row: ScheduleVO) => {
  ElMessageBox.confirm(
      `确认预约 [${formatDate(row.workDate)} ${row.shiftType === 1 ? '上午' : '下午'}] 的号吗？`,
      '挂号确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      const res = await RegistrationControllerService.submitRegistration({ scheduleId: row.id })
      if (res.code === 0) {
        ElMessage.success('预约成功！请准时就诊')
        emit('success')
        emit('update:modelValue', false) // 关闭弹窗
      } else {
        ElMessage.error(res.message || '预约失败')
      }
    } catch (e) {
      ElMessage.error('系统错误')
    }
  })
}

watch(() => props.modelValue, (val) => {
  if (val) loadSchedules()
})
</script>

<style scoped>
.mb-20 { margin-bottom: 20px; }
</style>
