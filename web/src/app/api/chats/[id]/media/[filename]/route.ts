import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { resolveMediaPath } from "@/lib/chat-discovery";

type Params = { params: Promise<{ id: string; filename: string }> };

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".opus": "audio/ogg",
  ".ogg": "audio/ogg",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

export async function GET(_request: Request, { params }: Params) {
  const { id, filename } = await params;
  const filePath = resolveMediaPath(id, decodeURIComponent(filename));

  if (!filePath) {
    return NextResponse.json({ error: "File non valido" }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "File non trovato" }, { status: 404 });
  }
}
