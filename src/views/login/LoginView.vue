<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 左侧插图区 (保持不变) -->
      <div class="login-left">
        <div class="login-title">
          <img src="@/assets/vue.svg" alt="logo" class="logo-img" />
          <h2>智慧医疗挂号系统</h2>
        </div>
        <div class="illustration">
          <el-icon :size="150" color="#fff"><FirstAidKit /></el-icon>
        </div>
        <p class="welcome-text">专业的在线预约诊疗服务平台</p>
      </div>

      <!-- 右侧表单区 -->
      <div class="login-right">
        <h3 class="form-title">用户登录</h3>
        <el-form :model="form" :rules="rules" ref="formRef" size="large">

          <!-- 账号 -->
          <el-form-item prop="username">
            <el-input
                v-model="form.username"
                placeholder="请输入账号"
                :prefix-icon="User"
            />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                show-password
                :prefix-icon="Lock"
                @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-button
              type="primary"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
          >
            立即登录
          </el-button>

          <div class="extra-links">
            <el-link type="info" disabled>忘记密码?</el-link>
            <!-- ✅ 点击触发注册弹窗 -->
            <el-link type="primary" @click="handleOpenRegister">注册账号</el-link>
          </div>
        </el-form>
      </div>
    </div>

    <!-- ✅ 新增：注册弹窗 -->
    <el-dialog
        v-model="registerVisible"
        title="患者注册"
        width="400px"
        @close="resetRegisterForm"
    >
      <el-form ref="regFormRef" :model="regForm" :rules="regRules" label-width="80px" size="large">
        <el-form-item label="账号" prop="userName">
          <el-input v-model="regForm.userName" placeholder="4-20位字符" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="regForm.nickName" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="passWord">
          <el-input v-model="regForm.passWord" type="password" show-password placeholder="6-20位密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPassword">
          <el-input v-model="regForm.checkPassword" type="password" show-password placeholder="再次输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="registerVisible = false">取消</el-button>
          <el-button type="primary" :loading="regLoading" @click="handleRegister">立即注册</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { UserControllerService } from '@/api/generated'
import { ElMessage, type FormInstance } from 'element-plus'
import { User, Lock, FirstAidKit } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// --- 登录逻辑 ---
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await UserControllerService.login(form)
        if (res.code === 0 && res.data) {
          userStore.setToken(res.data.token || '')
          await userStore.fetchUserInfo()
          ElMessage.success(`欢迎回来，${userStore.userInfo?.nickname || '用户'}`)
          router.push('/')
        } else {
          ElMessage.error(res.message || '登录失败')
        }
      } catch (e) {
        ElMessage.error('系统繁忙')
      } finally {
        loading.value = false
      }
    }
  })
}

// --- 注册逻辑 ---
const registerVisible = ref(false)
const regLoading = ref(false)
const regFormRef = ref<FormInstance>()

const regForm = reactive({
  userName: '',
  passWord: '',
  checkPassword: '',
  nickName: ''
})

// 自定义校验：确认密码
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== regForm.passWord) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const regRules = {
  userName: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  passWord: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  checkPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ]
}

const handleOpenRegister = () => {
  registerVisible.value = true
  resetRegisterForm()
}

const handleRegister = async () => {
  if (!regFormRef.value) return
  await regFormRef.value.validate(async (valid) => {
    if (valid) {
      regLoading.value = true
      try {
        // 注意参数名要和后端 UserRegisterDTO 对齐
        const res = await UserControllerService.userRegister(regForm)
        if (res.code === 0) {
          ElMessage.success('注册成功，请登录')
          registerVisible.value = false
          // 自动填入账号
          form.username = regForm.userName
        } else {
          ElMessage.error(res.message || '注册失败')
        }
      } catch (e) {
        // error
      } finally {
        regLoading.value = false
      }
    }
  })
}

const resetRegisterForm = () => {
  regForm.userName = ''
  regForm.passWord = ''
  regForm.checkPassword = ''
  regForm.nickName = ''
  nextTick(() => regFormRef.value?.clearValidate())
}
</script>

<style scoped lang="scss">
// 样式保持不变，直接复用你原来的 scss
// ... (这里省略样式代码，和你原来的一模一样) ...
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
.login-box {
  width: 800px;
  height: 450px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  overflow: hidden;
  .login-left {
    width: 400px;
    background: linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%);
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    .login-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      .logo-img { width: 32px; }
      h2 { font-size: 24px; margin: 0; }
    }
    .illustration {
      margin: 40px 0;
      opacity: 0.9;
    }
    .welcome-text {
      font-size: 14px;
      opacity: 0.8;
      letter-spacing: 1px;
    }
  }
  .login-right {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .form-title {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
      font-size: 22px;
    }
    .login-btn {
      width: 100%;
      margin-top: 10px;
      font-weight: bold;
      letter-spacing: 2px;
    }
    .extra-links {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
    }
  }
}
@media (max-width: 768px) {
  .login-box {
    width: 90%;
    height: auto;
    flex-direction: column;
    .login-left {
      display: none;
    }
    .login-right {
      padding: 30px;
    }
  }
}
</style>
