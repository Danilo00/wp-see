import { NextResponse } from "next/server";
import { debugLog } from "@/lib/debug";
import { importZipFromS3Key } from "@/lib/chat-service";
import { deleteObject, isS3Configured } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { s3Key?: string; title?: string; cleanup?: boolean };
    const s3Key = body.s3Key?.trim();
    const title = body.title?.trim() || undefined;

    if (!s3Key) {
      return NextResponse.json({ error: "s3Key mancante" }, { status: 400 });
    }

    debugLog(3, "import", "Import from S3", { s3Key });
    const summary = await importZipFromS3Key(s3Key, title);

    if (body.cleanup !== false && isS3Configured() && s3Key.startsWith("imports/")) {
      await deleteObject(s3Key).catch(() => undefined);
    }

    return NextResponse.json({ summary }, { status: 201 });
  } catch (err) {
    debugLog(1, "import", "S3 import failed", err);
    const message = err instanceof Error ? err.message : "Errore import da S3";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
