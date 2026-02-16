import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  IntakeAssetKindOption,
  IntakeAssetRecord,
  RoomScopeOption,
} from "@/src/lib/intake/types";

const VERCEL_UPLOAD_ROOT = "/tmp/element-intake-uploads";
const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "intake");

const imageMimeToExt: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

function uploadRoot() {
  return isVercelRuntime() ? VERCEL_UPLOAD_ROOT : LOCAL_UPLOAD_ROOT;
}

function publicUrl(relativePath: string) {
  if (isVercelRuntime()) {
    return `/api/intake/file/${relativePath}`;
  }

  return `/uploads/intake/${relativePath}`;
}

function extensionFromFileName(fileName: string) {
  const ext = path.extname(fileName).replace(".", "").toLowerCase();
  return ext || null;
}

function resolveExtension(fileName: string, mimeType: string) {
  return extensionFromFileName(fileName) ?? imageMimeToExt[mimeType] ?? "bin";
}

async function maybeCreateThumbnail(buffer: Buffer, mimeType: string) {
  if (!mimeType.startsWith("image/")) {
    return {
      buffer,
      ext: imageMimeToExt[mimeType] ?? "bin",
    };
  }

  try {
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default;

    const thumbBuffer = await sharp(buffer)
      .resize({ width: 720, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    return {
      buffer: thumbBuffer,
      ext: "webp",
    };
  } catch {
    return {
      buffer,
      ext: imageMimeToExt[mimeType] ?? "jpg",
    };
  }
}

function sanitizeName(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type SaveUploadInput = {
  intakeId: string;
  file: File;
  kind: IntakeAssetKindOption;
  roomType: RoomScopeOption | null;
  label: string | null;
};

export async function saveIntakeUpload({
  intakeId,
  file,
  kind,
  roomType,
  label,
}: SaveUploadInput): Promise<IntakeAssetRecord> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const mimeType = file.type || "application/octet-stream";
  const ext = resolveExtension(file.name, mimeType);

  const id = crypto.randomUUID();
  const safeBase = sanitizeName(`${kind}-${Date.now()}-${id.slice(0, 8)}`) || id;

  const fileDirRelative = `${intakeId}`;
  const originalRelativePath = `${fileDirRelative}/${safeBase}.${ext}`;

  const thumb = await maybeCreateThumbnail(buffer, mimeType);
  const thumbRelativePath = `${fileDirRelative}/${safeBase}-thumb.${thumb.ext}`;

  const targetRoot = uploadRoot();

  await mkdir(path.join(targetRoot, fileDirRelative), { recursive: true });
  await writeFile(path.join(targetRoot, originalRelativePath), buffer);
  await writeFile(path.join(targetRoot, thumbRelativePath), thumb.buffer);

  const createdAt = new Date().toISOString();

  return {
    id,
    intakeId,
    kind,
    roomType,
    label,
    originalUrl: publicUrl(originalRelativePath),
    thumbnailUrl: publicUrl(thumbRelativePath),
    mimeType,
    sizeBytes: buffer.byteLength,
    createdAt,
  };
}

export function resolveRuntimeFilePath(relativePath: string[]) {
  const safeParts = relativePath
    .map((part) => part.replace(/\.\./g, "").replace(/\\/g, "/"))
    .filter(Boolean);

  const joined = safeParts.join("/");
  return path.join(uploadRoot(), joined);
}
