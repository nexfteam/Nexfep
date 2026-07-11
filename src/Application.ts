import { Application as WebviewApplication, TrayIconImage, Notification } from '@webviewjs/webview';
import { WindowPool } from './WindowManager.js';
import { Tray } from './Tray.js';
import { Logger } from './Logger.js';
import path from 'path';
import os from 'os';
class __Utils {
    app: WebviewApplication;
    constructor(app: WebviewApplication) {
        this.app = app;
    }
    notify(title: string, body?: string) {
        const notification = new Notification(title, { body });
        return notification;
    }
}
class Application {
    app: WebviewApplication;
    windows: WindowPool;
    logger: Logger;
    utils: __Utils;
    constructor(options: { WindowsWebview2UserDataFolder?: string, LogFilePath?: string }) {
        this.app = new WebviewApplication();
        this.utils = new __Utils(this.app);
        this.logger = new Logger(options.LogFilePath);
        const poolOptions = {WindowsWebview2UserDataFolder: options.WindowsWebview2UserDataFolder, logger: this.logger};
        this.windows = new WindowPool(this.app, poolOptions);
        this.app.whenReady();
    }
    createTray(options: { id: string, tooltip: string, icon: TrayIconImage | undefined, menuItems: Array<{ id: string, label: string }> }) {
        return new Tray(this.app, options);
    }
    exit(){
        this.app.exit();
    }
}

export { Application };