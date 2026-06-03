import mongoose, { Schema, models } from "mongoose";
import type { AttachmentKind } from "../types";

export interface AttachmentDoc {
  filename: string;
  kind: AttachmentKind;
  s3Key?: string;
}

export interface MessageDoc {
  chatSlug: string;
  msgId: string;
  date: string;
  time: string;
  timestamp: number;
  sender: string;
  body: string;
  attachments: AttachmentDoc[];
  isSystem: boolean;
  isCall: boolean;
  order: number;
}

const AttachmentSchema = new Schema<AttachmentDoc>(
  {
    filename: String,
    kind: String,
    s3Key: String,
  },
  { _id: false },
);

const MessageSchema = new Schema<MessageDoc>(
  {
    chatSlug: { type: String, required: true, index: true },
    msgId: { type: String, required: true, unique: true },
    date: String,
    time: String,
    timestamp: { type: Number, index: true },
    sender: String,
    body: String,
    attachments: { type: [AttachmentSchema], default: [] },
    isSystem: Boolean,
    isCall: Boolean,
    order: { type: Number, index: true },
  },
  { versionKey: false },
);

MessageSchema.index({ chatSlug: 1, order: 1 });

export const MessageModel =
  models.Message ?? mongoose.model<MessageDoc>("Message", MessageSchema);
