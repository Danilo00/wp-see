import { NextResponse } from "next/server";
import { debugLog } from "@/lib/debug";
import { importChatTextBuffer, importZipBuffer } from "@/lib/chat-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 50 * 1024 * 1024;

function isZipFile(name: string): boolean {
  return name.toLowerCase().endsWith(".zip");
}

function isChatTextFile(name: string): boolean {
  return name.toLowerCase().endsWith(".txt");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const title = String(formData.get("title") ?? "").trim() || undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File mancante" }, { status: 400 });
    }

    const zip = isZipFile(file.name);
    const txt = isChatTextFile(file.name);

    if (!zip && !txt) {
      return NextResponse.json(
        { error: "Formato non supportato. Usa .zip (con media) o _chat.txt / chat.txt (solo testo)." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File troppo grande. Usa upload presignato per file > 50MB." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    debugLog(3, "upload", "Processing upload", { name: file.name, bytes: buffer.length, zip, txt });

    const summary = zip
      ? await importZipBuffer(buffer, title, file.name)
      : await importChatTextBuffer(buffer, title, file.name);

    return NextResponse.json({ summary }, { status: 201 });
  } catch (err) {
    debugLog(1, "upload", "Upload failed", err);
    const message = err instanceof Error ? err.message : "Errore import";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
