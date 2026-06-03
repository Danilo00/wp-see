import { NextResponse } from "next/server";
import { discoverChats } from "@/lib/chat-discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const chats = await discoverChats();
  return NextResponse.json({ chats });
}
