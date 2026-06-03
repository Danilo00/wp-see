import fs from "fs/promises";
import path from "path";
import { debugLog } from "./debug";
import { parseWhatsAppChat } from "./whatsapp-parser";
import type { ChatSummary, ParsedChat } from "./types";

const CHAT_FILE_NAMES = ["_chat.txt", "chat.txt"];

export function getChatsRoot(): string {
  const root = process.env.CHATS_ROOT ?? "./chats";
  return path.resolve(process.cwd(), root);
}

export async function discoverChats(): Promise<ChatSummary[]> {
  const root = getChatsRoot();
  debugLog(3, "discovery", "Scanning chats root", { root });

  let entries: string[] = [];
  try {
    entries = await fs.readdir(root);
  } catch (err) {
    debugLog(1, "discovery", "Failed to read chats root", err);
    return [];
  }

  const summaries: ChatSummary[] = [];

  for (const entry of entries) {
    const folderPath = path.join(root, entry);
    const stat = await fs.stat(folderPath).catch(() => null);
    if (!stat?.isDirectory()) continue;

    const chatFile = await findChatFile(folderPath);
    if (!chatFile) continue;

    const content = await fs.readFile(chatFile, "utf-8");
    const title = entry.replace(/^WhatsApp Chat - /i, "").trim() || entry;
    const { summary } = parseWhatsAppChat(content, entry, title);
    summaries.push(summary);
  }

  summaries.sort((a, b) => a.title.localeCompare(b.title, "it"));
  debugLog(4, "discovery", "Chats discovered", { count: summaries.length });

  return summaries;
}

async function findChatFile(folderPath: string): Promise<string | null> {
  for (const name of CHAT_FILE_NAMES) {
    const full = path.join(folderPath, name);
    try {
      await fs.access(full);
      return full;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function loadChat(chatId: string): Promise<ParsedChat | null> {
  const folderName = chatId;
  const root = getChatsRoot();
  const folderPath = path.join(root, folderName);
  const chatFile = await findChatFile(folderPath);
  if (!chatFile) {
    debugLog(2, "discovery", "Chat file not found", { folderName });
    return null;
  }

  const content = await fs.readFile(chatFile, "utf-8");
  const title = folderName.replace(/^WhatsApp Chat - /i, "").trim() || folderName;
  return parseWhatsAppChat(content, chatId, title);
}

export function resolveMediaPath(chatId: string, filename: string): string | null {
  const safeName = path.basename(filename);
  if (safeName !== filename || safeName.includes("..")) return null;

  const folderName = chatId;
  const root = getChatsRoot();
  const full = path.join(root, folderName, safeName);
  return full;
}
