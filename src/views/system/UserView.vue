<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between;">
        <span>用户列表</span>
        <el-button type="primary">新增用户</el-button>
      </div>
    </template>
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="180" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UserControllerService, type UserVO } from '@/api/generated'

const tableData = ref<UserVO[]>([])

onMounted(async () => {
  const res = await UserControllerService.pageUsers({
    pageNum: 1,
    pageSize: 10
  })
  if (res.code === 0 && res.data?.records) {
    tableData.value = res.data.records
  }
})
</script>
