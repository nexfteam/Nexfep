import { Application as WebviewApplication, TrayIconImage, Notification } from '@webviewjs/webview';
import { WindowPool } from './WindowManager.js';
import { Tray } from './Tray.js';
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
    utils: __Utils;
    constructor(WindowsWebview2UserDataFolder: string = path.join(process.env.LOCALAPPDATA || os.homedir(), 'NexfepDevelopment.webview2-data') ) {
        this.app = new WebviewApplication();
        this.utils = new __Utils(this.app);
        this.windows = new WindowPool(this.app, WindowsWebview2UserDataFolder);
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