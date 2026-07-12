# Nexfep

Language: English(now) | [简体中文](https://github.com/nexfteam/Nexfep/blob/main/README-CN.md)

A desktop application framework based on @webviewjs/webview

## Project Status

**🚧 Early Stage**

This project is currently in early development, with many core capabilities for desktop application development still missing. The framework is being continuously iterated.

## Introduction

Nexfep is a desktop application framework built on [@webviewjs/webview](https://github.com/webviewjs/webview), written in TypeScript. It aims to provide developers with a concise and efficient toolchain for building cross-platform desktop applications.

The framework uses a window pool management mechanism, supporting multi-window application scenarios such as code editors, chat tools, dashboards, etc.

## Features

- **Window Pool Management** — Built-in window pool mechanism for automatic reuse and recycling of window resources, avoiding the overhead of frequent creation and destruction
- **IPC Communication** — Supports bidirectional message communication between the main process and WebView, via injected functions
- **Window Control** — Provides complete window operation APIs including maximize, minimize, close, title setting, and developer tools
- **Drag Regions** — Built-in HTML attribute support for defining window drag regions (`nexfep-area-drag`, etc.)
- **System Tray** — Create and manage system tray icons with context menus
- **Desktop Notifications** — Send desktop notifications via `app.utils.notify()`
- **Logging System** — Built-in logger with file output and colored console support, with automatic interception of page console messages
- **CLI Build Tool** — Package your application into a standalone executable via `nexfep build`
- **TypeScript Support** — Complete type definitions for excellent development experience

## Installation

```bash
pnpm add nexfep
```

## Quick Start

```typescript
import { Application } from 'nexfep';

const app = new Application();

const window = await app.windows.createWindow(true, false);

await window.loadHTML('<h1 nexfep-area-drag>Hello Nexfep!</h1>');
```

## Usage Guide

### Application

`Application` is the main entry point of the framework, responsible for managing the application lifecycle and providing access to windows, system tray, and logger.

```typescript
import { Application } from 'nexfep';

const app = new Application();
// or with custom WebView2 user data directory (Windows only)
const app = new Application({ WindowsWebview2UserDataFolder: 'C:\\custom\\webview2-data' });
// or with log file path
const app = new Application({ LogFilePath: './app.log' });
```

**Constructor Options**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `WindowsWebview2UserDataFolder` | `string` (optional) | `%LOCALAPPDATA%\NexfepDevelopment.webview2-data` | WebView2 user data directory (Windows only) |
| `LogFilePath` | `string` (optional) | none | File path for log output |

**Properties**

- `windows` — The `WindowPool` instance for managing browser windows
- `utils` — Utility methods (e.g., desktop notifications)
- `logger` — The `Logger` instance for logging

**Methods**

- `createTray(options)` — Create a system tray icon with context menu
- `exit()` — Exit the application

### Logger

The logger supports both file output and colored console output. It can be accessed via `app.logger`.

```typescript
app.logger.log('Hello World');
app.logger.error('An error occurred');
app.logger.warn('Warning message');
app.logger.info('Info message');
app.logger.debug('Debug message');
```

**Methods**

| Method | Description |
|--------|-------------|
| `log(message)` | Log a message |
| `error(message)` | Log an error message (red) |
| `warn(message)` | Log a warning message (yellow) |
| `info(message)` | Log an info message (blue) |
| `debug(message)` | Log a debug message (gray) |

Each method accepts either a string or an array of strings.

**Page Console Interception**

Console calls (`console.log`, `console.error`, `console.info`, `console.warn`, `console.debug`) in the page are automatically intercepted and forwarded to the main process logger, with the source window ID included in the output.

### Tray

Create and manage system tray icons with context menus via `app.createTray()`.

```typescript
import { readFileSync } from 'fs';

const tray = app.createTray({
  id: 'my-tray',
  tooltip: 'My App',
  icon: {
    data: readFileSync('./icon.png'),
    width: 32,
    height: 32,
  },
  menuItems: [
    { id: 'show', label: 'Show Window' },
    { id: 'quit', label: 'Quit' },
  ],
});
```

The `icon` field accepts a `TrayIconImage` object:

```typescript
interface TrayIconImage {
  data: Buffer;      // Image binary data
  width?: number;    // Optional width
  height?: number;   // Optional height
}
```

**Methods**

| Method                                      | Description                         |
|---------------------------------------------|-------------------------------------|
| `addMenuItem(item)`                         | Add a menu item                     |
| `removeMenuItem(id)`                        | Remove a menu item by ID            |
| `setMenuItems(items)`                       | Replace all menu items              |
| `setIcon(icon, width?, height?)`            | Change the tray icon (raw pixel data as `Uint8Array` / `number[]`) |
| `setTooltip(tooltip)`                       | Change the tooltip text             |
| `on(event, callback)`                       | Listen for tray events (e.g. `'click'`) |
| `show()`                                    | Show the tray icon                  |
| `hide()`                                    | Hide the tray icon                  |
| `destroy()`                                 | Destroy the tray icon               |

```typescript
tray.on('click', () => {
  console.log('Tray clicked');
});
tray.addMenuItem({ id: 'about', label: 'About' });
tray.setTooltip('Nexfep App');
```

### Notifications

Send desktop notifications via `app.utils.notify()`.

```typescript
const notification = app.utils.notify('Title', 'Notification body');
```

**Parameters**

- `title` — Notification title
- `body` (optional) — Notification body text

### Window Pool

`WindowPool` is the core management class of the framework, responsible for window creation and recycling.

```typescript
const pool = app.windows;
```

### Window Creation

```typescript
const win = await pool.createWindow(true, false);
```

**Parameters**

- `isShow` (boolean, default `true`) — Whether to immediately show the window
- `isDecorated` (boolean, default `true`) — Whether to use system window decorations. When set to `false`, the window has no border and requires a custom title bar

### Window Operations

```javascript
window.show();
window.hide();
window.maximize();
window.minimize();
window.close();
window.setTitle('New Title');
window.setSize(800, 600);
window.openDevTools();
```

### Custom Messages

#### Send Messages

Send messages via `window.postMessage` in the page:

```javascript
window.postMessage({ hello: 'world' });
```

**Parameters**

- `data` — Any serializable data, will be serialized to JSON string before sending

#### Listen for Messages

Receive messages via `onCustomMessage` callback in the main process:

```typescript
pool.onCustomMessage = (window, data) => {
  console.log(`Message from window ${window.id}:`, data);
};
```

**Callback Parameters**

- `window` — The window object that sent the message
- `data` — Message content, an object type (automatically converted from JSON string via `JSON.parse`)

### Custom Events

#### Invoke Events

Invoke events via `window.invoke` in the page:

```javascript
window.invoke('hello');
window.invoke('hello', 'world');
```

**Parameters**

- `event` — Event name
- `data` (optional) — Any serializable data, will be serialized to JSON string before sending

#### Listen for Events

Listen for events via `pool.handle` in the main process:

```typescript
pool.handle('hello', (data) => {
  console.log('Received event hello:', data);
});
```

**Parameters**

- `event` — Event name, must match the event name when invoking
- `callback` — Event handler function, receives event data as `data` parameter. Can return any serializable data, which will be serialized to JSON string and sent back to the frontend as the return value of `window.invoke` (can also return nothing)

#### Remove Event Listener

Remove event listener via `pool.unhandle` in the main process:

```typescript
pool.unhandle('hello', (data) => {
  console.log('Received event hello:', data);
});
```

**Parameters**

- `event` — Event name, must match the event name when listening
- `callback` — Event handler function, must match the callback function when listening

### Global Variables

#### Set Variables

Set a global variable via `window.setGlobal` in the page:

```javascript
window.setGlobal('hello', 'world');
```

**Parameters**

- `name` — Global variable name
- `value` — Global variable value, any serializable data, will be serialized to JSON string before sending

#### Get Variables

Get a global variable via `window.getGlobal` in the page:

```javascript
const value = await window.getGlobal('hello');
```

**Parameters**

- `name` — Global variable name

#### Global Variable Map

Get a `Map<string, any>` containing all global variables via `pool.global` in the main process, which supports operations like set and get:

```typescript
const globals = pool.global;
globals.set('hello', 'world');
const value = globals.get('hello');
```

### Inter-Window Communication

The framework supports direct communication between windows via `window.broadcast` and `window.tell`, without going through the main process.

#### Broadcast

Send an event to all other open windows via `window.broadcast`:

```javascript
window.broadcast('user-login', { userId: 123 });
```

**Parameters**

- `name` — Event name
- `data` (optional) — Any serializable data, will be serialized to JSON string before sending

Other windows listen for the broadcast event via `window.addEventListener`:

```javascript
window.addEventListener('user-login', (event) => {
  console.log('User logged in:', event.detail);
});
```

#### Tell

Send a message to a specific window by its ID via `window.tell`:

```javascript
window.tell(2, 'custom-message', { text: 'Hello Window 2' });
```

**Parameters**

- `to` — Target window ID (number)
- `message` — Event name
- `data` (optional) — Any serializable data, will be serialized to JSON string before sending

The target window receives the message via `window.addEventListener`:

```javascript
window.addEventListener('custom-message', (event) => {
  console.log('Received message:', event.detail);
});
```

Each window's ID can be accessed via `window.id`:

```javascript
console.log('This window ID:', window.id);
```

### Window Control Functions

The following injected functions can be directly called in the page for window control:

```javascript
window.close();              // Close window
window.minimize();           // Minimize window
window.unminimize();         // Restore minimized window
window.maximize();           // Maximize window
window.unmaximize();         // Restore maximized window
window.setTitle('Title');    // Set window title
window.openDevTools();       // Open developer tools
window.closeDevTools();      // Close developer tools
```

The following properties are also available in the page:

```javascript
console.log(window.id);                // Window unique identifier
console.log(window.isNexfepLoadDone);  // Whether the window has finished loading
```

### Drag Regions

Define window drag regions via HTML attributes without writing additional JavaScript code. These attributes automatically apply `-webkit-app-region` and `app-region` CSS properties.

#### `nexfep-area-drag`

Makes the entire region and all its child elements draggable. Suitable for scenarios like custom title bars where the entire region needs to be draggable.

```html
<div nexfep-area-drag>
  <h1>Title Bar</h1>
  <span>Subtitle</span>
</div>
```

#### `nexfep-element-drag`

Makes only the specified element itself draggable; child elements are not affected. Suitable for scenarios requiring precise control over the drag region.

```html
<div>
  <div nexfep-element-drag>Drag Handle</div>
  <p>This part is not draggable</p>
</div>
```

#### `nexfep-no-drag`

Makes the specified region and all its child elements non-draggable. Highest priority, can override parent element's drag attributes. Suitable for interactive elements like buttons and input fields.

```html
<div nexfep-area-drag>
  <h1>Title Bar</h1>
  <button nexfep-no-drag>Click Button</button>
</div>
```

#### `nexfep-auto-drag`

Automatically determines drag regions: the entire region is draggable, but common interactive elements (`button`, `input`, `select`, `textarea`, `a`) are automatically set to non-draggable. Suitable for complex regions containing multiple interactive elements.

```html
<div nexfep-auto-drag>
  <h1>Title Bar</h1>
  <button>Automatically non-draggable</button>
  <input placeholder="Automatically non-draggable" />
  <a href="#">Automatically non-draggable</a>
</div>
```

### Load Complete Event

The `nexfep-load-done` event is triggered after the WebView window finishes loading:

```javascript
window.addEventListener('nexfep-load-done', () => {
  console.log('Nexfep window loaded');
});
```

It can also be checked via the `window.isNexfepLoadDone` property:

```javascript
if (window.isNexfepLoadDone) {
  // Window is ready
}
```

## CLI

### `help`

Use the `help` command to get a list of available commands:

```bash
npx nexfep help
```

### `build`

Nexfep provides a command-line tool for building applications into standalone executables.

#### Usage

```bash
npx nexfep build [options]
```

#### Options

| Option | Description |
|--------|-------------|
| `-n, --name <name>` | Application name (default: from package.json) |
| `-e, --entry <file>` | Entry file path (default: from package.json main) |
| `-o, --output <dir>` | Output directory (default: dist) |
| `-i, --ignore <pattern>` | Files or directories to ignore (can be used multiple times) |
| `-c, --console` | Show console window on Windows (default: false) |
| `-r, --reinstall` | Reinstall production dependencies only before building |
| `-s, --skip-clean` | Skip cleaning old build files before building |
| `-u, --upx <level>` | Use UPX to compress the executable, level 0-9 (default: 0) |
| `-m, --meta, --metadata <file>` | Metadata file path (default: none) |

#### Examples

```bash
# Build using defaults from package.json
nexfep build

# Set custom application name and entry file
nexfep build -n my-app -e ./src/index.js

# Set custom output directory
nexfep build -o ./build

# Ignore multiple patterns
nexfep build -i node_modules -i test -i temp

# Build with UPX compression
nexfep build -u 7
```

This command uses [nexfpack](https://github.com/nexfteam/Nexfpack) to package your application into a standalone executable.

For `metadata` parameter, you can refer to [Nexfpack documentation](https://github.com/nexfteam/Nexfpack#Metadata) for details.

Please do not include the outer `metadata` field, just the internal fields. Like this:

```json
{ "1033": { "FileVersion": "..." } }
```

## API

### Application

| Method/Property | Parameters | Return Value | Description |
|----------------|-----------|--------------|-------------|
| `constructor(options?)` | `{ WindowsWebview2UserDataFolder?, LogFilePath? }` | Application | Creates the application instance |
| `windows` | / | WindowPool | The window pool instance |
| `utils` | / | \_\_Utils | Utility methods (notifications) |
| `logger` | / | Logger | The logger instance |
| `createTray(options)` | see Tray section | Tray | Creates a system tray icon |
| `exit()` | None | void | Exits the application |

### WindowPool

| Method/Property | Parameters | Return Value | Description |
|----------------|-----------|--------------|-------------|
| `createWindow(isShow?, isDecorated?)` | `isShow`: boolean (default true), `isDecorated`: boolean (default true) | Promise\<Window> | Creates and returns a window |
| `handle(event, callback)` | `event`: string, `callback`: (data: any) => any | None | Listens for the specified event |
| `unhandle(event, callback)` | `event`: string, `callback`: (data: any) => any | None | Removes the specified event listener |
| `global` | / | Map\<string, any> | A global variable map |
| `closeWindow(window)` | `window`: Window | Promise\<void> | Closes the specified window and returns it to the pool |
| `onCustomMessage` | `(window: Window, data: string) => void` | None | Custom message callback |

### Window

| Method/Property | Parameters | Return Value | Description |
|----------------|-----------|--------------|-------------|
| `loadURL(url)` | `url`: string — URL to load | Promise\<void> | Loads the specified URL |
| `loadHTML(html)` | `html`: string — HTML string | Promise\<void> | Loads the specified HTML content |
| `show()` | None | void | Shows the window |
| `hide()` | None | void | Hides the window |
| `maximize()` | None | void | Maximizes the window |
| `unMaximize()` | None | void | Restores the window (cancels maximize) |
| `minimize()` | None | void | Minimizes the window |
| `unMinimize()` | None | void | Restores the window (cancels minimize) |
| `close()` | None | void | Closes the window and returns to pool |
| `setTitle(title)` | `title`: string | void | Sets the window title |
| `setDecorated(isDecorated)` | `isDecorated`: boolean | void | Sets whether the window has borders and title bar |
| `resizable(resizable)` | `resizable`: boolean | void | Sets whether the window is resizable |
| `setSize(width, height)` | `width`: number, `height`: number | void | Sets the window size in pixels |
| `openDevTools()` | None | void | Opens developer tools |
| `closeDevTools()` | None | void | Closes developer tools |
| `id` | None | number | Unique window identifier, auto-incrementing |

## Development

```bash
pnpm install
pnpm run compile
```

## License

MIT License
