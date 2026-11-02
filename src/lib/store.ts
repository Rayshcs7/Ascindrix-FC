import fs from "node:fs";
import path from "node:path";

// Simple JSON file storage. Works locally and on any server with a writable disk.
const dir = path.join(process.cwd(), "data");

export function readJson<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), "utf8")) as T;
}

export function writeJson(name: string, data: unknown) {
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data, null, 2));
}
