import { NextResponse } from "next/server";
import { debugLog } from "@/lib/debug";
import { importZipBuffer, getStorageInfo } from "@/lib/chat-service";
import path from "path";
import { discoverChats } from "@/lib/chat-discovery";
import AdmZip from "adm-zip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Migra le chat locali in web/chats verso MongoDB + S3 (solo se cloud attivo). */
export async function POST(request: Request) {
  if (getStorageInfo().mode !== "cloud") {
    return NextResponse.json(
      { error: "Storage cloud non configurato (MONGODB_URI + AWS_S3_BUCKET)" },
      { status: 503 },
    );
  }

  const secret = process.env.MIGRATE_SECRET?.trim();
  if (secret) {
    const header = request.headers.get("x-migrate-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
  }

  const summaries = await discoverChats();
  const imported: string[] = [];

  for (const chat of summaries) {
    try {
      const { getChatsRoot } = await import("@/lib/chat-discovery");
      const folderPath = path.join(getChatsRoot(), chat.id);
      const zip = new AdmZip();
      zip.addLocalFolder(folderPath);
      const buffer = zip.toBuffer();
      await importZipBuffer(buffer, chat.title);
      imported.push(chat.title);
    } catch (err) {
      debugLog(1, "migrate", "Failed chat", { chat: chat.id, err });
    }
  }

  return NextResponse.json({ imported, count: imported.length });
}
