import { NextResponse } from "next/server";
import { getChatSummary } from "@/lib/chat-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const summary = await getChatSummary(id);
  if (!summary) {
    return NextResponse.json({ error: "Chat non trovata" }, { status: 404 });
  }
  return NextResponse.json({ summary });
}
