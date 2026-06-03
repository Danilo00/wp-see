import { NextResponse } from "next/server";
import { deleteChat, getChatSummary, updateChatTitle } from "@/lib/chat-service";

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

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { title?: string };
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ error: "Titolo mancante" }, { status: 400 });
    }
    const summary = await updateChatTitle(id, title);
    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore aggiornamento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await deleteChat(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore eliminazione";
    const status = message === "Chat non trovata" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
