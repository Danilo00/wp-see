import { NextResponse } from "next/server";
import { loadChat } from "@/lib/chat-discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const chat = await loadChat(id);
  if (!chat) {
    return NextResponse.json({ error: "Chat non trovata" }, { status: 404 });
  }
  return NextResponse.json({ summary: chat.summary });
}
