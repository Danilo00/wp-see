import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { chatZipKey, getSignedUploadUrl, isS3Configured } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isS3Configured()) {
    return NextResponse.json(
      { error: "S3 non configurato. Usa upload diretto o configura AWS." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as { filename?: string; contentType?: string };
  const filename = body.filename?.trim() || "chat.zip";
  const contentType = body.contentType?.trim() || "application/zip";
  const importId = randomUUID();
  const key = chatZipKey(importId, filename.replace(/[^\w.\- ]/g, "_"));
  const uploadUrl = await getSignedUploadUrl(key, contentType);

  return NextResponse.json({ importId, key, uploadUrl, contentType });
}
