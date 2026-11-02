import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const dir = path.join(process.cwd(), "data", "uploads");
const MAX_BYTES = 3 * 1024 * 1024;
const NAME = /^[a-f0-9]{16}\.(jpg|png|webp)$/;

// Look at the file's actual bytes instead of trusting its name or type.
function sniff(b: Buffer): "jpg" | "png" | "webp" | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length > 12 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.length > 12 && b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

export const contentTypes = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;

export function isUpload(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && value.size > 0;
}

/** Saves an image and returns its public URL. Throws an Error with a readable message. */
export async function saveUpload(file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error("Image must be under 3 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) throw new Error("Please upload a JPG, PNG or WebP image.");
  fs.mkdirSync(dir, { recursive: true });
  const name = `${randomBytes(8).toString("hex")}.${ext}`;
  fs.writeFileSync(path.join(dir, name), buf);
  return `/uploads/${name}`;
}

export function removeUpload(url?: string) {
  if (!url) return;
  const name = url.replace("/uploads/", "");
  if (NAME.test(name)) fs.rmSync(path.join(dir, name), { force: true });
}

export function readUpload(name: string): { data: Buffer; type: string } | null {
  if (!NAME.test(name)) return null;
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) return null;
  const ext = name.split(".")[1] as keyof typeof contentTypes;
  return { data: fs.readFileSync(file), type: contentTypes[ext] };
}
