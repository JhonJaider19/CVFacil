import * as Crypto from "expo-crypto";

declare const global: { crypto?: { subtle?: any; getRandomValues?: any } };

const subtle: { digest: (algorithm: string, data: BufferSource) => Promise<ArrayBuffer> } = {
  async digest(algorithm: string, data: BufferSource): Promise<ArrayBuffer> {
    return Crypto.digest(algorithm as any, data);
  },
};

const g = global as any;
if (typeof g.crypto === "undefined") {
  g.crypto = {};
}
if (typeof g.crypto.subtle === "undefined") {
  g.crypto.subtle = subtle;
}
if (typeof g.crypto.getRandomValues === "undefined") {
  g.crypto.getRandomValues = Crypto.getRandomValues as any;
}
if (typeof g.crypto.randomUUID === "undefined" && typeof (Crypto as any).randomUUID === "function") {
  g.crypto.randomUUID = (Crypto as any).randomUUID.bind(Crypto);
}

if (typeof g.btoa === "undefined") {
  g.btoa = (input: string) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let str = input;
    let output = "";
    let i = 0;
    while (i < str.length) {
      const c1 = str.charCodeAt(i++);
      const c2 = str.charCodeAt(i++);
      const c3 = str.charCodeAt(i++);
      const e1 = c1 >> 2;
      const e2 = ((c1 & 3) << 4) | (c2 >> 4);
      const e3 = isNaN(c2) ? 64 : ((c2 & 15) << 2) | (c3 >> 6);
      const e4 = isNaN(c3) ? 64 : c3 & 63;
      output += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
    }
    return output;
  };
}
if (typeof g.atob === "undefined") {
  g.atob = (input: string) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let str = input.replace(/=+$/, "");
    let output = "";
    let i = 0;
    while (i < str.length) {
      const e1 = chars.indexOf(str.charAt(i++));
      const e2 = chars.indexOf(str.charAt(i++));
      const e3 = chars.indexOf(str.charAt(i++));
      const e4 = chars.indexOf(str.charAt(i++));
      const c1 = (e1 << 2) | (e2 >> 4);
      const c2 = ((e2 & 15) << 4) | (isNaN(e3) ? 0 : e3 >> 2);
      const c3 = isNaN(e3) ? 0 : ((e3 & 3) << 6) | e4;
      output += String.fromCharCode(c1) + (isNaN(e2) ? "" : String.fromCharCode(c2)) + (isNaN(e3) ? "" : String.fromCharCode(c3));
    }
    return output;
  };
}

export {};
