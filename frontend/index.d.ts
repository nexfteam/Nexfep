export {};

declare global {
  interface Window {
    tell: (to: number, message: string, data?: any) => void;
    broadcast: (message: string, data?: any) => void;
    invoke: (event: string, data?: any) => Promise<any>;
    close: () => void;
    minimize: () => void;
    unminimize: () => void;
    toggleMaximize: () => void;
    toggleMinimize: () => void;
    maximize: () => void;
    unmaximize: () => void;
    setTitle: (title: string) => void;
    openDevTools: () => void;
    closeDevTools: () => void;
    setGlobal: (name: string, value: any) => void;
    getGlobal: (name: string) => Promise<any>;
    id: number;
    isNexfepLoadDone: boolean;
  }
}
