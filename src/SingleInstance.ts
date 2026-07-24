import { SingleInstance } from "@nexfteam/single-instance";

class Locker {
  locker: SingleInstance;
  constructor(appName: string) {
    this.locker = new SingleInstance(appName);
  }
  lock() {
    return this.locker.lock();
  }
  unlock() {
    return this.locker.unlock();
  }
  whenLost(callback: () => void) {
    this.locker.on("connection-attempt", callback);
  }
}

export { Locker };
