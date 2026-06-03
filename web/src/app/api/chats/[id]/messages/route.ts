import { NextRequest, NextResponse } from "next/server";
import { loadChat } from "@/lib/chat-discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const chat = await loadChat(id);
  if (!chat) {
    return NextResponse.json({ error: "Chat non trovata" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const allParam = searchParams.get("all") === "true";
  const limit = Math.min(5000, Math.max(1, Number(searchParams.get("limit") ?? "40")));
  const before = searchParams.get("before");
  const after = searchParams.get("after");

  const all = chat.messages;
  let slice = all;

  if (allParam) {
    return NextResponse.json({
      messages: all,
      total: all.length,
      hasOlder: false,
      hasNewer: false,
      oldestId: all[0]?.id ?? null,
      newestId: all[all.length - 1]?.id ?? null,
    });
  }

  if (before !== null && before !== "") {
    const idx = all.findIndex((m) => m.id === before);
    const end = idx >= 0 ? idx : all.length;
    const start = Math.max(0, end - limit);
    slice = all.slice(start, end);
  } else if (after !== null && after !== "") {
    const idx = all.findIndex((m) => m.id === after);
    const start = idx >= 0 ? idx + 1 : 0;
    slice = all.slice(start, start + limit);
  } else {
    slice = all.slice(Math.max(0, all.length - limit));
  }

  const hasOlder =
    slice.length > 0 ? all.findIndex((m) => m.id === slice[0].id) > 0 : false;
  const hasNewer =
    slice.length > 0
      ? all.findIndex((m) => m.id === slice[slice.length - 1].id) < all.length - 1
      : false;

  return NextResponse.json({
    messages: slice,
    total: all.length,
    hasOlder,
    hasNewer,
    oldestId: slice[0]?.id ?? null,
    newestId: slice[slice.length - 1]?.id ?? null,
  });
}
