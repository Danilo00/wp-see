export type AttachmentKind = "image" | "audio" | "video" | "document" | "sticker" | "unknown";

export interface ChatAttachment {
  filename: string;
  kind: AttachmentKind;
}

export interface ChatMessage {
  id: string;
  date: string;
  time: string;
  timestamp: number;
  sender: string;
  body: string;
  attachments: ChatAttachment[];
  isSystem: boolean;
  isCall: boolean;
}

export interface ChatSummary {
  id: string;
  title: string;
  folderName: string;
  messageCount: number;
  participants: string[];
  dateRange: { from: string; to: string } | null;
}

export interface ParsedChat {
  summary: ChatSummary;
  messages: ChatMessage[];
}
