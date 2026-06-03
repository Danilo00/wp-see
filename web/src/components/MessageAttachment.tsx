"use client";

import type { ChatAttachment } from "@/lib/types";

type MessageAttachmentProps = {
  chatId: string;
  attachment: ChatAttachment;
  compact?: boolean;
};

function mediaUrl(chatId: string, filename: string) {
  const id = encodeURIComponent(chatId);
  const file = encodeURIComponent(filename);
  return `/api/chats/${id}/media/${file}`;
}

export function MessageAttachment({ chatId, attachment, compact }: MessageAttachmentProps) {
  const url = mediaUrl(chatId, attachment.filename);

  if (attachment.kind === "image" || attachment.kind === "sticker") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={attachment.filename}
          className={`max-w-full rounded-lg object-cover ${compact ? "max-h-40 sm:max-h-48" : "max-h-52 sm:max-h-72"}`}
          loading="lazy"
        />
      </a>
    );
  }

  if (attachment.kind === "audio") {
    return (
      <div className="min-w-0 max-w-full rounded-lg bg-black/5 p-2 sm:min-w-[220px]">
        <audio controls preload="metadata" className="h-10 w-full min-w-[200px] max-w-full">
          <source src={url} />
          Messaggio vocale
        </audio>
        <p className="mt-1 truncate text-[10px] text-[#667781]">{attachment.filename}</p>
      </div>
    );
  }

  if (attachment.kind === "video") {
    return (
      <video
        controls
        preload="metadata"
        playsInline
        className="max-h-52 max-w-full rounded-lg sm:max-h-72"
      >
        <source src={url} />
      </video>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border border-[#d1d7db] bg-white/80 px-3 py-2 text-sm text-[#027eb5] hover:underline"
    >
      <span aria-hidden>📎</span>
      <span className="truncate">{attachment.filename}</span>
    </a>
  );
}
