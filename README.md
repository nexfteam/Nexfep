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
- **TypeScript Support** — Complete type definitions for excellent development experience

## Installation

```bash
pnpm add nexfep
```

## Quick Start

```typescript
import { WindowPool } from 'nexfep';

const pool = new WindowPool();

const window = await pool.createWindow(true, false);

await window.loadHTML('<h1 nexfep-area-drag>Hello Nexfep!</h1>');

pool.mainloop();
```

## Usage Guide

### Window Pool

`WindowPool` is the core management class of the framework, responsible for window creation and recycling.

```typescript
const pool = new WindowPool();
```

**Constructor Parameters**

- `WindowsWebview2UserDataFolder` (optional) — WebView2 user data directory, defaults to `%LOCALAPPDATA%\NexfepDevelopment.webview2-data`

### Window Creation

```typescript
const win = await pool.createWindow(true, false);
```

**Parameters**

- `isShow` (boolean, default `true`) — Whether to immediately show the window
- `isDecorated` (boolean, default `true`) — Whether to use system window decorations. When set to `false`, the window has no border and requires a custom title bar

### Window Operations

```typescript
window.show();
window.hide();
window.maximize();
window.minimize();
window.close();
window.setTitle('New Title');
window.openDevTools();
```

### IPC Communication

The framework automatically injects a series of control functions after WebView page loading is complete. It is recommended to use these injected functions for IPC communication, rather than the native IPC wrapped by `@webviewjs/webview`.

#### Send Custom Messages

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

#### Invoke Custom Events

Invoke events via `window.invoke` in the page:

```javascript
window.invoke('hello', 'world');
```

**Parameters**

- `event` — Event name
- `data` — Any serializable data, will be serialized to JSON string before sending

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

#### Window Control Functions

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

## API

### WindowPool

| Method/Property                       | Parameters                                                                 | Return Value     | Description                                                              |
| ------------------------------------- | -------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| `constructor(userDataFolder?)`        | `userDataFolder`: string (optional)                                        | WindowPool       | Creates a window pool, optionally specifying the WebView2 user data directory |
| `createWindow(isShow?, isDecorated?)` | `isShow`: boolean (default true), `isDecorated`: boolean (default true)    | Promise\<Window> | Creates and returns a window                                             |
| `handle(event, callback)`            | `event`: string, `callback`: (data: string) => void                       | None             | Listens for the specified event, triggers callback when event is received   |
| `unhandle(event, callback)`           | `event`: string, `callback`: (data: string) => void                       | None             | Removes the specified callback from the event listener                     |
| `closeWindow(window)`                 | `window`: Window                                                           | Promise\<void>   | Closes the specified window and returns it to the pool                   |
| `closePool()`                         | None                                                                       | Promise\<void>   | Closes the window pool and exits the application                         |
| `mainloop()`                          | None                                                                       | void             | Starts the application main loop, blocking until the application exits   |
| `onCustomMessage`                     | `(window: Window, data: string) => void`                                   | None             | Custom message callback, triggered when receiving custom messages from pages |

### Window

| Method/Property                       | Parameters                                  | Return Value     | Description                              |
| ------------------------------------- | ------------------------------------------- | ---------------- | ---------------------------------------- |
| `loadURL(url)`                        | `url`: string — URL to load                 | Promise\<void>   | Loads the specified URL                 |
| `loadHTML(html)`                      | `html`: string — HTML string                | Promise\<void>   | Loads the specified HTML content        |
| `show()`                              | None                                        | void             | Shows the window                         |
| `hide()`                              | None                                        | void             | Hides the window                         |
| `maximize()`                          | None                                        | void             | Maximizes the window                     |
| `unMaximize()`                        | None                                        | void             | Restores the window (cancels maximize)   |
| `minimize()`                          | None                                        | void             | Minimizes the window                     |
| `unMinimize()`                        | None                                        | void             | Restores the window (cancels minimize)   |
| `close()`                             | None                                        | void             | Closes the window and returns to pool    |
| `setTitle(title)`                     | `title`: string — Window title              | void             | Sets the window title                   |
| `setDecorated(isDecorated)`           | `isDecorated`: boolean — Use system decorations | void          | Sets whether the window has borders and title bar |
| `resizable(resizable)`                | `resizable`: boolean — Resizable            | void             | Sets whether the window is resizable     |
| `openDevTools()`                      | None                                        | void             | Opens developer tools                   |
| `closeDevTools()`                     | None                                        | void             | Closes developer tools                  |
| `id`                                  | None                                        | number           | Unique window identifier, auto-incrementing |

## Development

```bash
pnpm install
pnpm run compile
```

## License

MIT License
