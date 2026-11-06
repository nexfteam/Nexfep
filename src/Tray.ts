import { Application, TrayIcon } from "@webviewjs/webview";
import { Icon } from "./Basics.js";
class Tray {
  app: Application;
  tray: TrayIcon;
  menuItems: Array<{ id: string; label: string }>;
  destroyed: boolean;
  constructor(
    app: Application,
    options: {
      id: string;
      tooltip: string;
      icon?: Icon;
      menuItems: Array<{ id: string; label: string }>;
    },
  ) {
    this.menuItems = options.menuItems;
    this.destroyed = false;
    this.app = app;
    this.tray = app.createTrayIcon({
      id: options.id,
      tooltip: options.tooltip,
      icon: options.icon?.toTrayIconImage(),
      menu: {
        items: this.menuItems,
      },
    });
  }
  /** @internal */
  _ErrorWhenDestroyed() {
    if (this.destroyed) {
      throw new Error("Tray has been destroyed");
    }
  }
  addMenuItem(item: { id: string; label: string }) {
    this._ErrorWhenDestroyed();
    this.menuItems.push(item);
    this.tray.setMenu({ items: this.menuItems });
  }
  removeMenuItem(id: string) {
    this._ErrorWhenDestroyed();
    this.menuItems = this.menuItems.filter((item) => item.id !== id);
    this.tray.setMenu({ items: this.menuItems });
  }
  setMenuItems(items: Array<{ id: string; label: string }>) {
    this._ErrorWhenDestroyed();
    this.menuItems = items;
    this.tray.setMenu({ items: this.menuItems });
  }
  setIcon(icon: Icon) {
    this._ErrorWhenDestroyed();
    this.tray.setIcon(icon.data, icon.width, icon.height);
  }
  on(event: string, callback: (event: any) => void) {
    this._ErrorWhenDestroyed();
    this.tray.on(event, callback);
  }
  setTooltip(tooltip: string) {
    this._ErrorWhenDestroyed();
    this.tray.setTooltip(tooltip);
  }
  hide() {
    this._ErrorWhenDestroyed();
    this.tray.setVisible(false);
  }
  show() {
    this._ErrorWhenDestroyed();
    this.tray.setVisible(true);
  }
  destroy() {
    this._ErrorWhenDestroyed();
    this.tray.dispose();
    this.destroyed = true;
  }
}

export { Tray };
