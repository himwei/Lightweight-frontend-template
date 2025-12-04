<template>
  <div class="page-container">
    <el-card shadow="never">
      <!-- 1. 顶部搜索与操作栏 -->
      <el-form :inline="true" :model="query" class="search-form" @submit.prevent>
        <el-form-item label="关键词">
          <el-input
              v-model="query.keyword"
              placeholder="医生姓名/简介"
              clearable
              @keyup.enter="loadData"
              @clear="loadData"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button type="success" @click="handleAdd">新增医生</el-button>
        </el-form-item>
      </el-form>

      <!-- 2. 主表格：医生列表 -->
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="doctorName" label="姓名" width="120" />
        <el-table-column prop="deptName" label="所属科室" width="150" />
        <el-table-column prop="title" label="职称" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.title }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="挂号费" width="100">
          <template #default="{ row }">￥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="intro" label="简介" show-overflow-tooltip />

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="warning" size="small" @click="handleSchedule(row)">
              排班
            </el-button>
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="margin-top: 20px; text-align: right">
        <el-pagination
            v-model:current-page="query.pageNum"
            v-model:page-size="query.pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @change="loadData"
        />
      </div>
    </el-card>

    <!-- 3. 弹窗 A: 排班管理 -->
    <ScheduleListDialog
        v-if="scheduleDialogVisible"
        v-model="scheduleDialogVisible"
        :doctor-id="currentDoctorId"
        :doctor-name="currentDoctorName"
    />

    <!-- 4. 弹窗 B: 新增/编辑医生 -->
    <el-dialog
        v-model="formDialogVisible"
        :title="formType === 'add' ? '新增医生' : '编辑档案'"
        width="500px"
        @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">

        <!-- 仅新增时显示账号密码 -->
        <div v-if="formType === 'add'">
          <el-alert title="初始账号设置" type="info" :closable="false" class="mb-20" />
          <el-form-item label="用户名" prop="username">
            <el-input v-model="formData.username" placeholder="登录账号" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="formData.password" type="password" show-password placeholder="登录密码" />
          </el-form-item>
          <el-form-item label="姓名" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="真实姓名" />
          </el-form-item>
          <el-divider />
        </div>

        <!-- 编辑时也显示姓名修改 -->
        <el-form-item label="姓名" prop="nickname" v-if="formType === 'edit'">
          <el-input v-model="formData.nickname" />
        </el-form-item>

        <!-- ✅ 修改点：改为下拉选择科室 -->
        <el-form-item label="所属科室" prop="deptId">
          <el-select
              v-model="formData.deptId"
              placeholder="请选择科室"
              style="width: 100%"
              filterable
          >
            <el-option
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.deptName"
                :value="dept.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="职称" prop="title">
          <el-select v-model="formData.title" style="width: 100%">
            <el-option value="主任医师" label="主任医师" />
            <el-option value="副主任医师" label="副主任医师" />
            <el-option value="主治医师" label="主治医师" />
            <el-option value="住院医师" label="住院医师" />
          </el-select>
        </el-form-item>

        <el-form-item label="挂号费" prop="price">
          <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>

        <el-form-item label="简介" prop="intro">
          <el-input v-model="formData.intro" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import {
  DoctorControllerService,
  DepartmentControllerService, // ✅ 引入科室服务
  type DoctorVO,
  type TDepartment // ✅ 引入科室类型
} from '@/api/generated'
import { ElMessage } from 'element-plus'
import ScheduleListDialog from './ScheduleList.vue'

// --- 基础数据 ---
const loading = ref(false)
const tableData = ref<DoctorVO[]>([])
const total = ref(0)
const query = reactive({ pageNum: 1, pageSize: 10, keyword: '' })

// ✅ 新增：科室列表数据
const deptList = ref<TDepartment[]>([])

// --- 排班弹窗状态 ---
const scheduleDialogVisible = ref(false)
const currentDoctorId = ref(0)
const currentDoctorName = ref('')

// --- 医生表单状态 ---
const formDialogVisible = ref(false)
const formType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref()

const formData = reactive({
  id: undefined as number | undefined,
  username: '',
  password: '',
  nickname: '',
  deptId: undefined as number | undefined, // 初始为空
  title: '',
  price: 0,
  intro: ''
})

const rules = {
  username: [{ required: true, message: '必填', trigger: 'blur' }],
  password: [{ required: true, message: '必填', trigger: 'blur' }],
  nickname: [{ required: true, message: '必填', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择科室', trigger: 'change' }],
  title: [{ required: true, message: '请选择职称', trigger: 'change' }],
  price: [{ required: true, message: '必填', trigger: 'blur' }]
}

// --- 方法 ---

const loadData = async () => {
  loading.value = true
  try {
    const res = await DoctorControllerService.listDoctors(query)
    tableData.value = res.data?.records || []
    total.value = Number(res.data?.total) || 0
  } finally {
    loading.value = false
  }
}

// ✅ 新增：加载科室下拉选项
const loadDeptOptions = async () => {
  try {
    // pageNum: 1, pageSize: 100 (确保能拉取所有科室)
    const res = await DepartmentControllerService.getDepartmentList({ pageNum: 1, pageSize: 100 })
    deptList.value = res.data?.records || []
  } catch (e) {
    console.error('加载科室失败', e)
  }
}

const handleSchedule = (row: DoctorVO) => {
  currentDoctorId.value = Number(row.id)
  currentDoctorName.value = row.doctorName || ''
  scheduleDialogVisible.value = true
}

const handleAdd = () => {
  formType.value = 'add'
  resetForm()
  formDialogVisible.value = true
}

const handleEdit = (row: DoctorVO) => {
  formType.value = 'edit'
  resetForm()
  formData.id = Number(row.id)
  formData.nickname = row.doctorName || ''

  // 这里的 deptName 是显示的，但 form 需要 deptId
  // 如果后端 DoctorVO 没返回 deptId，这里可能回显失败
  // 建议去检查后端的 DoctorMapper.xml 确保 select 出来 dept_id
  // 假设现在 VO 里有 deptId 字段 (如果没有TS可能会报错，可以先强转 any)
  formData.deptId = (row as any).deptId

  formData.title = row.title || ''
  formData.price = Number(row.price)
  formData.intro = row.intro || ''

  formDialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        if (formType.value === 'add') {
          await DoctorControllerService.addDoctor(formData)
          ElMessage.success('新增成功')
        } else {
          await DoctorControllerService.updateDoctor({
            id: formData.id,
            nickname: formData.nickname,
            deptId: formData.deptId,
            title: formData.title,
            price: formData.price,
            intro: formData.intro
          })
          ElMessage.success('修改成功')
        }
        formDialogVisible.value = false
        loadData()
      } catch (e) {
        // 错误提示
      } finally {
        submitting.value = false
      }
    }
  })
}

const resetForm = () => {
  formData.id = undefined
  formData.username = ''
  formData.password = ''
  formData.nickname = ''
  formData.deptId = undefined
  formData.title = ''
  formData.price = 0
  formData.intro = ''
  nextTick(() => formRef.value?.clearValidate())
}

onMounted(() => {
  loadData()
  loadDeptOptions() // ✅ 初始化时加载科室
})
</script>

<style scoped>
.mb-20 { margin-bottom: 20px; }
</style>
