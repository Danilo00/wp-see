import { NextResponse } from "next/server";
import { getStorageInfo, listChats } from "@/lib/chat-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const chats = await listChats();
  return NextResponse.json({ chats, storage: await getStorageInfo() });
}
