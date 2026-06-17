import { Application, BrowserWindow, Webview } from "@webviewjs/webview";
import os from 'os';
import path from 'path';
import fs from 'fs';

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
    setDecorated(isDecorated: boolean){
        this.window.setDecorations(isDecorated);
        this.isDecorated = isDecorated;
    }
    setTitle(title: string){
        this.window.setTitle(title);
    }
    resizable(resizable: boolean){
        this.window.setResizable(resizable);
    }
    maximize(){
        this.window.setMaximized(true);
    }
    minimize(){
        this.window.setMinimized(true);
    }
    unMaximize(){
        this.window.setMaximized(false);
    }
    unMinimize(){
        this.window.setMinimized(false);
    }
    openDevTools(){
        this.webview.openDevtools();
    }
    closeDevTools(){
        this.webview.closeDevtools();
    }
    hide(){
        this.window.hide();
        this.isShow = false;
    }
    show(){
        this.window.show();
        this.isShow = true;
    }
    close(){
        this.myPool.closeWindow(this);
    }
    async loadURL(url: string){
        await this.webview.loadUrl(url);
        await this.myPool.__injectControlFunctions(this);
    }
    async loadHTML(html: string){
        console.log("Before loadHTML");
        await this.webview.loadHtml(html);
        await this.myPool.__injectControlFunctions(this);
        console.log("After loadHTML");
    }
}
class WindowPool {
    onCustomMessage: (window: Window, data: string) => void;
    private app: Application;
    private windows: Window[];
    private windowCount: number;
    private freeWindowCount: number;
    constructor(WindowsWebview2UserDataFolder: string = path.join(process.env.LOCALAPPDATA || os.homedir(), 'NexfepDevelopment.webview2-data') ) {
        if (os.platform() === 'win32') {
            // 设置 WebView2 用户数据目录（仅 Windows 需要此配置）
            const userDataDir = WindowsWebview2UserDataFolder;
            if (!fs.existsSync(userDataDir)) {
                fs.mkdirSync(userDataDir, { recursive: true });
            }
            process.env.WEBVIEW2_USER_DATA_FOLDER = userDataDir;
            console.log('WebView2 user data folder:', userDataDir);
        }
        this.onCustomMessage = (window: Window, data: string) => {
            console.log('Get Custom Message:', data, "from window", window.id);
        };
        this.app = new Application();
        this.windows = [];
        this.windowCount = 0;
        this.freeWindowCount = 0;
    }
    async __injectCode(window: Window, code: string){
        await window.webview.evaluateScript(code);
    }
    async __injectControlFunctions(windowObj: Window) {
        console.log("Create INJECT_CODE");
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
        `
        const INJECT_CODE = 
        `
        // 事件监听
        window.addEventListener("beforeunload", () => {
            const MessageBody = { type: 'NexfepBeforeUnload' }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        });
        
        // 窗口控制函数
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

        window.postMessage = (data) => {
            const MessageBody = { type: 'CustomMessage', data: data }
            window.ipc.postMessage(JSON.stringify(MessageBody));
        };
        
        // 注入 CSS 样式
        const style = document.createElement('style');
        style.textContent = \`${INJECT_CSS}\`;
        document.head.appendChild(style);
        
        // 标记加载完成
        window.isNexfepLoadDone = true;

        // 触发加载完成事件
        window.dispatchEvent(new Event('nexfep-load-done'));
        `
        console.log("Before inject code INJECT_CODE");
        await this.__injectCode(windowObj, INJECT_CODE);
        console.log("After inject control functions");
    }
    async __createNewWindowObj() {
        const window = this.app.createBrowserWindow({ title: "Nexfep" });
        window.hide();
        this.freeWindowCount++;
        const webview = window.createWebview();
        const windowObj = new Window(window, webview, ++this.windowCount, this);
        this.windows.push(windowObj);
        webview.onIpcMessage((data) => {
            const dataText = data.body.toString();
            const dataObj = JSON.parse(dataText);
            if (dataObj.type == 'NexfepBeforeUnload') {
                webview.evaluateScript(
                `if(window?.isNexfepLoadDone){
                    const MessageBody = { type: 'NexfepBeforeUnload' }
                    window.ipc.postMessage(JSON.stringify(MessageBody));
                }else{
                    const MessageBody = { type: 'NexfepLoadFalse' }
                    window.ipc.postMessage(JSON.stringify(MessageBody));
                }`)
            } else if (dataObj.type == 'NexfepLoadFalse') {
                this.__injectControlFunctions(windowObj);
            } else if (dataObj.type == 'NexfepCloseWindow') {
                this.closeWindow(windowObj);
            } else if (dataObj.type == 'NexfepMinimizeWindow') {
                window.setMinimized(true);
            } else if (dataObj.type == 'NexfepUnMinimizeWindow') {
                window.setMinimized(false);
            } else if (dataObj.type == 'NexfepMaximizeWindow') {
                window.setMaximized(true);
            } else if (dataObj.type == 'NexfepUnMaximizeWindow') {
                window.setMaximized(false);
            } else if (dataObj.type == 'NexfepSetTitle') {
                window.setTitle(dataObj.title);
            } else if (dataObj.type == 'NexfepOpenDevTools') {
                webview.openDevtools();
            } else if (dataObj.type == 'NexfepCloseDevTools') {
                webview.closeDevtools();
            } else if (dataObj.type == 'CustomMessage') {
                this.onCustomMessage(windowObj, dataObj.data);
            }
        });
        return windowObj;
    }
    async createWindow(isShow: boolean = true, isDecorated: boolean = true){
        const window = this.windows.find(w => w.isOpen === false) || await this.__createNewWindowObj();
        this.freeWindowCount--;
        if(window){
            window.isOpen = true;
            window.isShow = isShow;
            window.setDecorated(isDecorated);
            if(isShow){
                window.show();
            }
        }
        if(this.freeWindowCount == 0){
            await this.__createNewWindowObj();
        }
        return window;
    }
    async closeWindow(window: Window){
        if(window.isOpen){
            window.isOpen = false;
            window.isShow = false;
            window.setDecorated(true);
            window.hide();
            await window.loadHTML("<!DOCTYPE html><html><head></head><body></body></html>");
            this.freeWindowCount++;
        }else{
            throw new Error("Window is not open");
        }
    }
    async closePool(){
        this.app.exit();
    }
    mainloop(){
        this.app.run();
    }
}

export { WindowPool, Window };