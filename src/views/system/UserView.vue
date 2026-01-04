<template>
  <div class="page-container">
    <el-card shadow="never">
      <!-- 1. 搜索栏 -->
      <el-form :inline="true" :model="query" class="search-form" @submit.prevent>
        <el-form-item label="关键词">
          <el-input
              v-model="query.keyword"
              placeholder="账号/昵称/手机号"
              clearable
              @keyup.enter="loadData"
              @clear="loadData"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button type="success" @click="handleAdd">新增用户</el-button>
        </el-form-item>
      </el-form>

      <!-- 2. 用户表格 -->
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="180" show-overflow-tooltip />

        <el-table-column label="头像" width="70" align="center">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
          </template>
        </el-table-column>

        <el-table-column prop="userName" label="账号" width="120" />
        <el-table-column prop="nickName" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />

        <el-table-column label="角色" min-width="150">
          <template #default="{ row }">
            <!-- 假设后端返回了 roleNames 数组，如果没有暂时不显示 -->
            <el-tag v-for="role in row.roleNames" :key="role" size="small" style="margin-right: 5px">
              {{ role }}
            </el-tag>
            <!-- 兜底显示 -->
            <span v-if="!row.roleNames?.length" style="color: #999; font-size: 12px">暂无角色</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <!-- 简单的状态展示，如果要做封号功能可以用 switch -->
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="注册时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" :disabled="row.id === userStore.userInfo?.id" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" size="small" :disabled="row.id === userStore.userInfo?.id" @click="handleResetPwd(row)">重置密码</el-button>
            <el-popconfirm title="确认删除该用户？无法恢复！" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" size="small" :disabled="row.id === userStore.userInfo?.id">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 3. 分页 -->
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

    <!-- 4. 新增/编辑弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑用户' : '新增用户'"
        width="500px"
        @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="账号" prop="userName">
          <el-input v-model="formData.userName" :disabled="isEdit" placeholder="登录账号" />
        </el-form-item>

        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="formData.nickName" placeholder="显示名称" />
        </el-form-item>

        <div v-if="!isEdit">
          <el-form-item label="密码" prop="passWord">
            <el-input v-model="formData.passWord" show-password placeholder="初始密码" />
          </el-form-item>
        </div>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="formData.roleIds" placeholder="请选择角色">
            <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.roleName"
                :value="role.id!"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status" v-if="isEdit">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { UserControllerService, RoleControllerService, type UserVO, type UserQueryDTO, type SysRole } from '@/api/generated'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime } from "@/utils/dateUtil.ts"
import { useUserStore } from '@/stores/user'

const loading = ref(false)
const tableData = ref<UserVO[]>([])
const total = ref(0)
const query = reactive({ pageNum: 1, pageSize: 10, keyword: '' })
const roleList = ref<SysRole[]>([])
const userStore = useUserStore()

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const formData = reactive({
  id: undefined as number | undefined,
  userName: '',
  nickName: '',
  passWord: '',
  phone: '',
  email: '',
  status: 1,
  roleIds: undefined as number | undefined
})

const rules = {
  userName: [{ required: true, message: '必填', trigger: 'blur' }],
  nickName: [{ required: true, message: '必填', trigger: 'blur' }],
  passWord: [{ required: true, message: '必填', trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await UserControllerService.pageUsers(query)
    tableData.value = res.data?.records || []
    total.value = Number(res.data?.total) || 0
  } finally {
    loading.value = false
  }
}

// 加载角色列表
const loadRoles = async () => {
  try {
    const res = await RoleControllerService.listRoles()
    roleList.value = res.data || []
  } catch (e) {
    console.error('加载角色列表失败', e)
  }
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: UserVO) => {
  isEdit.value = true
  resetForm()
  formData.id = row.id
  formData.userName = row.userName
  formData.nickName = row.nickName
  formData.phone = row.phone || ''
  formData.email = row.email || ''
  formData.status = row.status || 1
  if (row.roleNames && row.roleNames.length > 0) {
    const matchedRole = roleList.value.find(r => r.roleName === row.roleNames[0])
    formData.roleIds = matchedRole?.id
  }
  dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        const submitData = {
          ...formData,
          roleIds: formData.roleIds ? [formData.roleIds] : undefined
        }
        if (isEdit.value) {
          await UserControllerService.updateUser(submitData)
          ElMessage.success('更新成功')
        } else {
          await UserControllerService.addUser(submitData)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (e) {
        // 错误处理
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除
const handleDelete = async (row: UserVO) => {
  try {
    await UserControllerService.deleteUser(row.id!)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

// 重置密码
const handleResetPwd = (row: UserVO) => {
  ElMessageBox.confirm(`确定将用户 [${row.nickName}] 的密码重置为 123456 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await UserControllerService.resetPwd({ id: row.id })
    ElMessage.success('重置成功')
  })
}

const resetForm = () => {
  formData.id = undefined
  formData.userName = ''
  formData.nickName = ''
  formData.passWord = ''
  formData.phone = ''
  formData.email = ''
  formData.status = 1
  formData.roleIds = undefined
  nextTick(() => formRef.value?.clearValidate())
}

onMounted(() => {
  loadData()
  loadRoles()
})
</script>
