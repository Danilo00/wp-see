import { NextResponse } from "next/server";
import { discoverChats } from "@/lib/chat-discovery";

export async function GET() {
  const chats = await discoverChats();
  return NextResponse.json({ chats });
}
