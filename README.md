没问题！这是配套的**前端开发手册**，同样是**纯干货、实战导向**，可以直接保存为 `README_FRONTEND.md` 或者合并到主 README 中。

---

# 🖥️ Vue 3 + TypeScript + OpenAPI 前端开发手册

> **基于 Vue 3 + TypeScript + Vite + Pinia + Element Plus 的现代化管理系统前端。**
> **核心特性：根据后端 Swagger 文档自动生成 API 代码，彻底告别手写请求层。**

---

## 📚 核心技术栈

*   **框架**: Vue 3 (Script Setup)
*   **语言**: TypeScript
*   **构建**: Vite 5
*   **UI库**: Element Plus
*   **状态**: Pinia
*   **路由**: Vue Router 4
*   **API**: openapi-typescript-codegen (核心黑科技)
*   **CSS**: Sass (SCSS)

---

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 自动生成 API 代码 (核心步骤) 🔥
**只要后端接口有更新，执行这行命令，前端代码自动同步！**
```bash
# 前提：后端项目必须已启动 (http://localhost:8123 可访问)
npm run gen:api
```
*生成的文件位于 `src/api/generated`，请勿手动修改该目录下的文件。*

### 3. 启动开发服务器
```bash
npm run dev
```
访问：http://localhost:9999

---

## 🛠️ 开发规范 & 常用操作

### 1. 如何调用后端接口？
**千万不要手写 `axios.get('/user/list')`！**
请直接使用生成的 `Service` 类，享受完整的 TypeScript 类型提示。

**示例：**
```typescript
import { UserControllerService, type LoginDTO } from '@/api/generated'

// 调用接口
const handleLogin = async () => {
  // 参数类型都有提示，写错了会爆红
  const params: LoginDTO = {
    username: 'admin',
    password: '123'
  }
  
  const res = await UserControllerService.login(params)
  
  if (res.code === 0) {
    console.log('登录成功:', res.data?.token)
  }
}
```

### 2. 全局配置 (Config)
*   **文件**: `src/api/config.ts`
*   **作用**: 
    *   配置 `OpenAPI.BASE` (API前缀)。
    *   配置 **Axios 拦截器** (自动注入 Token、处理 401 过期)。
*   **注意**: Token 的 Header 名称必须与后端一致 (默认为 `satoken`)。

### 3. 路由与权限 (Router)
*   **定义路由**: `src/router/index.ts`
*   **配置权限**: 在路由的 `meta` 中添加 `requiresAuth: true`。
    ```typescript
    {
      path: 'user',
      component: () => import('@/views/system/UserView.vue'),
      meta: { 
        title: '用户管理', 
        requiresAuth: true // <--- 加上这个，没登录进不来
      }
    }
    ```
*   **路由守卫**: `src/router/guard.ts` (负责处理登录拦截逻辑)。

### 4. 状态管理 (Pinia)
*   **文件**: `src/stores/user.ts`
*   **用法**:
    ```typescript
    import { useUserStore } from '@/stores/user'
    const userStore = useUserStore()
    
    // 获取当前用户信息
    console.log(userStore.userInfo?.nickname)
    // 退出登录
    userStore.logout()
    ```

### 5. 样式开发 (Sass)
已配置 Sass，支持嵌套写法：
```vue
<style lang="scss" scoped>
.box {
  width: 100px;
  .title { // 嵌套写法
    color: red;
    &:hover { color: blue; } // & 代表父级
  }
}
</style>
```

---

## 📂 目录结构说明

```text
src
├── api
│   ├── generated        # ⚠️ 自动生成的代码 (不要改这里)
│   └── config.ts        # API 全局拦截器配置
├── assets               # 静态资源
├── components           # 公共组件
├── layout               # 布局组件 (Sidebar, Header)
├── router
│   ├── index.ts         # 路由表定义
│   └── guard.ts         # 路由守卫逻辑
├── stores               # Pinia 状态管理 (UserStore)
├── views                # 页面文件
│   ├── login            # 登录页
│   ├── dashboard        # 首页
│   └── system           # 系统管理页 (用户/角色)
├── App.vue
└── main.ts              # 入口文件
```

---

## 💡 常见问题 (Q&A)

### Q1: `npm run gen:api` 报错连接失败？
*   **检查**: 确认后端项目是否启动？
*   **检查**: 确认浏览器能打开 `http://localhost:8123/api/v3/api-docs`？

### Q2: 登录成功了，但请求其他接口报 401？
*   **原因**: Token 没带过去。
*   **检查**: `src/api/config.ts` 里的拦截器是否生效？Header 的 key (`satoken`) 是否和后端 yml 配置一致？

### Q3: 为什么修改了 `src/api/generated` 下的文件，重启就没了？
*   **原因**: 因为那是**自动生成**的。
*   **解决**: 永远不要修改 generated 目录。如果需要拦截请求，去 `src/api/config.ts` 改。

### Q4: 如何新增一个页面？
1.  在 `src/views` 下新建 `MyPage.vue`。
2.  在 `src/router/index.ts` 添加路由配置。
3.  如果需要菜单，去 `src/layout/BasicLayout.vue` 添加 `<el-menu-item>`。