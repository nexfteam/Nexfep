import fs from 'fs';
class Logger {
    logFilePath: string | undefined;
    constructor(logFilePath?: string) {
        this.logFilePath = logFilePath;
    }
    
    __formatConsoleArgs(args: string[]): string {
        if (!Array.isArray(args) || args.length === 0) return '';
        const template = args[0];
        if (typeof template !== 'string' || !template.includes('%c')) {
            return args.map(String).join(' ');
        }

        const RESET = '\x1b[0m';
        const parts = template.split(/(%c)/);
        let styleArgIndex = 1;
        let result = '';
        let currentAnsiStyle = '';

        // 命名前景色映射
        const fgColors: Record<string, string> = {
            black: '\x1b[30m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m',
            gray: '\x1b[90m',
            grey: '\x1b[90m',
            lightred: '\x1b[91m',
            lightgreen: '\x1b[92m',
            lightyellow: '\x1b[93m',
            lightblue: '\x1b[94m',
            lightmagenta: '\x1b[95m',
            lightcyan: '\x1b[96m',
            lightwhite: '\x1b[97m',
        };

        // 命名背景色映射
        const bgColors: Record<string, string> = {
            black: '\x1b[40m',
            red: '\x1b[41m',
            green: '\x1b[42m',
            yellow: '\x1b[43m',
            blue: '\x1b[44m',
            magenta: '\x1b[45m',
            cyan: '\x1b[46m',
            white: '\x1b[47m',
        };

        // 文字样式：加粗、斜体、下划线
        const textStyles: Record<string, string> = {
            'bold': '\x1b[1m',
            'font-weight:bold': '\x1b[1m',
            'italic': '\x1b[3m',
            'font-style:italic': '\x1b[3m',
            'underline': '\x1b[4m',
            'text-decoration:underline': '\x1b[4m',
            'none': RESET,
        };

        /** hex/rgb 转 ANSI 24位真彩色 */
        function colorToAnsi(colorVal: string, isBg = false): string {
            let val = colorVal.trim().toLowerCase();
            // 命名色
            const colorMap = isBg ? bgColors : fgColors;
            if (colorMap[val]) return colorMap[val];

            // hex #fff #ffffff
            const hexReg = /^#([0-9a-f]{3}|[0-9a-f]{6})$/;
            if (hexReg.test(val)) {
                let hex = val.replace('#', '');
                if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                return isBg ? `\x1b[48;2;${r};${g};${b}m` : `\x1b[38;2;${r};${g};${b}m`;
            }

            // rgb(r,g,b)
            const rgbReg = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
            const rgbMatch = val.match(rgbReg);
            if (rgbMatch) {
                const [, r, g, b] = rgbMatch;
                return isBg ? `\x1b[48;2;${r};${g};${b}m` : `\x1b[38;2;${r};${g};${b}m`;
            }

            return '';
        }

        /** 解析CSS样式字符串为ANSI序列 */
        function parseColorStyle(styleStr: string): string {
            if (!styleStr) return RESET;
            let ansi = '';
            const rules = styleStr.split(';').map(s => s.trim()).filter(Boolean);

            for (const rule of rules) {
                const [prop, ...rest] = rule.split(':');
                const propKey = prop.trim().toLowerCase();
                const value = rest.join(':').trim().toLowerCase();

                // 文字样式
                if (textStyles[`${propKey}:${value}`] || textStyles[value]) {
                    ansi += textStyles[`${propKey}:${value}`] ?? textStyles[value];
                    continue;
                }

                // 前景色
                if (propKey === 'color') {
                    ansi += colorToAnsi(value, false);
                    continue;
                }

                // 背景色
                if (propKey === 'background' || propKey === 'background-color') {
                    ansi += colorToAnsi(value, true);
                    continue;
                }
            }
            return ansi;
        }

        for (const segment of parts) {
            if (segment === '%c') {
                // 取出下一个样式参数，参数不足则重置样式
                const styleStr = args[styleArgIndex];
                styleArgIndex++;
                currentAnsiStyle = parseColorStyle(String(styleStr ?? ''));
            } else {
                if (segment === '') continue;
                if (currentAnsiStyle) {
                    result += currentAnsiStyle + segment;
                } else {
                    result += segment;
                }
            }
        }

        // 全局末尾统一重置，防止后续日志被染色
        if (currentAnsiStyle) result += RESET;

        // 剩余非样式参数直接拼接
        const extraArgs = args.slice(styleArgIndex);
        if (extraArgs.length) {
            result += ' ' + extraArgs.map(String).join(' ');
        }

        return result;
    }
    __printLog(winid: number, type: string, args: string[], colorANSI?: string, colorRESET?: string): void {
        if(this.logFilePath){
            fs.appendFileSync(this.logFilePath, `${new Date().toISOString()} [${winid}] ${type}: ${args.join(' ')}\n`);
        }
        console.log(`${colorANSI || ''}[${winid}] ${type}:${colorRESET || ''}`, this.__formatConsoleArgs(args));
    }
    log(args: string[] | string): void {
        if (Array.isArray(args)) {
            this.__printLog(0, 'Log', args);
        } else {
            this.__printLog(0, 'Log', [args]);
        }
    }
    error(args: string[] | string): void {
        if (Array.isArray(args)) {
            this.__printLog(0, 'Error', args, '\x1b[31m', '\x1b[0m');
        } else {
            this.__printLog(0, 'Error', [args], '\x1b[31m', '\x1b[0m');
        }
    }
    warn(args: string[] | string): void {
        if (Array.isArray(args)) {
            this.__printLog(0, 'Warn', args, '\x1b[33m', '\x1b[0m');
        } else {
            this.__printLog(0, 'Warn', [args], '\x1b[33m', '\x1b[0m');
        }
    }
    info(args: string[] | string): void {
        if (Array.isArray(args)) {
            this.__printLog(0, 'Info', args, '\x1b[34m', '\x1b[0m');
        } else {
            this.__printLog(0, 'Info', [args], '\x1b[34m', '\x1b[0m');
        }
    }
    debug(args: string[] | string): void {
        if (Array.isArray(args)) {
            this.__printLog(0, 'Debug', args, '\x1b[90m', '\x1b[0m');
        } else {
            this.__printLog(0, 'Debug', [args], '\x1b[90m', '\x1b[0m');
        }
    }
}

export { Logger }