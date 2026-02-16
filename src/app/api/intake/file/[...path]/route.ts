import { readFile } from "node:fs/promises";
import path from "node:path";

import { resolveRuntimeFilePath } from "@/src/lib/intake/uploads";

export const runtime = "nodejs";

const mimeByExt: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;

  try {
    const filePath = resolveRuntimeFilePath(params.path);
    const file = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    return new Response(file, {
      headers: {
        "Content-Type": mimeByExt[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
