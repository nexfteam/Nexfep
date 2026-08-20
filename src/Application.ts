import { Application as WebviewApplication, Notification } from "@webviewjs/webview";
import { WindowPool } from "./WindowManager.js";
import { Tray } from "./Tray.js";
import { Logger } from "./Logger.js";
import { Locker } from "./SingleInstance.js";
import { Icon } from "./Basics.js";
class __Utils {
  app: Application;
  constructor(app: Application) {
    this.app = app;
  }
  notify(title: string, options?: { body?: string }) {
    const notification = new Notification(title, { body: options?.body });
    return notification;
  }
  async openFileDialog(options?: { multiple?: boolean; title?: string; filters?: Array<{ name: string; extensions: Array<string> }> }) {
    const tempWin = await this.app.windows.createWindow({ visible: false });
    const result = tempWin.window.openFileDialog(options);
    tempWin.close();
    return result;
  }
}
class Application {
  app: WebviewApplication;
  windows: WindowPool;
  logger: Logger;
  utils: __Utils;

  constructor(options: { WindowsWebview2UserDataFolder?: string; LogFilePath?: string; localProxys?: Array<{ protocolName: string; localPath: string }> } = {}) {
    this.app = new WebviewApplication();
    this.utils = new __Utils(this);
    this.logger = new Logger(options.LogFilePath);
    const poolOptions = {
      WindowsWebview2UserDataFolder: options.WindowsWebview2UserDataFolder,
      logger: this.logger,
      localProxys: options.localProxys,
    };
    this.windows = new WindowPool(this.app, poolOptions);
    this.app.whenReady();
  }
  createTray(options: {
    id: string;
    tooltip: string;
    icon?: Icon;
    menuItems: Array<{ id: string; label: string }>;
  }) {
    return new Tray(this.app, options);
  }
  createLocker(appName: string) {
    return new Locker(appName);
  }
  exit() {
    this.app.exit();
  }
}

export { Application };
export * from "./Basics.js";
