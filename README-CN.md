# Nexfep

语言: [English](https://github.com/nexfteam/Nexfep/blob/main/README.md) | 简体中文(当前)

基于 @webviewjs/webview 的桌面应用框架

## 项目状态

**🚧 早期阶段**

本项目目前处于早期开发阶段，仍缺失大量桌面应用开发所需的核心能力。框架正在持续迭代中。

## 简介

Nexfep 是一个基于 [@webviewjs/webview](https://github.com/webviewjs/webview) 构建的桌面应用框架，使用 TypeScript 编写。它旨在为开发者提供一套简洁、高效的工具链，用于构建跨平台桌面应用。

框架采用窗口池管理机制，支持多窗口应用场景，如代码编辑器、聊天工具、仪表盘等。

## 特性

- **窗口池管理** — 内置窗口池机制，自动复用和回收窗口资源，避免频繁创建销毁的开销
- **IPC 通信** — 支持主进程与 WebView 之间的双向消息通信，通过注入的函数进行调用
- **窗口控制** — 提供最大化、最小化、关闭、标题设置、开发者工具等完整窗口操作 API
- **拖拽区域** — 内置 HTML 属性支持，方便定义窗口拖拽区域（`nexfep-area-drag` 等）
- **系统托盘** — 创建和管理系统托盘图标及右键菜单
- **桌面通知** — 通过 `app.utils.notify()` 发送桌面通知
- **日志系统** — 内置 Logger，支持文件日志和彩色控制台输出，自动拦截页面 console 消息
- **CLI 构建工具** — 通过 `nexfep build` 将应用打包为独立可执行文件
- **TypeScript 支持** — 完整的类型定义，开发体验优秀

## 安装

```bash
pnpm add nexfep
```

## 快速开始

```typescript
import { Application } from 'nexfep';

const app = new Application();

const window = await app.windows.createWindow(true, false);

await window.loadHTML('<h1 nexfep-area-drag>Hello Nexfep!</h1>');
```

## 使用指南

### Application

`Application` 是框架的主入口，负责管理应用生命周期，提供窗口、系统托盘和日志的访问。

```typescript
import { Application } from 'nexfep';

const app = new Application();
// 或指定自定义 WebView2 用户数据目录（仅 Windows 生效）
const app = new Application({ WindowsWebview2UserDataFolder: 'C:\\custom\\webview2-data' });
// 或指定日志文件路径
const app = new Application({ LogFilePath: './app.log' });
```

**构造函数参数**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `WindowsWebview2UserDataFolder` | `string`（可选） | `%LOCALAPPDATA%\NexfepDevelopment.webview2-data` | WebView2 用户数据目录（仅 Windows） |
| `LogFilePath` | `string`（可选） | 无 | 日志文件输出路径 |

**属性**

- `windows` — `WindowPool` 实例，用于管理浏览器窗口
- `utils` — 工具方法（如桌面通知）
- `logger` — `Logger` 实例，用于日志记录

**方法**

- `createTray(options)` — 创建系统托盘图标和右键菜单
- `exit()` — 退出应用

### Logger

Logger 支持文件输出和彩色控制台输出，可通过 `app.logger` 访问。

```typescript
app.logger.log('Hello World');
app.logger.error('发生错误');
app.logger.warn('警告信息');
app.logger.info('提示信息');
app.logger.debug('调试信息');
```

**方法**

| 方法 | 说明 |
|------|------|
| `log(message)` | 记录日志 |
| `error(message)` | 记录错误日志（红色） |
| `warn(message)` | 记录警告日志（黄色） |
| `info(message)` | 记录提示日志（蓝色） |
| `debug(message)` | 记录调试日志（灰色） |

每个方法接受字符串或字符串数组作为参数。

**页面 Console 拦截**

页面中的 `console.log`、`console.error`、`console.info`、`console.warn`、`console.debug` 调用会被自动拦截并转发到主进程 Logger，输出中包含来源窗口的 ID。

### 托盘图标

通过 `app.createTray()` 创建和管理系统托盘图标及右键菜单。

```typescript
import { readFileSync } from 'fs';

const tray = app.createTray({
  id: 'my-tray',
  tooltip: '我的应用',
  icon: {
    data: readFileSync('./icon.png'),
    width: 32,
    height: 32,
  },
  menuItems: [
    { id: 'show', label: '显示窗口' },
    { id: 'quit', label: '退出' },
  ],
});
```

`icon` 字段接受 `TrayIconImage` 对象：

```typescript
interface TrayIconImage {
  data: Buffer;      // 图片二进制数据
  width?: number;    // 可选宽度
  height?: number;   // 可选高度
}
```

**方法**

| 方法                                         | 描述               |
|---------------------------------------------|--------------------|
| `addMenuItem(item)`                         | 添加菜单项          |
| `removeMenuItem(id)`                        | 按 ID 删除菜单项    |
| `setMenuItems(items)`                       | 替换所有菜单项      |
| `setIcon(icon, width?, height?)`            | 更改托盘图标（原始像素数据 `Uint8Array` / `number[]`） |
| `setTooltip(tooltip)`                       | 更改悬停提示文本    |
| `on(event, callback)`                       | 监听托盘事件（如 `'click'`） |
| `show()`                                    | 显示托盘图标        |
| `hide()`                                    | 隐藏托盘图标        |
| `destroy()`                                 | 销毁托盘图标        |

```typescript
tray.on('click', () => {
  console.log('托盘被点击');
});
tray.addMenuItem({ id: 'about', label: '关于' });
tray.setTooltip('Nexfep 应用');
```

### 桌面通知

通过 `app.utils.notify()` 发送桌面通知。

```typescript
const notification = app.utils.notify('标题', '通知内容');
```

**参数**

- `title` — 通知标题
- `body`（可选）— 通知正文

### 窗口池

`WindowPool` 是框架的核心管理类，负责窗口的创建和回收。

```typescript
const pool = app.windows;
```

### 窗口创建

```typescript
const win = await pool.createWindow(true, false);
```

**参数说明**

- `isShow`（布尔值，默认 `true`）— 是否立即显示窗口
- `isDecorated`（布尔值，默认 `true`）— 是否使用系统窗口装饰。设为 `false` 时，窗口无边框，需要自定义标题栏

### 窗口操作

```javascript
window.show();
window.hide();
window.maximize();
window.minimize();
window.close();
window.setTitle('新标题');
window.setSize(800, 600);
window.openDevTools();
```

### 自定义消息

#### 发送消息

在页面中通过 `window.postMessage` 发送消息：

```javascript
window.postMessage({ hello: 'world' });
```

**参数说明**

- `data` — 任意类型的可序列化数据，会被序列化为 JSON 字符串后发送

#### 监听消息

在主进程中通过 `onCustomMessage` 回调接收消息：

```typescript
pool.onCustomMessage = (window, data) => {
  console.log(`来自窗口 ${window.id} 的消息:`, data);
};
```

**回调参数**

- `window` — 发送消息的窗口对象
- `data` — 消息内容，为对象类型（JSON 序列化后会自动通过 `JSON.parse` 转换为对象）

### 自定义事件

#### 触发事件

在页面中通过 `window.invoke` 触发事件：

```javascript
window.invoke('hello');
window.invoke('hello', 'world');
```

**参数说明**

- `event` — 事件名称
- `data`（可选）— 任意类型的可序列化数据，会被序列化为 JSON 字符串后发送

#### 监听事件

在主进程中通过 `pool.handle` 监听事件：

```typescript
pool.handle('hello', (data) => {
  console.log('收到事件 hello:', data);
});
```

**参数说明**

- `event` — 事件名称，需要和触发事件时的事件名称一致
- `callback` — 事件处理函数，需要接收事件数据作为 `data` 参数。返回任意类型的可序列化数据，会被序列化为 JSON 字符串后发送至前端作为 `window.invoke` 的返回值（也可以不返回任何值）

#### 取消监听事件

在主进程中通过 `pool.unhandle` 取消监听事件：

```typescript
pool.unhandle('hello', (data) => {
  console.log('收到事件 hello:', data);
});
```

**参数说明**

- `event` — 事件名称，需要和触发事件时的事件名称一致
- `callback` — 事件处理函数，需要和监听事件时的回调函数一致

### 全局变量

#### 设置变量

在页面中通过 `window.setGlobal` 设置全局变量：

```javascript
window.setGlobal('hello', 'world');
```

**参数说明**

- `name` — 全局变量名称
- `value` — 全局变量值，任意类型的可序列化数据，会被序列化为 JSON 字符串后发送

#### 获取变量

在页面中通过 `window.getGlobal` 获取全局变量：

```javascript
const value = await window.getGlobal('hello');
```

**参数说明**

- `name` — 全局变量名称

#### 全局变量 Map

在主进程中通过 `pool.global` 获取一个包含所有全局变量的 `Map<string, any>` 对象，可对其进行设置、获取等操作：

```typescript
const globals = pool.global;
globals.set('hello', 'world');
const value = globals.get('hello');
```

### 窗口间通信

框架支持窗口之间通过 `window.broadcast` 和 `window.tell` 直接通信，无需经过主进程。

#### 广播

通过 `window.broadcast` 向所有其他打开的窗口发送事件：

```javascript
window.broadcast('user-login', { userId: 123 });
```

**参数说明**

- `name` — 事件名称
- `data`（可选）— 任意类型的可序列化数据，会被序列化为 JSON 字符串后发送

其他窗口通过 `window.addEventListener` 监听广播事件：

```javascript
window.addEventListener('user-login', (event) => {
  console.log('用户已登录:', event.detail);
});
```

#### 定向发送

通过 `window.tell` 向指定 ID 的窗口发送消息：

```javascript
window.tell(2, 'custom-message', { text: '你好，窗口2' });
```

**参数说明**

- `to` — 目标窗口 ID（数字类型）
- `message` — 事件名称
- `data`（可选）— 任意类型的可序列化数据，会被序列化为 JSON 字符串后发送

目标窗口通过 `window.addEventListener` 接收消息：

```javascript
window.addEventListener('custom-message', (event) => {
  console.log('收到消息:', event.detail);
});
```

每个窗口的 ID 可通过 `window.id` 获取：

```javascript
console.log('当前窗口 ID:', window.id);
```

### 窗口控制函数

页面中可直接调用以下注入函数进行窗口控制：

```javascript
window.close();              // 关闭窗口
window.minimize();           // 最小化窗口
window.unminimize();         // 还原最小化的窗口
window.maximize();           // 最大化窗口
window.unmaximize();         // 还原最大化的窗口
window.setTitle('标题');     // 设置窗口标题
window.openDevTools();       // 打开开发者工具
window.closeDevTools();      // 关闭开发者工具
```

页面中还可访问以下属性：

```javascript
console.log(window.id);               // 窗口唯一标识
console.log(window.isNexfepLoadDone); // 窗口是否已加载完成
```

### 拖拽区域

通过 HTML 属性即可定义窗口拖拽区域，无需编写额外 JavaScript 代码。这些属性会自动应用 `-webkit-app-region` 和 `app-region` CSS 属性。

#### `nexfep-area-drag`

使整个区域及其所有子元素均可拖拽。适用于自定义标题栏等需要整块区域可拖拽的场景。

```html
<div nexfep-area-drag>
  <h1>标题栏</h1>
  <span>副标题</span>
</div>
```

#### `nexfep-element-drag`

仅使指定元素本身可拖拽，子元素不受影响。适用于需要精确控制拖拽区域的场景。

```html
<div>
  <div nexfep-element-drag>拖拽手柄</div>
  <p>这部分不可拖拽</p>
</div>
```

#### `nexfep-no-drag`

使指定区域及其所有子元素不可拖拽，优先级最高，可覆盖父元素的拖拽属性。适用于按钮、输入框等交互元素。

```html
<div nexfep-area-drag>
  <h1>标题栏</h1>
  <button nexfep-no-drag>点击按钮</button>
</div>
```

#### `nexfep-auto-drag`

自动判断拖拽区域：整个区域可拖拽，但常见交互元素（`button`、`input`、`select`、`textarea`、`a`）自动设为不可拖拽。适用于包含多种交互元素的复杂区域。

```html
<div nexfep-auto-drag>
  <h1>标题栏</h1>
  <button>自动不可拖拽</button>
  <input placeholder="自动不可拖拽" />
  <a href="#">自动不可拖拽</a>
</div>
```

### 加载完成事件

WebView 窗口加载完成后会触发 `nexfep-load-done` 事件：

```javascript
window.addEventListener('nexfep-load-done', () => {
  console.log('Nexfep 窗口加载完成');
});
```

也可通过 `window.isNexfepLoadDone` 属性判断：

```javascript
if (window.isNexfepLoadDone) {
  // 窗口已就绪
}
```

## CLI

### `help`

使用 `help` 命令获取可用命令列表：

```bash
npx nexfep help
```

### `build`

Nexfep 提供命令行工具，用于将应用打包为独立可执行文件。

#### 用法

```bash
npx nexfep build [options]
```

#### 选项

| 选项 | 说明 |
|------|------|
| `-n, --name <name>` | 应用名称（默认：来自 package.json） |
| `-e, --entry <file>` | 入口文件路径（默认：来自 package.json main） |
| `-o, --output <dir>` | 输出目录（默认：dist） |
| `-i, --ignore <pattern>` | 要忽略的文件或目录（可多次使用） |
| `-c, --console` | 在 Windows 上显示控制台窗口（默认：false） |
| `-r, --reinstall` | 构建前仅重新安装生产依赖 |
| `-s, --skip-clean` | 跳过清理旧的构建文件 |
| `-u, --upx <level>` | 使用 UPX 压缩可执行文件，级别 0-9（默认：0） |
| `-m, --meta, --metadata <file>` | 元数据文件路径（默认：无） |

#### 示例

```bash
# 使用 package.json 默认配置构建
nexfep build

# 设置自定义应用名称和入口文件
nexfep build -n my-app -e ./src/index.js

# 设置自定义输出目录
nexfep build -o ./build

# 忽略多个模式
nexfep build -i node_modules -i test -i temp

# 使用 UPX 压缩构建
nexfep build -u 7
```

该命令使用 [nexfpack](https://github.com/nexfteam/Nexfpack) 将应用打包为独立可执行文件。

对于 `metadata` 参数，可以参考 [Nexfpack 文档](https://github.com/nexfteam/Nexfpack/blob/main/README-CN.md#%E5%85%83%E6%95%B0%E6%8D%AE)。

注意不要包括外层的 `metadata` 字段，直接包含内部字段即可，例如：

```json
{ "1033": { "FileVersion": "..." } }
```

## API

### Application

| 方法/属性 | 参数 | 返回值 | 说明 |
|-----------|------|--------|------|
| `constructor(options?)` | `{ WindowsWebview2UserDataFolder?, LogFilePath? }` | Application | 创建应用实例 |
| `windows` | / | WindowPool | 窗口池实例 |
| `utils` | / | \_\_Utils | 工具方法（通知） |
| `logger` | / | Logger | 日志实例 |
| `createTray(options)` | 见 Tray 章节 | Tray | 创建系统托盘图标 |
| `exit()` | 无 | void | 退出应用 |

### WindowPool

| 方法/属性 | 参数 | 返回值 | 说明 |
|-----------|------|--------|------|
| `createWindow(isShow?, isDecorated?)` | `isShow`: boolean（默认 true）, `isDecorated`: boolean（默认 true） | Promise\<Window> | 创建并获取一个窗口 |
| `handle(event, callback)` | `event`: string, `callback`: (data: any) => any | 无 | 监听指定事件 |
| `unhandle(event, callback)` | `event`: string, `callback`: (data: any) => any | 无 | 取消监听指定事件 |
| `global` | / | Map\<string, any> | 全局变量 Map |
| `closeWindow(window)` | `window`: Window | Promise\<void> | 关闭指定窗口并回收至池中 |
| `onCustomMessage` | `(window: Window, data: string) => void` | 无 | 自定义消息回调函数 |

### Window

| 方法/属性 | 参数 | 返回值 | 说明 |
|-----------|------|--------|------|
| `loadURL(url)` | `url`: string — 要加载的网页地址 | Promise\<void> | 加载指定 URL |
| `loadHTML(html)` | `html`: string — HTML 字符串 | Promise\<void> | 加载指定 HTML 内容 |
| `show()` | 无 | void | 显示窗口 |
| `hide()` | 无 | void | 隐藏窗口 |
| `maximize()` | 无 | void | 最大化窗口 |
| `unMaximize()` | 无 | void | 还原窗口（取消最大化） |
| `minimize()` | 无 | void | 最小化窗口 |
| `unMinimize()` | 无 | void | 还原窗口（取消最小化） |
| `close()` | 无 | void | 关闭窗口并回收至池中 |
| `setTitle(title)` | `title`: string | void | 设置窗口标题 |
| `setDecorated(isDecorated)` | `isDecorated`: boolean | void | 设置窗口是否带边框和标题栏 |
| `resizable(resizable)` | `resizable`: boolean | void | 设置窗口是否可调整大小 |
| `setSize(width, height)` | `width`: number, `height`: number | void | 设置窗口尺寸（像素） |
| `openDevTools()` | 无 | void | 打开开发者工具 |
| `closeDevTools()` | 无 | void | 关闭开发者工具 |
| `id` | 无 | number | 窗口唯一标识，自增编号 |

## 开发

```bash
pnpm install
pnpm run compile
```

## 许可证

MIT License
