"use client";

import type { ChatMessage } from "@/lib/types";
import { MessageAttachment } from "./MessageAttachment";

type ChatBubbleProps = {
  message: ChatMessage;
  chatId: string;
  isOutgoing: boolean;
  showSender: boolean;
};

export function ChatBubble({ message, chatId, isOutgoing, showSender }: ChatBubbleProps) {
  if (message.isSystem) {
    return (
      <div className="my-2 flex justify-center px-3 sm:px-6">
        <p className="max-w-[95%] rounded-lg bg-[#fcecc5] px-3 py-2 text-center text-xs leading-relaxed text-[#54656f] sm:max-w-none">
          {message.body || "Messaggio di sistema"}
        </p>
      </div>
    );
  }

  const timeLabel = message.time.slice(0, 5);

  return (
    <div className={`mb-0.5 flex px-2 sm:mb-1 sm:px-3 ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[min(92%,20rem)] rounded-lg px-2.5 pb-1.5 pt-1.5 shadow-sm sm:max-w-[70%] md:max-w-[65%] ${
          isOutgoing
            ? "rounded-tr-none bg-[#d9fdd3]"
            : "rounded-tl-none bg-white"
        } ${message.isCall ? "italic text-[#54656f]" : ""}`}
      >
        {showSender && !isOutgoing && (
          <p className="mb-0.5 text-xs font-semibold text-[#027eb5]">{message.sender}</p>
        )}

        {message.attachments.map((att) => (
          <div key={att.filename} className="mb-1">
            <MessageAttachment chatId={chatId} attachment={att} />
          </div>
        ))}

        {message.body && (
          <p className="whitespace-pre-wrap break-words text-[14.2px] leading-[19px] text-[#111b21]">
            {message.body}
          </p>
        )}

        <p
          className={`mt-0.5 text-right text-[11px] text-[#667781] ${
            isOutgoing ? "text-[#667781]" : ""
          }`}
        >
          {timeLabel}
        </p>
      </div>
    </div>
  );
}
