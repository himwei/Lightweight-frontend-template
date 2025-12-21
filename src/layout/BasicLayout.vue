<template>
  <el-container style="height: 100vh;">
    <!-- 侧边栏 (保持不变) -->
    <el-aside width="220px" style="background-color: #001529;">
      <div style="height:60px; line-height:60px; text-align:center; color:#fff; font-weight:bold; font-size: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
        <el-icon><FirstAidKit /></el-icon>
        <span>医院挂号系统</span>
      </div>

      <el-menu
          router
          :default-active="$route.path"
          background-color="#001529"
          text-color="#a6adb4"
          active-text-color="#409EFF"
          style="border-right: none;"
      >
        <!-- === 公共区域 === -->
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon><span>首页概览</span>
        </el-menu-item>
        <!-- === 管理员菜单 (只有 admin 可见) === -->
        <template v-if="userStore.hasRole(RoleEnum.ADMIN)">
          <!-- 加个分割线或标题让视觉更清晰 -->
          <el-menu-item-group title="系统管理">
            <el-menu-item index="/admin/dept">
              <el-icon><OfficeBuilding /></el-icon><span>科室管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/doctor">
              <el-icon><UserFilled /></el-icon><span>医生排班</span>
            </el-menu-item>
            <!-- 🔥 新增菜单项 -->
            <el-menu-item index="/admin/registration">
              <el-icon><Tickets /></el-icon><span>就诊管理</span>
            </el-menu-item>
            <el-menu-item index="/user">
              <el-icon><User /></el-icon><span>用户账号</span>
            </el-menu-item>
          </el-menu-item-group>
        </template>

        <!-- === 医生菜单 (只有 doctor 可见) === -->
        <template v-if="userStore.hasRole(RoleEnum.DOCTOR)">
          <el-menu-item-group title="医生工作台">
            <el-menu-item index="/doctor/patients">
              <el-icon><List /></el-icon><span>我的接诊</span>
            </el-menu-item>
            <el-menu-item index="/doctor/comments">
              <el-icon><ChatLineRound /></el-icon><span>评价反馈</span>
            </el-menu-item>
          </el-menu-item-group>
        </template>

        <!-- === 患者菜单 (只有 patient 可见) === -->
        <template v-if="userStore.hasRole(RoleEnum.PATIENT)">
          <el-menu-item-group title="就医服务">
            <el-menu-item index="/patient/home">
              <el-icon><Plus /></el-icon><span>挂号大厅</span>
            </el-menu-item>
            <el-menu-item index="/patient/record">
              <el-icon><Tickets /></el-icon><span>挂号记录</span>
            </el-menu-item>
          </el-menu-item-group>
        </template>
      </el-menu>
    </el-aside>

    <!-- 右侧主体 -->
    <el-container>
      <el-header style="background: #fff; box-shadow: 0 1px 4px rgba(0,21,41,.08); display: flex; justify-content: flex-end; align-items: center; padding-right: 20px;">

        <!-- ✅ 改造：右上角下拉菜单 -->
        <el-dropdown @command="handleCommand">
          <div style="display: flex; align-items: center; cursor: pointer; padding: 0 10px;">
            <el-avatar :size="32" :src="userStore.userInfo?.avatar" style="margin-right: 8px; background: #409EFF">
              {{ userStore.userInfo?.nickName?.charAt(0)?.toUpperCase() }}
            </el-avatar>
            <span style="font-size: 14px; color: #606266;">
              {{ userStore.userInfo?.nickName || '用户' }}
            </span>
            <el-icon style="margin-left: 4px"><CaretBottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

      </el-header>

      <el-main style="background-color: #f0f2f5; padding: 20px;">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- ✅ 新增：个人中心弹窗 -->
    <el-dialog v-model="profileVisible" title="个人中心" width="500px" @close="resetProfileForms">
      <el-tabs v-model="activeTab">

        <!-- Tab 1: 基本信息 -->
        <el-tab-pane label="基本信息" name="info">
          <el-form :model="infoForm" label-width="80px" style="margin-top: 20px">
<!--            <el-form-item label="头像URL">-->
<!--              <el-input v-model="infoForm.avatar" placeholder="请输入图片地址" />-->
<!--            </el-form-item>-->
            <!-- ✅ 换成上传组件 -->
            <el-form-item label="头像">
              <el-upload
                  class="avatar-uploader"
                  action="http://localhost:9999/api/file/upload"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                  :headers="uploadHeaders"
              >
                <!-- 如果有头像显示图片，没有显示加号 -->
                <img v-if="infoForm.avatar" :src="'http://localhost:9999' + infoForm.avatar" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div style="font-size: 12px; color: #999; margin-left: 10px;">点击图片修改</div>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="infoForm.nickName" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="infoForm.phone" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="infoForm.email" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdateProfile">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Tab 2: 安全设置 -->
        <el-tab-pane label="修改密码" name="security">
          <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="80px" style="margin-top: 20px">
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="pwdForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="handleUpdatePwd">确认修改</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { UserControllerService } from '@/api/generated'
import { ElMessage, ElMessageBox , type FormInstance } from 'element-plus'
import {
  Odometer, User, OfficeBuilding, UserFilled, List, Plus, Tickets, FirstAidKit, Calendar, CaretBottom, ChatLineRound
} from '@element-plus/icons-vue'
import { RoleEnum } from "@/constants/RoleConstant.ts"

const userStore = useUserStore()
const router = useRouter()

// --- 个人中心逻辑 ---
const profileVisible = ref(false)
const activeTab = ref('info')

// 基本信息表单
const infoForm = reactive({
  nickName: '',
  phone: '',
  email: '',
  avatar: ''
})

// 密码表单
const pwdFormRef = ref<FormInstance>()
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码校验
const validateConfirmPwd = (rule: any, value: any, callback: any) => {
  if (value !== pwdForm.newPassword) callback(new Error('两次密码不一致'))
  else callback()
}
const pwdRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, max: 20, message: '6-20位', trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPwd, trigger: 'blur' }]
}

// 下拉菜单点击
const handleCommand = (cmd: string) => {
  if (cmd === 'logout') handleLogout()
  if (cmd === 'profile') openProfile()
}

const handleLogout = async () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(async () => {
        // 用户点击了“确认”
        await userStore.logout()
        ElMessage.success('已安全退出')
        // 跳转回登录页
        await router.push('/login')
      })
      .catch(() => {
        // 用户点击了“取消”，不做任何操作
      })
}

// 打开个人中心并回显数据
const openProfile = () => {
  const u = userStore.userInfo
  console.log("userStore.userInfo",u)
  console.log(u.nickName)
  infoForm.nickName = u?.nickName || ''
  infoForm.phone = u?.phone || ''
  infoForm.email = u?.email || ''
  infoForm.avatar = u?.avatar || ''
  profileVisible.value = true
}

// 更新基本信息
const handleUpdateProfile = async () => {
  try {
    // 调用后端接口 (参数名要对齐 DTO)
    await UserControllerService.updateProfile(infoForm)
    ElMessage.success('保存成功')
    // 刷新 Store 里的用户信息
    await userStore.fetchUserInfo()
    profileVisible.value = false
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

// 更新密码
const handleUpdatePwd = async () => {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await UserControllerService.updatePwd({
          oldPassword: pwdForm.oldPassword,
          newPassword: pwdForm.newPassword
        })
        if (res.data){
          ElMessage.success('密码修改成功，请重新登录')
          profileVisible.value = false
          handleLogout() // 强制登出
        }
        else{
          ElMessage.error('修改失败，请检查旧密码')
        }
      } catch (e) {
        ElMessage.error('修改失败，请检查旧密码')
      }
    }
  })
}

const resetProfileForms = () => {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  if (pwdFormRef.value) pwdFormRef.value.clearValidate()
}


// --- 上传相关逻辑 ---
// 1. 组装 Header (Sa-Token 需要 satoken: xxx)
// const userStore = useUserStore()
const uploadHeaders = {
  // 注意：这里的 key 要和你后端配置文件里 sa-token.token-name 一致，默认是 satoken
  // 如果不确定，可以用 userStore.tokenName (如果你存了) 或者直接写 'satoken'
  satoken: userStore.token
}

// 2. 上传前的校验 (限制图片格式和大小)
const beforeAvatarUpload = (rawFile: any) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('头像必须是 JPG 或 PNG 格式!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 3. 上传成功的回调
const handleAvatarSuccess = (response: any) => {
  // response 是后端返回的 BaseResponse
  if (response.code === 0) {
    // 把返回的 URL 填入表单
    infoForm.avatar = response.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}
</script>

<style scoped>
/* 保持之前的 fade 样式 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


/* 头像上传组件样式 */
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;  /* 宽高决定框的大小 */
  height: 100px;
  text-align: center;
  display: flex;      /* Flex 居中 */
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover; /* 防止图片拉伸变形 */
}
</style>
