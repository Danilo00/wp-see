import { NextRequest, NextResponse } from "next/server";
import { getMessagesPage } from "@/lib/chat-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const allParam = searchParams.get("all") === "true";
  const limit = Math.min(5000, Math.max(1, Number(searchParams.get("limit") ?? "40")));
  const before = searchParams.get("before") ?? undefined;
  const after = searchParams.get("after") ?? undefined;

  const result = await getMessagesPage(id, {
    limit,
    before,
    after,
    all: allParam,
  });

  if (result.total === 0 && result.messages.length === 0) {
    const summaryOnly = await import("@/lib/chat-service").then((m) => m.getChatSummary(id));
    if (!summaryOnly) {
      return NextResponse.json({ error: "Chat non trovata" }, { status: 404 });
    }
  }

  return NextResponse.json({
    messages: result.messages,
    total: result.total,
    hasOlder: result.hasOlder,
    hasNewer: result.hasNewer,
    oldestId: result.messages[0]?.id ?? null,
    newestId: result.messages[result.messages.length - 1]?.id ?? null,
  });
}
