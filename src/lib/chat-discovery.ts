import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { debugLog } from "./debug";
import { parseWhatsAppChat } from "./whatsapp-parser";
import type { ChatSummary, ParsedChat } from "./types";

const CHAT_FILE_NAMES = ["_chat.txt", "chat.txt"];

let cachedChatsRoot: string | null = null;

/** Decodifica ID chat da URL (anche doppio-encoding). */
export function normalizeChatId(id: string): string {
  let decoded = id;
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}

export function getChatsRoot(): string {
  if (cachedChatsRoot && existsSync(cachedChatsRoot)) {
    return cachedChatsRoot;
  }

  const cwd = process.cwd();
  const fromEnv = process.env.CHATS_ROOT?.trim();

  const candidates = [
    fromEnv ? path.resolve(cwd, fromEnv) : null,
    path.join(cwd, "chats"),
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      cachedChatsRoot = candidate;
      debugLog(3, "discovery", "Chats root resolved", { root: candidate, cwd });
      return candidate;
    }
  }

  const fallback = path.join(cwd, "chats");
  cachedChatsRoot = fallback;
  debugLog(2, "discovery", "Chats root fallback (may be missing)", { root: fallback, cwd });
  return fallback;
}

export async function discoverChats(): Promise<ChatSummary[]> {
  const root = getChatsRoot();
  debugLog(3, "discovery", "Scanning chats root", { root });

  let entries: string[] = [];
  try {
    entries = await fs.readdir(root);
  } catch (err) {
    debugLog(1, "discovery", "Failed to read chats root", { root, err });
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
    summaries.push({ ...summary, source: "local" });
  }

  summaries.sort((a, b) => a.title.localeCompare(b.title, "it"));
  debugLog(4, "discovery", "Chats discovered", { count: summaries.length, root });

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
  const folderName = normalizeChatId(chatId);
  const root = getChatsRoot();
  const folderPath = path.join(root, folderName);
  const chatFile = await findChatFile(folderPath);
  if (!chatFile) {
    debugLog(2, "discovery", "Chat file not found", { folderName, folderPath, root });
    return null;
  }

  const content = await fs.readFile(chatFile, "utf-8");
  const title = folderName.replace(/^WhatsApp Chat - /i, "").trim() || folderName;
  return parseWhatsAppChat(content, folderName, title);
}

export function isLocalChatId(chatId: string): boolean {
  const folderName = normalizeChatId(chatId);
  const folderPath = path.join(getChatsRoot(), folderName);
  if (!existsSync(folderPath)) return false;
  return CHAT_FILE_NAMES.some((name) => existsSync(path.join(folderPath, name)));
}

export function resolveMediaPath(chatId: string, filename: string): string | null {
  const safeName = path.basename(filename);
  if (safeName !== filename || safeName.includes("..")) return null;

  const folderName = normalizeChatId(chatId);
  const root = getChatsRoot();
  const full = path.join(root, folderName, safeName);
  return full;
}
