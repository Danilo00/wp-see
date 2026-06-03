"use client";

import { forwardRef, type ReactNode } from "react";
import type { ChatMessage, ChatSummary } from "@/lib/types";
import { ChatBubble } from "./ChatBubble";
import { DateSeparator } from "./DateSeparator";

type PdfExportViewProps = {
  chatId: string;
  summary: ChatSummary;
  messages: ChatMessage[];
  myName: string;
  title: string;
};

function formatDateKey(date: string): string {
  const [d, m, y] = date.split("/").map(Number);
  const year = y < 100 ? 2000 + y : y;
  return new Date(year, m - 1, d).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const PdfExportView = forwardRef<HTMLDivElement, PdfExportViewProps>(
  function PdfExportView({ chatId, summary, messages, myName, title }, ref) {
    let lastDate = "";
    const nodes: ReactNode[] = [];

    for (const msg of messages) {
      if (msg.date !== lastDate) {
        lastDate = msg.date;
        nodes.push(<DateSeparator key={`pdf-d-${msg.id}`} label={formatDateKey(msg.date)} />);
      }
      nodes.push(
        <ChatBubble
          key={`pdf-${msg.id}`}
          message={msg}
          chatId={chatId}
          isOutgoing={myName ? msg.sender === myName : false}
          showSender={summary.participants.length > 2}
          interactive={false}
        />,
      );
    }

    return (
      <div
        ref={ref}
        className="pointer-events-none fixed left-0 top-0 z-[-1] w-[800px] bg-[#e5ddd5] p-4 opacity-100"
        aria-hidden
      >
        <div className="mb-4 rounded-lg bg-[#008069] px-4 py-3 text-white">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm opacity-90">
            Esportazione · {messages.length} messaggi ·{" "}
            {new Date().toLocaleString("it-IT")}
          </p>
        </div>
        <div className="py-2">{nodes}</div>
      </div>
    );
  },
);
