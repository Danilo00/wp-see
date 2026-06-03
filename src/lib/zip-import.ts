import AdmZip from "adm-zip";
import path from "path";
import { inferTitleFromWhatsAppName } from "./chat-title";
import { debugLog } from "./debug";
import type { ParsedChat } from "./types";
import { parseWhatsAppChat } from "./whatsapp-parser";

export type ExtractedZip = {
  chatFolder: string;
  chatFilePath: string;
  chatText: string;
  files: Map<string, Buffer>;
};

const CHAT_NAMES = ["_chat.txt", "chat.txt"];

export function extractWhatsAppZip(zipBuffer: Buffer): ExtractedZip {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries().filter((e) => !e.isDirectory);

  if (entries.length === 0) {
    throw new Error("Lo zip è vuoto");
  }

  let chatEntry = entries.find((e) =>
    CHAT_NAMES.includes(path.basename(e.entryName).toLowerCase()),
  );

  if (!chatEntry) {
    throw new Error("Nessun _chat.txt trovato nello zip");
  }

  const chatFilePath = chatEntry.entryName.replace(/\\/g, "/");
  const chatFolder = path.posix.dirname(chatFilePath);
  const chatText = chatEntry.getData().toString("utf-8");

  const files = new Map<string, Buffer>();
  const prefix = chatFolder === "." ? "" : `${chatFolder}/`;

  for (const entry of entries) {
    const normalized = entry.entryName.replace(/\\/g, "/");
    if (normalized === chatFilePath) continue;
    if (prefix && !normalized.startsWith(prefix)) continue;

    const relativeName = prefix
      ? normalized.slice(prefix.length)
      : path.posix.basename(normalized);

    if (!relativeName || relativeName.includes("/")) continue;
    files.set(relativeName, entry.getData());
  }

  debugLog(3, "zip", "Zip extracted", {
    chatFolder,
    files: files.size,
    textBytes: chatText.length,
  });

  return { chatFolder, chatFilePath, chatText, files };
}

export function parseExtractedZip(
  extracted: ExtractedZip,
  slug: string,
  title: string,
): ParsedChat {
  return parseWhatsAppChat(extracted.chatText, slug, title);
}

export function inferTitleFromFolder(folder: string): string {
  if (!folder || folder === ".") return "";
  const base = folder.split("/").filter(Boolean).pop() ?? folder;
  return inferTitleFromWhatsAppName(base);
}
