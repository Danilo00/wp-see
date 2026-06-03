import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { normalizeChatId } from "@/lib/chat-discovery";
import { resolveMedia } from "@/lib/chat-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const chatId = normalizeChatId(id);
  const decodedName = decodeURIComponent(filename);

  try {
    const resolved = await resolveMedia(chatId, decodedName);

    if (resolved.mode === "redirect" && resolved.url) {
      return NextResponse.redirect(resolved.url, 302);
    }

    if (resolved.mode === "local" && resolved.path) {
      const buffer = await fs.readFile(resolved.path);
      const ext = path.extname(resolved.path).toLowerCase();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": MIME[ext] ?? "application/octet-stream",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return NextResponse.json({ error: "File non trovato" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "File non trovato" }, { status: 404 });
  }
}
