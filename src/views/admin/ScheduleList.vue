<template>
  <el-dialog
      :title="`排班管理 - ${doctorName}`"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      width="850px"
  >
    <!-- 1. 新增排班表单 (保持不变) -->
    <el-card class="mb-20" shadow="never">
      <el-form :inline="true" :model="form" @submit.prevent>
        <!-- ... 之前的 form-item ... -->
        <el-form-item label="日期" required>
          <el-date-picker v-model="form.workDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" :disabled-date="disabledDate" style="width: 150px"/>
        </el-form-item>
        <el-form-item label="时段" required>
          <el-select v-model="form.shiftType" placeholder="请选择" style="width: 100px;">
            <el-option label="上午" :value="1" />
            <el-option label="下午" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="号源" required>
          <el-input-number v-model="form.quota" :min="1" :max="100" style="width: 100px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="handleSubmit">添加</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 2. 已有排班列表 (新增操作列) -->
    <el-table :data="scheduleList" border stripe height="400" v-loading="loading">
      <el-table-column prop="workDate" label="日期" width="120" >
      <template #default="{ row }">
        <span>{{ formatDate(row.workDate) }}</span>
      </template>
      </el-table-column>
      <el-table-column prop="shiftType" label="时段" width="80">
        <template #default="{ row }">
          <el-tag :type="row.shiftType === 1 ? 'warning' : 'success'">{{ row.shiftType === 1 ? '上午' : '下午' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="号源情况" width="140">
        <template #default="{ row }">
          <!-- 支持直接点击修改号源 -->
          <el-popover placement="top" width="200" trigger="click">
            <template #reference>
              <el-button link type="primary">{{ row.bookedNum }} / {{ row.quota }} <el-icon><Edit /></el-icon></el-button>
            </template>
            <div style="text-align: center">
              <el-input-number v-model="tempQuota" :min="row.bookedNum" size="small" />
              <div style="margin-top: 10px">
                <el-button size="small" type="primary" @click="handleUpdateQuota(row)">保存</el-button>
              </div>
            </div>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <!-- 状态开关 -->
          <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="正常"
              inactive-text="停诊"
              inline-prompt
              @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="100">
        <template #default="{ row }">
          <el-popconfirm
              :title="row.bookedNum > 0 ? '已有挂号，无法删除！' : '确定删除该排班吗？'"
              @confirm="handleDelete(row)"
              :disabled="row.bookedNum > 0"
          >
            <template #reference>
              <el-button type="danger" size="small" :disabled="row.bookedNum > 0" :title="row.bookedNum > 0 ? '已有挂号不能删除': ''">
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ScheduleControllerService, type TSchedule } from '@/api/generated'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import {formatDate} from "../../utils/dateUtil.ts";

const props = defineProps<{ modelValue: boolean, doctorId: number, doctorName: string }>()
const emit = defineEmits(['update:modelValue', 'success'])

const loading = ref(false)
const scheduleList = ref<any[]>([])
const tempQuota = ref(30) // 临时存放修改号源的变量

const form = reactive({
  workDate: '',
  shiftType: 1,
  quota: 30
})

const disabledDate = (time: Date) => time.getTime() < Date.now() - 8.64e7

// 加载数据
const loadSchedules = async () => {
  loading.value = true
  try {
    const res = await ScheduleControllerService.listSchedules({
      pageNum: 1, pageSize: 50,
      doctorId: props.doctorId
    })
    scheduleList.value = res.data?.records || []
  } finally {
    loading.value = false
  }
}

// 新增排班
const handleSubmit = async () => {
  if (!form.workDate) { ElMessage.warning('请选择日期'); return }
  try {
    const params: any = {
      doctorId: props.doctorId,
      workDate: form.workDate,
      shiftType: form.shiftType,
      quota: form.quota
    }
    const res = await ScheduleControllerService.addSchedule(params)
    if (res.code === 0) {
      ElMessage.success('添加成功')
      loadSchedules()
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {
    ElMessage.error('添加失败')
  }
}

// 1. 删除排班
const handleDelete = async (row: any) => {
  try {
    // 记得重新生成API，确保有 deleteSchedule 方法
    await ScheduleControllerService.deleteSchedule({ id: row.id })
    ElMessage.success('删除成功')
    loadSchedules()
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败')
  }
}

// 2. 切换状态 (停诊/正常)
const handleStatusChange = async (row: any) => {
  try {
    await ScheduleControllerService.updateSchedule({
      id: row.id,
      status: row.status // switch 绑定的值已经变了，直接传过去
    })
    ElMessage.success('状态已更新')
  } catch (e) {
    // 失败要回滚 switch 状态
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('更新失败')
  }
}

// 3. 修改号源
const handleUpdateQuota = async (row: any) => {
  if(tempQuota.value < row.bookedNum) {
    ElMessage.warning('号源不能少于已挂号数')
    return
  }
  try {
    await ScheduleControllerService.updateSchedule({
      id: row.id,
      quota: tempQuota.value
    })
    ElMessage.success('号源已更新')
    // 这里的 popover 怎么自动关闭比较麻烦，简单处理就是刷新列表
    loadSchedules()
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

// 监听打开
watch(() => props.modelValue, (val) => {
  if (val) {
    loadSchedules()
  }
}, { immediate: true })
</script>

<style scoped>
.mb-20 { margin-bottom: 20px; }
</style>
