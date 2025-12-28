<template>
  <div class="page-container">
    <el-card shadow="never">
      <!-- 搜索栏 & 操作栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="query" class="demo-form-inline" @submit.prevent>
          <el-form-item label="科室名称">
            <el-input v-model="query.deptName" placeholder="请输入科室名称" clearable @keyup.enter="handleSearch" @clear="handleSearch" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button type="success" :icon="Plus" @click="handleAdd">新增科室</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="deptName" label="科室名称" min-width="120" />
        <el-table-column prop="deptCode" label="科室编码" width="120" />
        <el-table-column prop="location" label="位置" width="180" />
        <el-table-column prop="intro" label="介绍" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="120" >
          <template #default="{ row }">
            <div><strong>{{ formatDateTime(row.createTime) }}</strong></div>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="120" >
          <template #default="{ row }">
            <div><strong>{{ formatDateTime(row.updateTime) }}</strong></div>
          </template>
        </el-table-column>

        <!-- ✅ 新增操作列 -->
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定删除该科室吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- ✅ 新增/编辑 弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="科室名称" prop="deptName">
          <el-input v-model="formData.deptName" placeholder="如：心血管内科" />
        </el-form-item>
        <el-form-item label="科室编码" prop="deptCode">
          <el-input v-model="formData.deptCode" placeholder="如：CARDIO_01" />
        </el-form-item>
        <el-form-item label="诊室位置" prop="location">
          <el-input v-model="formData.location" placeholder="如：门诊楼 3层 301" />
        </el-form-item>
        <el-form-item label="介绍" prop="intro">
          <el-input v-model="formData.intro" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { DepartmentControllerService, type TDepartment, type DepartmentQueryDTO } from '@/api/generated'
import { ElMessage, type FormInstance } from 'element-plus'
import { formatDateTime } from "@/utils/dateUtil.ts"

// 基础数据
const loading = ref(false)
const tableData = ref<TDepartment[]>([])
const total = ref(0)

// 查询条件
const query = reactive<DepartmentQueryDTO>({
  pageNum: 1,
  pageSize: 10,
  deptName: ''
})

// 弹窗控制
const dialogVisible = ref(false)
const dialogTitle = ref('新增科室')
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<TDepartment>({
  id: undefined,
  deptName: '',
  deptCode: '',
  location: '',
  intro: ''
})

// 表单校验规则
const rules = {
  deptName: [{ required: true, message: '请输入科室名称', trigger: 'blur' }]
}

// 加载列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await DepartmentControllerService.getDepartmentList(query)
    if (res.code === 0 && res.data) {
      tableData.value = res.data.records || []
      total.value = Number(res.data.total) || 0
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  query.pageNum = 1
  loadData()
}

// --- 新增/编辑/删除 逻辑 ---

// 1. 打开新增
const handleAdd = () => {
  dialogTitle.value = '新增科室'
  resetForm()
  dialogVisible.value = true
}

// 2. 打开编辑
const handleEdit = (row: TDepartment) => {
  dialogTitle.value = '编辑科室'
  // 复制数据到表单 (Object.assign)
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 3. 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (formData.id) {
          // 这里 TS 会自动识别 updateDepartment 需要 DepartmentUpdateDTO
          await DepartmentControllerService.updateDepartment(formData)
          ElMessage.success('修改成功')
        } else {
          // 这里 TS 会自动识别 addDepartment 需要 DepartmentAddDTO
          await DepartmentControllerService.addDepartment(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadData()
      } finally {
        submitting.value = false
      }
    }
  })
}

// 4. 删除
const handleDelete = async (row: TDepartment) => {
  try {
    // 假设后端生成的接口叫 deleteDepartment，参数是 DeleteRequest { id }
    // 如果你还没生成，需要先去后端写好接口并生成前端代码
    await DepartmentControllerService.deleteDepartment({ id: row.id! })
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    console.error(e)
  }
}

// 重置表单
const resetForm = () => {
  formData.id = undefined
  formData.deptName = ''
  formData.deptCode = ''
  formData.location = ''
  formData.intro = ''
  // 清除校验红字
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.search-bar { margin-bottom: 20px; display: flex; justify-content: space-between;}
.pagination-bar { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
