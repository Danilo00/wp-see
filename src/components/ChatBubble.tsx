"use client";

import type { ChatMessage } from "@/lib/types";
import { MessageAttachment } from "./MessageAttachment";

type ChatBubbleProps = {
  message: ChatMessage;
  chatId: string;
  isOutgoing: boolean;
  showSender: boolean;
  interactive?: boolean;
};

export function ChatBubble({ message, chatId, isOutgoing, showSender, interactive = true }: ChatBubbleProps) {
  if (message.isSystem) {
    return (
      <div className="my-2.5 flex justify-center px-[var(--space-chat-x)]">
        <p className="max-w-[95%] rounded-xl bg-[#fcecc5] px-3.5 py-2 text-center text-xs leading-relaxed text-[#54656f] shadow-sm sm:max-w-md">
          {message.body || "Messaggio di sistema"}
        </p>
      </div>
    );
  }

  const timeLabel = message.time.slice(0, 5);

  return (
    <div
      className={`animate-fade-in mb-1 flex px-[var(--space-chat-x)] ${
        isOutgoing ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative max-w-[min(88%,20rem)] rounded-xl px-3 pb-2 pt-2 shadow-[0_1px_0.5px_rgba(0,0,0,0.08)] sm:max-w-[70%] md:max-w-[62%] ${
          isOutgoing
            ? "rounded-tr-sm bg-[var(--wa-outgoing)]"
            : "rounded-tl-sm bg-[var(--wa-incoming)]"
        } ${message.isCall ? "italic text-[#54656f]" : ""}`}
      >
        {showSender && !isOutgoing && (
          <p className="mb-1 text-xs font-semibold text-[#027eb5]">{message.sender}</p>
        )}

        {message.attachments.map((att) => (
          <div key={att.filename} className="mb-1.5">
            <MessageAttachment chatId={chatId} attachment={att} interactive={interactive} />
          </div>
        ))}

        {message.body && (
          <p className="whitespace-pre-wrap break-words text-[14.2px] leading-[19px] text-[var(--wa-text)]">
            {message.body}
          </p>
        )}

        <p className="mt-1 text-right text-[11px] leading-none text-[var(--wa-text-muted)]">
          {timeLabel}
        </p>
      </div>
    </div>
  );
}
