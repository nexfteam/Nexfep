import fs from "fs";
import { TrayIconImage } from "@webviewjs/webview";
class Icon {
  data: Uint8Array;
  width?: number;
  height?: number;
  constructor(data: Uint8Array, width?: number, height?: number) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
  static from(
    input:
      | string
      | Buffer
      | Uint8Array
      | { data: Uint8Array; width?: number; height?: number }
      | { data: Buffer; width?: number; height?: number },
  ): Icon {
    if (typeof input === "string") {
      return new Icon(new Uint8Array(fs.readFileSync(input)));
    } else if (input instanceof Uint8Array) {
      return new Icon(input);
    } else if (input instanceof Buffer) {
      return new Icon(new Uint8Array(input));
    } else if (typeof input === "object" && input.data instanceof Uint8Array) {
      return new Icon(input.data, input.width, input.height);
    } else if (typeof input === "object" && input.data instanceof Buffer) {
      return new Icon(new Uint8Array(input.data), input.width, input.height);
    }
    throw new Error("Unsupported input type");
  }

  toTrayIconImage(): TrayIconImage {
    return { data: Buffer.from(this.data), width: this.width, height: this.height };
  }

  toBuffer(): Buffer {
    return Buffer.from(this.data);
  }
}

export { Icon };
