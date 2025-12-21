<template>
  <el-dialog
      title="医生服务评价"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      width="420px"
      destroy-on-close
  >
    <el-form :model="form" label-position="top" ref="formRef" :rules="rules">
      <el-form-item label="评分" prop="score">
        <el-rate
            v-model="form.score"
            show-text
            :texts="['极差', '失望', '一般', '满意', '非常惊喜']"
        />
      </el-form-item>

      <el-form-item label="评价内容" prop="content">
        <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请简要描述您的就诊感受，这对医生非常重要..."
            maxlength="200"
            show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          提交评价
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { CommentControllerService, type CommentAddDTO } from '@/api/generated'
import { ElMessage, type FormInstance } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  regId: number // 关联的挂号ID
}>()

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 初始化表单数据
const form = reactive<CommentAddDTO>({
  regId: 0,
  score: 5, // 默认5星
  content: ''
})

const rules = {
  score: [{ required: true, message: '请打分', trigger: 'change' }],
  content: [
    { required: true, message: '请填写评价内容', trigger: 'blur' },
    { min: 5, message: '评价内容至少5个字', trigger: 'blur' }
  ]
}

// 监听 regId 变化，确保同步
watch(() => props.regId, (newVal) => {
  form.regId = newVal
}, { immediate: true })

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await CommentControllerService.addComment(form)
        if (res.code === 0) {
          ElMessage.success('评价提交成功')
          emit('success') // 通知父组件刷新列表
          emit('update:modelValue', false) // 关闭弹窗
          resetForm()
        } else {
          ElMessage.error(res.message || '评价失败')
        }
      } catch (e) {
        console.error(e)
      } finally {
        submitting.value = false
      }
    }
  })
}

const resetForm = () => {
  form.content = ''
  form.score = 5
  formRef.value?.resetFields()
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
