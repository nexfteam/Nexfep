export default class TimeTyper {
    typerKilled;
    msg;
    constructor(msg) {
        this.typerKilled = false;
        this.msg = msg;
        this.typeTime(0);
    }
    typeTime(seconds) {
        if (this.typerKilled) {
            this.typerKilled = false;
            return;
        }
        console.log(`\x1b[1A\x1b[2K(${seconds}s) ${this.msg}`);
        setTimeout(() => {
            this.typeTime(seconds + 1);
        }, 1000);
    }
    async waitForReset(resolve) {
        if (!this.typerKilled) {
            resolve();
        } else {
            setTimeout(() => {
                this.waitForReset(resolve);
            }, 10);
        }
    }
    async kill() {
        this.typerKilled = true;
        await new Promise(this.waitForReset.bind(this));
    }
}