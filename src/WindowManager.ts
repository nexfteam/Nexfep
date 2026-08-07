import { Application, BrowserWindow, Webview } from "@webviewjs/webview";
import { Logger } from "./Logger.js";
import { Icon } from "./Basics.js";
import os from "os";
import path from "path";
import fs from "fs";
class Window {
  window: BrowserWindow;
  webview: Webview;
  isOpen: boolean;
  isShow: boolean;
  isDecorated: boolean;
  id: number;
  private myPool: WindowPool;
  constructor(window: BrowserWindow, webview: Webview, id: number, myPool: WindowPool) {
    this.myPool = myPool;
    this.window = window;
    this.webview = webview;
    this.isOpen = false;
    this.isShow = false;
    this.isDecorated = false;
    this.id = id;
  }
  setLevel(level: -1 | 0 | 1) {
    if (level == -1) {
      this.window.setAlwaysOnTop(false);
      this.window.setAlwaysOnBottom(true);
      return;
    } else if (level == 0) {
      this.window.setAlwaysOnTop(false);
      this.window.setAlwaysOnBottom(false);
      return;
    } else if (level == 1) {
      this.window.setAlwaysOnTop(true);
      this.window.setAlwaysOnBottom(false);
      return;
    }
  }
  setFullScreen(isFullScreen: boolean, options?: { borderless?: boolean }) {
    if (isFullScreen) {
      if (options?.borderless) {
        this.window.setFullscreen(1);
      } else {
        this.window.setFullscreen(0);
      }
    } else {
      this.window.setFullscreen(null);
    }
  }
  setDecorated(isDecorated: boolean) {
    this.window.setDecorations(isDecorated);
    this.isDecorated = isDecorated;
  }
  setTitle(title: string) {
    this.window.setTitle(title);
  }
  setResizable(resizable: boolean) {
    this.window.setResizable(resizable);
  }
  maximize() {
    this.window.setMaximized(true);
  }
  minimize() {
    this.window.setMinimized(true);
  }
  unMaximize() {
    this.window.setMaximized(false);
  }
  unMinimize() {
    this.window.setMinimized(false);
  }
  isMaximized() {
    return this.window.isMaximized();
  }
  isMinimized() {
    return this.window.isMinimized();
  }
  toggleMaximize() {
    if (this.isMaximized()) {
      this.unMaximize();
    } else {
      this.maximize();
    }
  }
  toggleMinimize() {
    if (this.isMinimized()) {
      this.unMinimize();
    } else {
      this.minimize();
    }
  }
  openDevTools() {
    this.webview.openDevtools();
  }
  closeDevTools() {
    this.webview.closeDevtools();
  }
  setIcon(icon: Icon) {
    this.window.setWindowIcon(icon.data, icon.width, icon.height);
  }
  setSize(width: number, height: number) {
    this.window.setSize(width, height);
  }
  getSize() {
    return this.window.getInnerSize();
  }
  setPosition(x: number, y: number) {
    this.window.setPosition(x, y);
  }
  getPosition() {
    return this.window.getPosition();
  }
  isFocused() {
    return this.window.isFocused();
  }
  focus() {
    this.unMinimize();
    this.window.focus();
  }
  tell(message: string, data: any) {
    this.webview.evaluateScript(
      `window.dispatchEvent(new CustomEvent('${message}', { detail: ${JSON.stringify(data)} }));`,
    );
  }
  hide() {
    this.window.hide();
    this.isShow = false;
  }
  show() {
    this.window.show();
    this.isShow = true;
  }
  close() {
    this.myPool.closeWindow(this);
  }
  async loadURL(url: string) {
    await this.webview.loadUrl(url);
    await this.myPool.__injectControlFunctions(this);
  }
  async loadHTML(html: string) {
    await this.webview.loadHtml(html);
    await this.myPool.__injectControlFunctions(this);
  }
}
class WindowPool {
  onCustomMessage: (window: Window, message: string, data: any) => void;
  app: Application;
  logger: Logger;
  private windows: Window[];
  private handlers: Map<string, Array<(data: any) => any>>;
  private injectCount: number;
  private windowCount: number;
  private freeWindowCount: number;
  global: Map<string, any>;
  constructor(
    app: Application,
    options: { WindowsWebview2UserDataFolder?: string; logger?: Logger },
  ) {
    if (os.platform() === "win32") {
      const userDataDir: string =
        options.WindowsWebview2UserDataFolder ||
        path.join(process.env.LOCALAPPDATA || os.homedir(), "NexfepDevelopment.webview2-data");
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      process.env.WEBVIEW2_USER_DATA_FOLDER = userDataDir;
    }
    this.onCustomMessage = (window: Window, message: string, data: any) => {
      console.log("Get Custom Message:", message, data, "from window", window.id);
    };
    this.handlers = new Map();
    this.app = app;
    this.injectCount = 0;
    this.windows = [];
    this.windowCount = 0;
    this.freeWindowCount = 0;
    this.global = new Map();
    this.logger = options.logger || new Logger();
  }
  async __injectCode(window: Window, code: string) {
    await window.webview.evaluateScript(code);
  }
  async __injectControlFunctions(windowObj: Window) {
    const INJECT_CSS = `
        [nexfep-area-drag],
        [nexfep-area-drag] * {
            -webkit-app-region: drag;
            app-region: drag;
        }
        
        [nexfep-element-drag] {
            -webkit-app-region: drag;
            app-region: drag;
        }
        
        [nexfep-no-drag],
        [nexfep-no-drag] * {
            -webkit-app-region: no-drag !important;
            app-region: no-drag !important;
        }
        
        [nexfep-auto-drag],
        [nexfep-auto-drag] * {
            -webkit-app-region: drag;
            app-region: drag;
        }
        
        [nexfep-auto-drag] button,
        [nexfep-auto-drag] input,
        [nexfep-auto-drag] select,
        [nexfep-auto-drag] textarea,
        [nexfep-auto-drag] a {
            -webkit-app-region: no-drag;
            app-region: no-drag;
        }
        `;
    const INJECT_CODE = `
        window.addEventListener("beforeunload", () => {
            const MessageBody = { type: 'NexfepBeforeUnload' }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        });
        
        window.close = () => {
            const MessageBody = { type: 'NexfepCloseWindow' }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        };
        
        window.minimize = () => {
            const MessageBody = { type: 'NexfepMinimizeWindow' }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        };
        
        window.unminimize = () => {
            const MessageBody = { type: 'NexfepUnMinimizeWindow' }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        };
        
        window.maximize = () => {
            const MessageBody = { type: 'NexfepMaximizeWindow' }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        };
        
        window.unmaximize = () => {
            const MessageBody = { type: 'NexfepUnMaximizeWindow' }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        };

        window.toggleMaximize = () => {
            const MessageBody = { type: 'NexfepToggleMaximizeWindow' }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        };

        window.toggleMinimize = () => {
            const MessageBody = { type: 'NexfepToggleMinimizeWindow' }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        };
        window.setTitle = (title) => {
            const MessageBody = { type: 'NexfepSetTitle', title: title }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        };
        
        window.openDevTools = () => {
            const MessageBody = { type: 'NexfepOpenDevTools' }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        };
        
        window.closeDevTools = () => {
            const MessageBody = { type: 'NexfepCloseDevTools' }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        };

        window.eventCount = 0;

        window.invoke = async (event, data = null) => {
            const MessageBody = { type: 'NexfepInvoke', eventId: [${this.injectCount}, ++window.eventCount], event: event, data: data }
            window.ipc.postMessage(JSON.stringify(MessageBody));
            return new Promise((resolve, reject) => {
                window.addEventListener("nexfep-invoke-result-"+${this.injectCount}+"-"+window.eventCount, (event) => {
                    window.removeEventListener("nexfep-invoke-result-"+${this.injectCount}+"-"+window.eventCount, event);
                    if(event.detail){
                        resolve(event.detail);
                    }else{
                        resolve();
                    }
                });
            });
        }
        
        window.setGlobal = (name, value) => {
            const MessageBody = { type: 'NexfepSetGlobal', name: name, value: value }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        }

        window.getGlobal = (name) => {
            const MessageBody = { type: 'NexfepGetGlobal', eventId: [${this.injectCount}, ++window.eventCount], name: name }
            window.ipc.postMessage(JSON.stringify(MessageBody));
            return new Promise((resolve, reject) => {
                window.addEventListener("nexfep-get-global-result-"+${this.injectCount}+"-"+window.eventCount, (event) => {
                    window.removeEventListener("nexfep-get-global-result-"+${this.injectCount}+"-"+window.eventCount, event);
                    if(event.detail){
                        resolve(event.detail);
                    }else{
                        resolve();
                    }
                });
            });
        }

        window.broadcast = (name, data = null) => {
            const MessageBody = { type: 'NexfepBroadcast', name: name, data: data }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        }

        window.id = ${windowObj.id};

        window.tell = (to, message, data = null) => {
            const MessageBody = { type: 'NexfepTell', to: to, message: message, data: data }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        }

        window.__originConsoleLog = console.log;
        window.__originConsoleError = console.error;
        window.__originConsoleInfo = console.info;
        window.__originConsoleWarn = console.warn;
        window.__originConsoleDebug = console.debug;
        console.log = (...args) => {
            const MessageBody = { type: 'NexfepConsoleLog', message: args }
            window.ipc.postMessage(JSON.stringify(MessageBody));
            window.__originConsoleLog(...args);
        }
        console.error = (...args) => {
            const MessageBody = { type: 'NexfepConsoleError', message: args }
            window.ipc.postMessage(JSON.stringify(MessageBody));
            window.__originConsoleError(...args);
        }
        console.info = (...args) => {
            const MessageBody = { type: 'NexfepConsoleInfo', message: args }
            window.ipc.postMessage(JSON.stringify(MessageBody));
            window.__originConsoleInfo(...args);
        }
        console.warn = (...args) => {
            const MessageBody = { type: 'NexfepConsoleWarn', message: args }
            window.ipc.postMessage(JSON.stringify(MessageBody));
            window.__originConsoleWarn(...args);
        }
        console.debug = (...args) => {
            const MessageBody = { type: 'NexfepConsoleDebug', message: args }
            window.ipc.postMessage(JSON.stringify(MessageBody));
            window.__originConsoleDebug(...args);
        }
        
        const style = document.createElement('style');
        style.textContent = \`${INJECT_CSS}\`;
        document.head.appendChild(style);
        
        window.isNexfepLoadDone = true;

        window.dispatchEvent(new CustomEvent('nexfep-load-done'));
        `;
    await this.__injectCode(windowObj, INJECT_CODE);
  }
  async __createNewWindowObj(): Promise<Window> {
    return await new Promise((resolve) => {
      setImmediate(() => {
        const window = this.app.createBrowserWindow({
          title: "Nexfep Window",
          visible: false,
          focused: false,
        });
        this.freeWindowCount++;
        const webview = window.createWebview();
        const windowObj = new Window(window, webview, ++this.windowCount, this);
        this.windows.push(windowObj);
        webview.onIpcMessage((data) => {
          const dataText = data.body.toString();
          const dataObj = JSON.parse(dataText);
          if (dataObj.type == "NexfepBeforeUnload") {
            webview.evaluateScript(`
              if(window?.isNexfepLoadDone){
                const MessageBody = { type: 'NexfepBeforeUnload' }
                window.ipc.postMessage(JSON.stringify(MessageBody));
              }else{
                const MessageBody = { type: 'NexfepLoadFalse' }
                window.ipc.postMessage(JSON.stringify(MessageBody));
              }`);
          } else if (dataObj.type == "NexfepLoadFalse") {
            this.__injectControlFunctions(windowObj);
          } else if (dataObj.type == "NexfepCloseWindow") {
            this.closeWindow(windowObj);
          } else if (dataObj.type == "NexfepMinimizeWindow") {
            windowObj.minimize();
          } else if (dataObj.type == "NexfepUnMinimizeWindow") {
            windowObj.unMinimize();
          } else if (dataObj.type == "NexfepMaximizeWindow") {
            windowObj.maximize();
          } else if (dataObj.type == "NexfepUnMaximizeWindow") {
            windowObj.unMaximize();
          } else if (dataObj.type == "NexfepToggleMaximizeWindow") {
            windowObj.toggleMaximize();
          } else if (dataObj.type == "NexfepToggleMinimizeWindow") {
            windowObj.toggleMinimize();
          } else if (dataObj.type == "NexfepSetTitle") {
            windowObj.setTitle(dataObj.title);
          } else if (dataObj.type == "NexfepOpenDevTools") {
            windowObj.openDevTools();
          } else if (dataObj.type == "NexfepCloseDevTools") {
            windowObj.closeDevTools();
          } else if (dataObj.type == "NexfepInvoke") {
            const handlers = this.handlers.get(dataObj.event) || [];
            handlers.forEach(async (handler) => {
              const result = await handler(dataObj.data);
              if (result) {
                webview.evaluateScript(
                  `window.dispatchEvent(new CustomEvent('nexfep-invoke-result-${dataObj.eventId[0]}-${dataObj.eventId[1]}', { detail: ${JSON.stringify(result)} }));`,
                );
              } else {
                webview.evaluateScript(
                  `window.dispatchEvent(new CustomEvent('nexfep-invoke-result-${dataObj.eventId[0]}-${dataObj.eventId[1]}', { detail: undefined }));`,
                );
              }
            });
          } else if (dataObj.type == "NexfepSetGlobal") {
            this.global.set(dataObj.name, dataObj.value);
          } else if (dataObj.type == "NexfepGetGlobal") {
            const value = this.global.get(dataObj.name);
            webview.evaluateScript(
              `window.dispatchEvent(new CustomEvent('nexfep-get-global-result-${dataObj.eventId[0]}-${dataObj.eventId[1]}', { detail: ${JSON.stringify(value)} }));`,
            );
          } else if (dataObj.type == "NexfepBroadcast") {
            this.windows.forEach(async (w) => {
              if (w != windowObj && w.isOpen) {
                w.webview.evaluateScript(
                  `window.dispatchEvent(new CustomEvent('${dataObj.name}', { detail: ${JSON.stringify(dataObj.data)} }));`,
                );
              }
            });
          } else if (dataObj.type == "NexfepTell") {
            if (dataObj.to == 0) {
              this.onCustomMessage(windowObj, dataObj.message, dataObj.data);
            }
            this.windows.forEach(async (w) => {
              if (w.id == dataObj.to) {
                w.webview.evaluateScript(
                  `window.dispatchEvent(new CustomEvent('${dataObj.message}', { detail: ${JSON.stringify(dataObj.data)} }));`,
                );
              }
            });
          } else if (dataObj.type == "NexfepConsoleLog") {
            this.logger.__printLog(windowObj.id, "Log", dataObj.message);
          } else if (dataObj.type == "NexfepConsoleError") {
            this.logger.__printLog(windowObj.id, "Error", dataObj.message, "\x1b[31m", "\x1b[0m");
          } else if (dataObj.type == "NexfepConsoleInfo") {
            this.logger.__printLog(windowObj.id, "Info", dataObj.message, "\x1b[34m", "\x1b[0m");
          } else if (dataObj.type == "NexfepConsoleWarn") {
            this.logger.__printLog(windowObj.id, "Warn", dataObj.message, "\x1b[33m", "\x1b[0m");
          } else if (dataObj.type == "NexfepConsoleDebug") {
            this.logger.__printLog(windowObj.id, "Debug", dataObj.message, "\x1b[90m", "\x1b[0m");
          }
        });
        resolve(windowObj);
      });
    });
  }
  async createWindow(options?: {
    visible?: boolean;
    decoration?: boolean;
    title?: string;
    icon?: Icon;
    resizable?: boolean;
    width?: number;
    height?: number;
  }) {
    const window =
      this.windows.find((w) => w.isOpen === false) || (await this.__createNewWindowObj());
    this.freeWindowCount--;
    if (window) {
      window.isOpen = true;
      window.isShow = options?.visible ?? true;
      window.setDecorated(options?.decoration ?? true);
      if (options?.visible ?? true) {
        window.show();
      }
      window.setTitle(options?.title ?? "Nexfep Window");
      if (options?.icon) {
        window.setIcon(options?.icon);
      }
      window.setResizable(options?.resizable ?? true);
      window.setSize(options?.width ?? 800, options?.height ?? 600);
    }
    if (this.freeWindowCount == 0) {
      this.__createNewWindowObj();
    }
    return window;
  }
  async closeWindow(window: Window) {
    if (window.isOpen) {
      window.isOpen = false;
      window.isShow = false;
      window.setDecorated(true);
      window.hide();
      await window.loadHTML("<!DOCTYPE html><html><head></head><body></body></html>");
      this.freeWindowCount++;
    } else {
      throw new Error("Window is not open");
    }
  }
  async handle(event: string, callback: (data: any) => any) {
    this.handlers.set(event, [...(this.handlers.get(event) || []), callback]);
  }
  async unhandle(event: string, callback: (data: any) => any) {
    this.handlers.set(
      event,
      (this.handlers.get(event) || []).filter((c) => c !== callback),
    );
  }
  async broadcast(event: string, data: any) {
    this.windows.forEach(async (w) => {
      if (w.isOpen) {
        w.webview.evaluateScript(
          `window.dispatchEvent(new CustomEvent('${event}', { detail: ${JSON.stringify(data)} }));`,
        );
      }
    });
  }
}

export { WindowPool, Window };
