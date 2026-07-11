# Todo list for Nexfep

This todo list are **not** support English , please use Chinese.

If you want to read this todo list in English, please use translate tool or AI.

---

## Major

> 暂无Major TODO

---

## Minor

### 1. 脚手架工具

进度：`0%  ---------------------------------  0/33`

#### 描述

实现一个便捷的脚手架工具，使用户可以通过 `pnpm create nexfep-app` 快速创建一个基本的 Nexfep 项目。

#### 子任务列表

- [ ] 实现 `create-nexfep-app` 命令（支持 `pnpm create nexfep-app` 和 `npm init nexfep-app`）
- [ ] 支持传入项目名称：`pnpm create nexfep-app my-app`
- [ ] 支持 `--template` 参数选择模板
- [ ] 支持 `--no-install` 跳过依赖安装
- [ ] 支持 `--package-manager` 指定包管理器（npm / pnpm / yarn / bun）
- [ ] 模板：`vanilla`（纯 TypeScript，无前端框架，默认）
- [ ] 模板：`react`（React + TypeScript，含 Vite 配置示例）
- [ ] 模板：`vue`（Vue 3 + TypeScript，含 Vite 配置示例）
- [ ] 模板：`svelte`（Svelte + TypeScript，含 Vite 配置示例）
- [ ] 模板：`vanilla-js`（纯 JavaScript，不使用 TypeScript）
- [ ] 所有模板包含一个能直接运行的 Hello World 示例
- [ ] 生成 `package.json`（含必要的依赖和脚本）
- [ ] 生成 `tsconfig.json`（TypeScript 配置，如有 TypeScript）
- [ ] 生成 `nexfep.config.ts`（默认配置，含注释说明）
- [ ] 生成 `src/index.ts`（主入口文件，含基础示例代码）
- [ ] 生成 `.gitignore`（忽略 node_modules、dist 等）
- [ ] 生成 `README.md`（项目说明，含运行和打包命令）
- [ ] 生成 `index.html`（前端页面，如使用前端框架则生成对应的入口文件）
- [ ] 如果没有传入项目名称，交互式询问项目名称
- [ ] 交互式选择模板（vanilla / react / vue / svelte）
- [ ] 交互式选择包管理器（npm / pnpm / yarn / bun）
- [ ] 交互式询问是否需要 TypeScript
- [ ] 交互式询问是否需要 ESLint / Prettier
- [ ] 脚手架生成完成后自动执行 `pnpm install`
- [ ] 安装完成后显示下一步指引（`cd my-app && pnpm dev`）
- [ ] 如果安装失败，给出错误提示和手动安装指引
- [ ] 支持 `--offline` 模式（使用本地缓存模板）
- [ ] 支持 `--force` 强制覆盖已有目录
- [ ] 支持交互式选择额外配置（如是否生成测试文件、是否配置 CI 等）

---

### 2. 日志

进度：`80%  ————————————————----  16/20`

#### 描述

将 WebView 中的 console 日志输出到终端，并可选持久化到文件，方便开发调试和生产问题排查。

#### 子任务列表

- [x] 劫持 WebView 的 console.log / error / info / warn / debug
- [x] 日志输出到终端，带颜色区分级别
- [x] 多窗口日志带 [窗口ID] 区分来源
- [x] 在 Application 构造函数中增加 `LogFilePath` 参数
- [x] 实现 Logger 类，支持写入文件
- [x] 日志文件包含时间戳、窗口 ID、日志级别、消息内容
- [x] 终端输出保留颜色，文件输出纯文本
- [x] 日志文件自动创建目录（如果不存在）
- [x] 日志文件追加写入（不覆盖历史）
- [x] 日志写入失败时优雅降级（只输出到终端，不崩溃）
- [x] 支持配置日志级别（`debug` / `info` / `warn` / `error`）
- [ ] 支持 JSON 格式日志输出（方便日志分析工具）
- [ ] 支持按大小自动轮转（如单个文件超过 10MB 自动切分）
- [ ] 支持按时间自动轮转（每天/每周生成新文件）
- [ ] 支持日志压缩归档

---

### 3. 自定义协议模块

进度：`0%  ----  0/4`

#### 描述

封装 `@webviewjs/webview` 的自定义协议能力，在 `WindowPool` 下提供配置驱动的协议映射，支持开发/生产环境自动切换。

#### 子任务列表

- [ ] 在 `WindowPool` 中封装 `protocols.register()` 方法
- [ ] 支持 `nexfep.config.json` 中的 `protocols` 配置项
- [ ] 开发/生产环境自动切换
- [ ] 错误处理和日志输出

---

### 4. 单例模式

进度：`0%  -----  0/5`

#### 描述

确保应用只有一个实例在运行，再次启动时唤醒已有窗口。

#### 子任务列表

- [ ] 实现单例检测机制（使用 socket 或锁文件）
- [ ] 应用启动时检测是否已有实例在运行
- [ ] 如果已有实例，将新实例的启动参数传递给已有实例，然后退出新实例
- [ ] 支持 `--no-single` 参数允许启动多个实例（调试用）
- [ ] 支持跨用户会话的单例检测

---

### 5. 文件拖入支持

进度：`0%  ------  0/6`

#### 描述

支持用户从文件管理器拖拽文件/文件夹到 Nexfep 应用窗口。

#### 子任务列表

- [ ] 实现 `window.nexfep.onDropFiles(callback)` API
- [ ] 返回拖入的文件路径列表
- [ ] 支持拖入时显示拖放指示器（高亮区域）
- [ ] 支持过滤拖入的文件类型（如只接受图片）
- [ ] 支持拖入 URL（从浏览器拖链接到应用）

---

### 6. 系统主题跟随

进度：`0%  ------  0/6`

#### 描述

支持跟随系统主题（暗色/亮色模式），实现应用与系统主题同步。

#### 子任务列表

- [ ] 实现 `window.nexfep.getSystemTheme()` API
- [ ] 实现 `window.nexfep.onThemeChange(callback)` API
- [ ] 跨平台支持（macOS、Windows、Linux）
- [ ] 支持手动覆盖主题（`window.nexfep.setTheme('dark')`）
- [ ] 支持读取系统强调色（Accent Color）
- [ ] 支持系统主题变化时自动通知所有窗口

---

## Enhancement

### 1. 对 React 等前端框架的官方适配

进度：`0%  -------------  0/13`

#### 描述

实现对 React、Vue、Svelte 等前端框架的官方适配层，使用户可以用这些框架的惯用语法（如 React Hooks、Vue Composables）调用 Nexfep 的桌面 API。

#### 子任务列表

- [ ] 实现 Nexfep API 的 React Hooks
- [ ] 提供 TypeScript 类型定义
- [ ] 发布 `@nexfteam/nexfep-react` 包到 npm
- [ ] 实现 Nexfep API 的 Vue Composables
- [ ] 提供 TypeScript 类型定义
- [ ] 发布 `@nexfteam/nexfep-vue` 包到 npm
- [ ] 实现 `nexfep` Store
- [ ] 实现消息监听的 Svelte Action
- [ ] 提供 TypeScript 类型定义
- [ ] 发布 `@nexfteam/nexfep-svelte` 包到 npm
- [ ] 实现 `@nexfteam/nexfep-solid` 适配（Solid.js）
- [ ] 实现 `@nexfteam/nexfep-angular` 适配（Angular）
- [ ] 实现 `@nexfteam/nexfep-preact` 适配（Preact）

> 适配层只是 Nexfep API 的薄封装，不添加任何额外逻辑。
> 适配层不阻碍用户直接使用 `window.xxx`。
> 适配层的发布独立于 Nexfep 核心，可单独升级。
> 框架适配按需开发，优先支持 React，其他框架等用户需求。

---

### 2. 全局快捷键

进度：`0%  -------  0/7`

#### 描述

支持全局快捷键注册，即使应用在后台也能响应键盘事件。

#### 子任务列表

- [ ] 实现 `window.nexfep.utils.registerShortcut` API
- [ ] 支持组合键（如 `CmdOrCtrl+Shift+P`）
- [ ] 支持快捷键回调函数
- [ ] 支持 `window.nexfep.utils.unregisterShortcut` 取消注册
- [ ] 支持快捷键冲突检测
- [ ] 支持快捷键配置文件（`shortcuts.json`）
- [ ] 支持动态更新快捷键（无需重启应用）

---

### 3. 开机自启动

进度：`0%  -----  0/5`

#### 描述

支持应用开机自启动（用户登录时自动运行）。

#### 子任务列表

- [ ] 实现 `window.nexfep.utils.setAutoStart(true/false)` API
- [ ] 跨平台支持（macOS Login Items、Windows Registry、Linux .desktop）
- [ ] 支持 `--hidden` 参数（开机启动时隐藏窗口）
- [ ] 支持检测当前是否已开启开机自启动

---

### 4. 加密存储

进度：`0%  ----------  0/10`

#### 描述

提供安全存储敏感数据的能力（如登录态、API Key、用户凭证）。

#### 子任务列表

- [ ] 实现 `window.nexfep.utils.storage.set(key, value)` API（加密存储）
- [ ] 实现 `window.nexfep.utils.storage.get(key)` API（解密读取）
- [ ] 实现 `window.nexfep.utils.storage.delete(key)` API
- [ ] 跨平台支持（macOS Keychain、Windows Credential Manager、Linux libsecret）
- [ ] 支持存储加密密钥的自定义（`storage.setKey()`）
- [ ] 支持批量操作（`storage.setMultiple()` / `storage.getMultiple()`）
- [ ] 支持存储命名空间（`storage.namespace('app')`）
