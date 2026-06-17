import { BrowserWindow, Webview } from "@webviewjs/webview";
declare class Window {
    window: BrowserWindow;
    webview: Webview;
    isOpen: boolean;
    isShow: boolean;
    isDecorated: boolean;
    id: number;
    private myPool;
    constructor(window: BrowserWindow, webview: Webview, id: number, myPool: WindowPool);
    setDecorated(isDecorated: boolean): void;
    setTitle(title: string): void;
    resizable(resizable: boolean): void;
    maximize(): void;
    minimize(): void;
    unMaximize(): void;
    unMinimize(): void;
    openDevTools(): void;
    closeDevTools(): void;
    hide(): void;
    show(): void;
    close(): void;
    loadURL(url: string): Promise<void>;
    loadHTML(html: string): Promise<void>;
}
declare class WindowPool {
    onCustomMessage: (window: Window, data: string) => void;
    private app;
    private windows;
    private windowCount;
    private freeWindowCount;
    constructor(WindowsWebview2UserDataFolder?: string);
    __injectCode(window: Window, code: string): Promise<void>;
    __injectControlFunctions(windowObj: Window): Promise<void>;
    __createNewWindowObj(): Promise<Window>;
    createWindow(isShow?: boolean, isDecorated?: boolean): Promise<Window>;
    closeWindow(window: Window): Promise<void>;
    closePool(): Promise<void>;
    mainloop(): void;
}
export { WindowPool, Window };