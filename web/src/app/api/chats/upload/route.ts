import { NextResponse } from "next/server";
import { debugLog } from "@/lib/debug";
import { importZipBuffer } from "@/lib/chat-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const title = String(formData.get("title") ?? "").trim() || undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File zip mancante" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json({ error: "Solo file .zip supportati" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Zip troppo grande. Usa upload presignato per file > 50MB." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    debugLog(3, "upload", "Processing zip upload", { name: file.name, bytes: buffer.length });

    const summary = await importZipBuffer(buffer, title);
    return NextResponse.json({ summary }, { status: 201 });
  } catch (err) {
    debugLog(1, "upload", "Upload failed", err);
    const message = err instanceof Error ? err.message : "Errore import zip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
