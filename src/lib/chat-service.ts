import fs from "fs/promises";
import path from "path";
import {
  discoverChats as discoverLocal,
  isLocalChatId,
  loadChat as loadLocal,
  resolveMediaPath,
} from "./chat-discovery";
import { debugLog } from "./debug";
import { connectMongo, isMongoConfigured } from "./mongodb";
import { ChatModel, type ChatDoc } from "./models/Chat";
import { MessageModel, type AttachmentDoc, type MessageDoc } from "./models/Message";
import {
  chatMediaKey,
  getObjectBuffer,
  getSignedMediaUrl,
  isCloudStorageEnabled,
  isS3Configured,
  uploadBuffer,
} from "./s3";
import type { ChatMessage, ChatSummary, ParsedChat } from "./types";
import { extractWhatsAppZip, inferTitleFromFolder, parseExtractedZip } from "./zip-import";

function asMessageDocs(docs: unknown): MessageDoc[] {
  return docs as MessageDoc[];
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "chat"
  );
}

async function uniqueSlug(base: string): Promise<string> {
  if (!isMongoConfigured()) return base;

  await connectMongo();
  let slug = slugify(base);
  let suffix = 0;
  while (await ChatModel.exists({ slug })) {
    suffix += 1;
    slug = `${slugify(base).slice(0, 40)}-${suffix}`;
  }
  return slug;
}

function toCloudSummary(doc: ChatDoc): ChatSummary {
  return {
    id: doc.slug,
    title: doc.title,
    folderName: doc.slug,
    messageCount: doc.messageCount,
    participants: doc.participants,
    dateRange: doc.dateRange?.from ? doc.dateRange : null,
    source: "cloud",
  };
}

function docToMessage(doc: MessageDoc): ChatMessage {
  return {
    id: doc.msgId,
    date: doc.date,
    time: doc.time,
    timestamp: doc.timestamp,
    sender: doc.sender,
    body: doc.body,
    attachments: doc.attachments.map((a) => ({
      filename: a.filename,
      kind: a.kind,
    })),
    isSystem: doc.isSystem,
    isCall: doc.isCall,
  };
}

async function listCloudChats(): Promise<ChatSummary[]> {
  if (!isMongoConfigured()) return [];
  try {
    await connectMongo();
    const docs = (await ChatModel.find().sort({ title: 1 }).lean()) as unknown as ChatDoc[];
    return docs.map(toCloudSummary);
  } catch (err) {
    debugLog(1, "chat-service", "Cloud chat list failed", err);
    return [];
  }
}

async function resolveChatSource(chatId: string): Promise<"local" | "cloud" | null> {
  if (isLocalChatId(chatId)) return "local";

  if (isMongoConfigured()) {
    try {
      await connectMongo();
      if (await ChatModel.exists({ slug: chatId })) return "cloud";
    } catch (err) {
      debugLog(2, "chat-service", "Cloud lookup failed", err);
    }
  }

  return null;
}

/** Unisce chat statiche (cartella chats/) + chat importate su cloud. */
export async function listChats(): Promise<ChatSummary[]> {
  const local = await discoverLocal();
  const cloud = await listCloudChats();

  const seen = new Set(local.map((c) => c.id));
  const merged = [...local];

  for (const chat of cloud) {
    if (!seen.has(chat.id)) {
      merged.push(chat);
      seen.add(chat.id);
    }
  }

  merged.sort((a, b) => a.title.localeCompare(b.title, "it"));
  debugLog(4, "chat-service", "Chats listed", { local: local.length, cloud: cloud.length, total: merged.length });

  return merged;
}

export async function getChatSummary(chatId: string): Promise<ChatSummary | null> {
  const source = await resolveChatSource(chatId);
  if (source === "local") {
    const chat = await loadLocal(chatId);
    return chat ? { ...chat.summary, source: "local" } : null;
  }
  if (source === "cloud") {
    await connectMongo();
    const doc = (await ChatModel.findOne({ slug: chatId }).lean()) as unknown as ChatDoc | null;
    return doc ? toCloudSummary(doc) : null;
  }
  return null;
}

async function getCloudMessagesPage(
  chatId: string,
  options: { limit: number; before?: string; after?: string; all?: boolean },
): Promise<{ messages: ChatMessage[]; total: number; hasOlder: boolean; hasNewer: boolean }> {
  await connectMongo();
  const total = await MessageModel.countDocuments({ chatSlug: chatId });

  if (options.all) {
    const docs = (await MessageModel.find({ chatSlug: chatId }).sort({ order: 1 }).lean()) as unknown as MessageDoc[];
    return { messages: docs.map(docToMessage), total, hasOlder: false, hasNewer: false };
  }

  if (options.before) {
    const pivot = (await MessageModel.findOne({ msgId: options.before, chatSlug: chatId }).lean()) as unknown as MessageDoc | null;
    const endOrder = pivot?.order ?? total + 1;
    const docs = asMessageDocs(
      await MessageModel.find({ chatSlug: chatId, order: { $lt: endOrder } })
        .sort({ order: -1 })
        .limit(options.limit)
        .lean(),
    );
    const messages = [...docs].reverse().map(docToMessage);
    const firstOrder = docs.length > 0 ? Math.min(...docs.map((d) => d.order)) : endOrder;
    const hasOlder =
      messages.length > 0
        ? (await MessageModel.exists({ chatSlug: chatId, order: { $lt: firstOrder } })) !== null
        : false;
    return { messages, total, hasOlder, hasNewer: endOrder <= total };
  }

  if (options.after) {
    const pivot = (await MessageModel.findOne({ msgId: options.after, chatSlug: chatId }).lean()) as unknown as MessageDoc | null;
    const startOrder = pivot?.order ?? 0;
    const docs = asMessageDocs(
      await MessageModel.find({ chatSlug: chatId, order: { $gt: startOrder } })
        .sort({ order: 1 })
        .limit(options.limit)
        .lean(),
    );
    const messages = docs.map(docToMessage);
    const lastOrder = docs.length > 0 ? docs[docs.length - 1].order : startOrder;
    const hasNewer =
      (await MessageModel.exists({ chatSlug: chatId, order: { $gt: lastOrder } })) !== null;
    return { messages, total, hasOlder: startOrder > 0, hasNewer };
  }

  const docs = asMessageDocs(
    await MessageModel.find({ chatSlug: chatId }).sort({ order: -1 }).limit(options.limit).lean(),
  );
  const messages = [...docs].reverse().map(docToMessage);
  const firstOrder = docs.length > 0 ? Math.min(...docs.map((d) => d.order)) : 1;
  const hasOlder =
    (await MessageModel.exists({ chatSlug: chatId, order: { $lt: firstOrder } })) !== null;

  return { messages, total, hasOlder, hasNewer: false };
}

function getLocalMessagesPage(
  chat: ParsedChat,
  options: { limit: number; before?: string; after?: string; all?: boolean },
): { messages: ChatMessage[]; total: number; hasOlder: boolean; hasNewer: boolean } {
  const all = chat.messages;
  let slice = all;

  if (options.all) {
    slice = all;
  } else if (options.before) {
    const idx = all.findIndex((m) => m.id === options.before);
    const end = idx >= 0 ? idx : all.length;
    slice = all.slice(Math.max(0, end - options.limit), end);
  } else if (options.after) {
    const idx = all.findIndex((m) => m.id === options.after);
    const start = idx >= 0 ? idx + 1 : 0;
    slice = all.slice(start, start + options.limit);
  } else {
    slice = all.slice(Math.max(0, all.length - options.limit));
  }

  const hasOlder = slice.length > 0 ? all.findIndex((m) => m.id === slice[0].id) > 0 : false;
  const hasNewer =
    slice.length > 0
      ? all.findIndex((m) => m.id === slice[slice.length - 1].id) < all.length - 1
      : false;

  return { messages: slice, total: all.length, hasOlder, hasNewer };
}

export async function getMessagesPage(
  chatId: string,
  options: { limit: number; before?: string; after?: string; all?: boolean },
): Promise<{ messages: ChatMessage[]; total: number; hasOlder: boolean; hasNewer: boolean }> {
  const source = await resolveChatSource(chatId);

  if (source === "cloud") {
    return getCloudMessagesPage(chatId, options);
  }

  const chat = await loadLocal(chatId);
  if (!chat) return { messages: [], total: 0, hasOlder: false, hasNewer: false };

  return getLocalMessagesPage(chat, options);
}

export async function resolveMedia(
  chatId: string,
  filename: string,
): Promise<{ mode: "local" | "redirect"; path?: string; url?: string }> {
  const source = await resolveChatSource(chatId);

  if (source === "local") {
    const filePath = resolveMediaPath(chatId, filename);
    if (!filePath) throw new Error("File non valido");
    return { mode: "local", path: filePath };
  }

  if (source === "cloud" && isS3Configured()) {
    const url = await getSignedMediaUrl(chatMediaKey(chatId, filename));
    return { mode: "redirect", url };
  }

  throw new Error("File non trovato");
}

async function saveChatToCloud(
  slug: string,
  parsed: ParsedChat,
  sourceFolder: string,
  files: Map<string, Buffer>,
): Promise<ChatSummary> {
  await connectMongo();

  if (isS3Configured()) {
    for (const [filename, buffer] of files) {
      await uploadBuffer(chatMediaKey(slug, filename), buffer, guessContentType(filename));
    }
  }

  await ChatModel.deleteOne({ slug });
  await MessageModel.deleteMany({ chatSlug: slug });

  await ChatModel.create({
    slug,
    title: parsed.summary.title,
    sourceFolder,
    participants: parsed.summary.participants,
    messageCount: parsed.messages.length,
    dateRange: parsed.summary.dateRange,
  });

  const messageDocs = parsed.messages.map((msg, index) => ({
    chatSlug: slug,
    msgId: `${slug}-${index + 1}`,
    date: msg.date,
    time: msg.time,
    timestamp: msg.timestamp,
    sender: msg.sender,
    body: msg.body,
    attachments: msg.attachments.map(
      (att): AttachmentDoc => ({
        filename: att.filename,
        kind: att.kind,
        s3Key: isS3Configured() ? chatMediaKey(slug, att.filename) : undefined,
      }),
    ),
    isSystem: msg.isSystem,
    isCall: msg.isCall,
    order: index + 1,
  }));

  if (messageDocs.length > 0) {
    await MessageModel.insertMany(messageDocs);
  }

  debugLog(3, "chat-service", "Chat saved to cloud", { slug, messages: messageDocs.length });

  return { ...parsed.summary, id: slug, source: "cloud" };
}

export async function importZipBuffer(
  zipBuffer: Buffer,
  titleOverride?: string,
): Promise<ChatSummary> {
  const extracted = extractWhatsAppZip(zipBuffer);
  const title = titleOverride?.trim() || inferTitleFromFolder(extracted.chatFolder);

  if (isCloudStorageEnabled()) {
    const slug = await uniqueSlug(title);
    const parsed = parseExtractedZip(extracted, slug, title);
    parsed.summary.id = slug;
    return saveChatToCloud(slug, parsed, extracted.chatFolder, extracted.files);
  }

  const parsed = parseExtractedZip(extracted, title, title);
  return saveChatToLocal(title, parsed, extracted);
}

export async function importZipFromS3Key(s3Key: string, titleOverride?: string): Promise<ChatSummary> {
  const buffer = await getObjectBuffer(s3Key);
  return importZipBuffer(buffer, titleOverride);
}

async function saveChatToLocal(
  slug: string,
  parsed: ParsedChat,
  extracted: ReturnType<typeof extractWhatsAppZip>,
): Promise<ChatSummary> {
  const { getChatsRoot } = await import("./chat-discovery");
  const root = getChatsRoot();
  const folderName = `WhatsApp Chat - ${parsed.summary.title}`;
  const folderPath = path.join(root, folderName);

  await fs.mkdir(folderPath, { recursive: true });
  await fs.writeFile(path.join(folderPath, "_chat.txt"), extracted.chatText, "utf-8");

  for (const [filename, buffer] of extracted.files) {
    await fs.writeFile(path.join(folderPath, filename), buffer);
  }

  debugLog(3, "chat-service", "Chat saved locally", { folderPath });

  return {
    ...parsed.summary,
    id: folderName,
    folderName,
    source: "local",
  };
}

function guessContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".opus": "audio/ogg",
    ".mp4": "video/mp4",
    ".pdf": "application/pdf",
  };
  return map[ext] ?? "application/octet-stream";
}

export async function getStorageInfo() {
  const local = await discoverLocal();
  const cloudReady = isCloudStorageEnabled();
  return {
    mode: cloudReady ? "hybrid" : "local",
    localChats: local.length,
    cloudReady,
  };
}
