import { SingleInstance } from "@nexfteam/single-instance";

class Locker {
  locker: SingleInstance;
  constructor(appName: string) {
    this.locker = new SingleInstance(appName);
  }
  lock(data?: string) {
    return this.locker.lock(data);
  }
  unlock() {
    return this.locker.unlock();
  }
  whenLost(callback: (data?: string) => void) {
    this.locker.on("connection-attempt", callback);
  }
}

export { Locker };
