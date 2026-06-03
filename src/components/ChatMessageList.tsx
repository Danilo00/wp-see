"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ChatMessage, ChatSummary } from "@/lib/types";
import { debugLog } from "@/lib/debug";
import { ChatBubble } from "./ChatBubble";
import { ChatMessageListSkeleton } from "./ChatMessageListSkeleton";
import { DateSeparator } from "./DateSeparator";
import { LoadMoreButton } from "./LoadMoreButton";
import { MediaViewerProvider } from "./MediaViewerProvider";

type ChatMessageListProps = {
  chatId: string;
  summary: ChatSummary;
  myName: string;
  pdfMode?: boolean;
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

export function ChatMessageList({ chatId, summary, myName, pdfMode }: ChatMessageListProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef(0);
  const isPdf = pdfMode === true;

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);
    setMessages([]);
    const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}/messages?limit=50`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setHasOlder(data.hasOlder ?? false);
    setInitialLoading(false);
    debugLog(4, "messages", "Initial batch loaded", { count: data.messages?.length });
  }, [chatId]);

  const loadAllForPdf = useCallback(async () => {
    const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}/messages?limit=200`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setHasOlder(false);
    setInitialLoading(false);
  }, [chatId]);

  useEffect(() => {
    if (isPdf) {
      loadAllForPdf();
    } else {
      loadInitial();
    }
  }, [isPdf, loadInitial, loadAllForPdf]);

  useEffect(() => {
    if (!initialLoading && !isPdf && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [initialLoading, isPdf, messages.length, chatId]);

  const loadOlder = async () => {
    if (!messages.length || loadingOlder) return;
    setLoadingOlder(true);
    const el = listRef.current;
    if (el) prevScrollHeight.current = el.scrollHeight;

    const oldestId = messages[0].id;
    const res = await fetch(
      `/api/chats/${encodeURIComponent(chatId)}/messages?limit=50&before=${encodeURIComponent(oldestId)}`,
    );
    const data = await res.json();
    const older: ChatMessage[] = data.messages ?? [];

    setMessages((prev) => [...older, ...prev]);
    setHasOlder(data.hasOlder ?? false);
    setLoadingOlder(false);

    requestAnimationFrame(() => {
      if (el) {
        el.scrollTop = el.scrollHeight - prevScrollHeight.current;
      }
    });
  };

  const items = useMemo(() => {
    const nodes: ReactNode[] = [];
    let lastDate = "";

    for (const msg of messages) {
      if (msg.date !== lastDate) {
        lastDate = msg.date;
        nodes.push(<DateSeparator key={`d-${msg.id}`} label={formatDateKey(msg.date)} />);
      }
      const isOutgoing = myName ? msg.sender === myName : false;
      nodes.push(
        <ChatBubble
          key={msg.id}
          message={msg}
          chatId={chatId}
          isOutgoing={isOutgoing}
          showSender={summary.participants.length > 2}
          interactive={!isPdf}
        />,
      );
    }
    return nodes;
  }, [messages, myName, chatId, summary.participants.length]);

  if (initialLoading) {
    return <ChatMessageListSkeleton />;
  }

  return (
    <MediaViewerProvider>
      <div
        ref={listRef}
        className={`chat-wallpaper flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] ${
          isPdf ? "max-h-none overflow-visible" : "safe-bottom"
        }`}
      >
        {!isPdf && hasOlder && (
          <LoadMoreButton label="Messaggi precedenti" onClick={loadOlder} loading={loadingOlder} />
        )}
        <div className="py-3 pb-4">{items}</div>
        <div ref={bottomRef} />
      </div>
    </MediaViewerProvider>
  );
}
