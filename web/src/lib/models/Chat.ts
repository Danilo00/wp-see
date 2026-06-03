import mongoose, { Schema, models } from "mongoose";

export interface ChatDoc {
  slug: string;
  title: string;
  sourceFolder: string;
  participants: string[];
  messageCount: number;
  dateRange: { from: string; to: string } | null;
  createdAt: Date;
}

const ChatSchema = new Schema<ChatDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    sourceFolder: { type: String, required: true },
    participants: { type: [String], default: [] },
    messageCount: { type: Number, default: 0 },
    dateRange: {
      from: String,
      to: String,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const ChatModel = models.Chat ?? mongoose.model<ChatDoc>("Chat", ChatSchema);
