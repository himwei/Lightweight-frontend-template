<template>
  <div class="ai-page-container">
    <el-card class="chat-card" shadow="never">
      <template #header>
        <div class="chat-header">
          <span class="title">
            <el-icon><MagicStick /></el-icon> AI 智能导诊助理
          </span>
          <el-button size="small" :icon="Delete" @click="clearHistory">清空对话记录</el-button>
        </div>
      </template>

      <!-- 消息显示区 -->
      <div class="message-container" ref="scrollRef">
        <div v-for="(msg, index) in messages" :key="index" :class="['msg-wrapper', msg.role]">
          <el-avatar
              :size="40"
              :src="msg.role === 'ai' ? '/ai-avatar.png' : userStore.userInfo?.avatar"
              class="avatar"
          >
            {{ msg.role === 'ai' ? 'AI' : userStore.userInfo?.nickName?.charAt(0) }}
          </el-avatar>

          <div class="content-box">
            <div class="role-name">{{ msg.role === 'ai' ? '智能助理' : '我' }}</div>

            <div class="text-card">
              <!-- 情况 1: 如果有内容，直接渲染 Markdown -->
              <template v-if="msg.content">
                <div class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
              </template>

              <!-- 情况 2: 如果是 AI 且内容为空，说明正在“思考/加载中”，显示动画 -->
              <template v-else-if="msg.role === 'ai'">
                <div class="typing-dot">
                  <span></span><span></span><span></span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="input-area">
        <el-input
            v-model="userInput"
            type="textarea"
            :rows="3"
            placeholder="请详细描述您的症状（如：最近感觉胸闷、气短，应该看哪个科？）"
            resize="none"
            :disabled="isProcessing"
            @keyup.enter.exact.prevent="handleSend"
        />
        <div class="input-footer">
          <span class="tip">按 Enter 发送，Shift + Enter 换行</span>
          <el-button type="primary" :icon="Promotion" :loading="isProcessing" @click="handleSend">
            发送咨询
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue'
import { MagicStick, Delete, Promotion } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { marked } from 'marked'

const userStore = useUserStore()
const scrollRef = ref<HTMLElement>()
const userInput = ref('')
const isProcessing = ref(false) // 请求锁

const messages = reactive([
  { role: 'ai', content: '您好！我是您的 AI 导诊助手。您可以描述您的不适症状，我会为您分析可能的原因并推荐合适的科室。' }
])

// 渲染 Markdown
const renderMarkdown = (content: string) => {
  return marked.parse(content)
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (scrollRef.value) {
    scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }
}

const handleSend = async () => {
  if (!userInput.value.trim() || isProcessing.value) return

  const message = userInput.value.trim()

  // 1. 推入用户消息
  messages.push({ role: 'user', content: message })
  userInput.value = ''
  isProcessing.value = true
  scrollToBottom()

  // 2. 推入一条空的 AI 消息占位（此时界面会显示加载动画）
  const aiMsgIndex = messages.push({ role: 'ai', content: '' }) - 1

  try {
    // 3. 发起 SSE 请求 (使用相对路径触发 Vite 代理)
    const response = await fetch(`/api/ai/chat?message=${encodeURIComponent(message)}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'satoken': userStore.token
      }
    })

    if (!response.ok) {
      if (response.status === 429) {
        messages[aiMsgIndex].content = '⚠️ AI 助手现在太忙了，请稍后再试。'
      } else {
        messages[aiMsgIndex].content = '抱歉，服务出现异常，请稍后重试。'
      }
      return
    }

    if (!response.body) throw new Error('ReadableStream 不可用')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      // 解码当前数据块
      buffer += decoder.decode(value, { stream: true })

      // 处理多行数据
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('data:')) {
          const content = trimmedLine.substring(5).trim()
          if (content) {
            // 只要这里 content 有了值，template 里的 v-if="msg.content" 就会生效
            // 动画会自动消失，文字会自动出现，实现无缝切换
            messages[aiMsgIndex].content += content
            scrollToBottom()
          }
        }
      }
    }

    // 补齐最后残留的 buffer
    if (buffer.startsWith('data:')) {
      messages[aiMsgIndex].content += buffer.substring(5).trim()
      scrollToBottom()
    }

  } catch (error) {
    console.error('AI SSE Error:', error)
    messages[aiMsgIndex].content = '连接 AI 助手失败，请检查网络设置。'
  } finally {
    isProcessing.value = false
    scrollToBottom()
  }
}

const clearHistory = () => {
  messages.length = 0
  messages.push({ role: 'ai', content: '对话已清空。有什么我可以帮您的吗？' })
}

onMounted(() => scrollToBottom())
</script>

<style scoped lang="scss">
.ai-page-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;

  .chat-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
    }
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title { font-weight: bold; font-size: 16px; color: #409EFF; }
  }

  .message-container {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #f5f7fa;

    .msg-wrapper {
      display: flex;
      gap: 15px;
      margin-bottom: 25px;
      &.user { flex-direction: row-reverse; }

      .content-box {
        max-width: 80%;
        .role-name {
          font-size: 12px;
          color: #999;
          margin-bottom: 5px;
        }
        &.user {
          .role-name { text-align: right; }
        }

        .text-card {
          background: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          min-height: 20px; /* 保证动画时也有一定高度 */

          .markdown-body {
            :deep(p) { margin: 0; }
            :deep(ul), :deep(ol) { padding-left: 20px; margin: 5px 0; }
          }
        }
      }

      &.user .text-card {
        background: #409EFF;
        color: white;
      }
    }
  }

  .input-area {
    padding: 20px;
    background: white;
    border-top: 1px solid #ebeef5;

    .input-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      .tip { font-size: 12px; color: #999; }
    }
  }
}

/* 思考中的三个点动画 */
.typing-dot {
  display: flex;
  gap: 4px;
  padding: 5px 0;
  span {
    width: 7px; height: 7px; background: #409EFF; border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
  40% { transform: scale(1.2); opacity: 1; }
}
</style>
