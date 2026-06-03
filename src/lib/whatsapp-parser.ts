import { debugLog } from "./debug";
import type { AttachmentKind, ChatAttachment, ChatMessage, ParsedChat, ChatSummary } from "./types";

const MSG_START =
  /^\u200e?\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*(.*)$/u;

const ATTACHMENT_RE =
  /<?(?:allegato|attached|adjunto|file)\s*:\s*([^>]+)>?/giu;

const CALL_MARKERS = [
  /chiamata vocale/i,
  /voice call/i,
  /video call/i,
  /chiamata video/i,
  /missed voice call/i,
  /chiamata persa/i,
];

const SYSTEM_MARKERS = [
  /crittografati end-to-end/i,
  /end-to-end encrypted/i,
  /è tra i tuoi contatti/i,
  /is a contact/i,
  /hai creato il gruppo/i,
  /created group/i,
  /ha cambiato/i,
  /changed the subject/i,
  /security code changed/i,
];

function stripInvisible(text: string): string {
  return text.replace(/[\u200e\u200f\u202a-\u202e]/g, "").trim();
}

function attachmentKind(filename: string): AttachmentKind {
  const upper = filename.toUpperCase();
  if (upper.includes("-PHOTO-") || /\.(jpe?g|png|gif|webp)$/i.test(filename)) return "image";
  if (upper.includes("-AUDIO-") || upper.includes("-PTT-") || /\.(opus|ogg|mp3|m4a)$/i.test(filename))
    return "audio";
  if (upper.includes("-VIDEO-") || /\.(mp4|mov|webm)$/i.test(filename)) return "video";
  if (upper.includes("-STICKER-")) return "sticker";
  if (/\.(pdf|docx?|xlsx?|pptx?|zip|rar)$/i.test(filename)) return "document";
  return "unknown";
}

function extractAttachments(raw: string): { body: string; attachments: ChatAttachment[] } {
  const attachments: ChatAttachment[] = [];
  let body = raw;

  for (const match of raw.matchAll(ATTACHMENT_RE)) {
    const filename = stripInvisible(match[1]);
    if (filename) {
      attachments.push({ filename, kind: attachmentKind(filename) });
    }
    body = body.replace(match[0], "").trim();
  }

  return { body: stripInvisible(body), attachments };
}

function parseDateParts(date: string, time: string): number {
  const [d, m, y] = date.split("/").map(Number);
  const year = y < 100 ? 2000 + y : y;
  const [hh, mm, ss = "0"] = time.split(":");
  return new Date(year, m - 1, d, Number(hh), Number(mm), Number(ss)).getTime();
}

function isCallMessage(body: string): boolean {
  const clean = stripInvisible(body);
  return CALL_MARKERS.some((re) => re.test(clean)) && !ATTACHMENT_RE.test(clean);
}

function isSystemMessage(body: string, attachments: ChatAttachment[]): boolean {
  if (attachments.length > 0) return false;
  const clean = stripInvisible(body);
  if (!clean) return true;
  return SYSTEM_MARKERS.some((re) => re.test(clean));
}

export function parseWhatsAppChat(txtContent: string, chatId: string, title: string): ParsedChat {
  debugLog(3, "parser", "Parsing chat", { chatId, bytes: txtContent.length });

  const lines = txtContent.replace(/\r\n/g, "\n").split("\n");
  const messages: ChatMessage[] = [];
  let current: ChatMessage | null = null;
  let msgIndex = 0;

  const flush = () => {
    if (!current) return;
    const { body, attachments } = extractAttachments(current.body);
    current.body = body;
    current.attachments = [...current.attachments, ...attachments];
    current.isCall = isCallMessage(current.body);
    current.isSystem = isSystemMessage(current.body, current.attachments);
    messages.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (!trimmed) continue;

    const match = trimmed.match(MSG_START);
    if (match) {
      flush();
      const [, date, time, sender, body] = match;
      const normalizedTime = time.length === 5 ? `${time}:00` : time;
      msgIndex += 1;
      current = {
        id: `${chatId}-${msgIndex}`,
        date,
        time: normalizedTime,
        timestamp: parseDateParts(date, normalizedTime),
        sender: stripInvisible(sender),
        body: stripInvisible(body),
        attachments: [],
        isSystem: false,
        isCall: false,
      };
    } else if (current) {
      current.body = current.body ? `${current.body}\n${trimmed}` : trimmed;
    }
  }
  flush();

  const participants = [...new Set(messages.map((m) => m.sender))];
  const timestamps = messages.map((m) => m.timestamp).filter(Boolean);
  const dateRange =
    timestamps.length > 0
      ? {
          from: new Date(Math.min(...timestamps)).toLocaleDateString("it-IT"),
          to: new Date(Math.max(...timestamps)).toLocaleDateString("it-IT"),
        }
      : null;

  const summary: ChatSummary = {
    id: chatId,
    title,
    folderName: title,
    messageCount: messages.length,
    participants,
    dateRange,
    source: "local",
  };

  debugLog(4, "parser", "Parse complete", { messages: messages.length, participants });

  return { summary, messages };
}
