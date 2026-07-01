import { Application, TrayIcon, TrayIconImage } from '@webviewjs/webview';

class Tray {
    app: Application;
    tray: TrayIcon;
    menuItems: Array<{ id: string, label: string }>;
    destroyed: boolean;
    constructor(app: Application, options: { id: string, tooltip: string, icon: TrayIconImage | undefined, menuItems: Array<{ id: string, label: string }> }) {
        this.menuItems = options.menuItems;
        this.destroyed = false;
        this.app = app;
        this.tray = app.createTrayIcon({
            id: options.id,
            tooltip: options.tooltip,
            icon: options.icon,
            menu: {
                items: this.menuItems
            }
        })
    }
    __ErrorWhenDestroyed() {
        if (this.destroyed) {
            throw new Error('Tray has been destroyed');
        }
    }
    addMenuItem(item: { id: string, label: string }) {
        this.__ErrorWhenDestroyed();
        this.menuItems.push(item);
        this.tray.setMenu({ items: this.menuItems });
    }
    removeMenuItem(id: string) {
        this.__ErrorWhenDestroyed();
        this.menuItems = this.menuItems.filter(item => item.id !== id);
        this.tray.setMenu({ items: this.menuItems });
    }
    setMenuItems(items: Array<{ id: string, label: string }>) {
        this.__ErrorWhenDestroyed();
        this.menuItems = items;
        this.tray.setMenu({ items: this.menuItems });
    }
    setIcon(icon: Uint8Array<ArrayBuffer | SharedArrayBuffer> | number[], width?: number | null | undefined, height?: number | null | undefined) {
        this.__ErrorWhenDestroyed();
        this.tray.setIcon(icon, width, height);
    }
    on(event: string, callback: (event: any) => void) {
        this.__ErrorWhenDestroyed();
        this.tray.on(event, callback);
    }
    setTooltip(tooltip: string) {
        this.__ErrorWhenDestroyed();
        this.tray.setTooltip(tooltip);
    }
    hide() {
        this.__ErrorWhenDestroyed();
        this.tray.setVisible(false);
    }
    show() {
        this.__ErrorWhenDestroyed();
        this.tray.setVisible(true);
    }
    destroy() {
        this.__ErrorWhenDestroyed();
        this.tray.dispose();
        this.destroyed = true;
    }
}

export { Tray };
