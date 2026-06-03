"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ChatMessage, ChatSummary } from "@/lib/types";
import { debugLog } from "@/lib/debug";
import { ChatBubble } from "./ChatBubble";
import { ChatLoadHistoryDialog } from "./ChatLoadHistoryDialog";
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
  const [loadingAll, setLoadingAll] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pendingScrollRestore = useRef<number | null>(null);
  const pendingScrollTop = useRef(false);
  const scrollToBottomOnReady = useRef(true);
  const isPdf = pdfMode === true;

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);
    setMessages([]);
    setHistoryDialogOpen(false);
    scrollToBottomOnReady.current = true;
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

  const loadAll = useCallback(async () => {
    if (loadingAll) return;
    setLoadingAll(true);
    setHistoryDialogOpen(false);
    debugLog(3, "messages", "Loading full chat", { chatId });
    try {
      const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}/messages?all=true`);
      const data = await res.json();
      setMessages(data.messages ?? []);
      setHasOlder(false);
      pendingScrollTop.current = true;
      debugLog(3, "messages", "Full chat loaded", { count: data.messages?.length });
    } catch (err) {
      debugLog(1, "messages", "Failed to load full chat", err);
    } finally {
      setLoadingAll(false);
    }
  }, [chatId, loadingAll]);

  useEffect(() => {
    if (isPdf) {
      loadAllForPdf();
    } else {
      loadInitial();
    }
  }, [isPdf, loadInitial, loadAllForPdf]);

  useEffect(() => {
    if (!initialLoading && hasOlder && !isPdf) {
      setHistoryDialogOpen(true);
      debugLog(4, "messages", "History dialog opened", { chatId, hasOlder });
    }
  }, [initialLoading, hasOlder, isPdf, chatId]);

  useEffect(() => {
    if (scrollToBottomOnReady.current && !initialLoading && !isPdf && messages.length > 0) {
      scrollToBottomOnReady.current = false;
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
      });
    }
  }, [initialLoading, isPdf, messages.length, chatId]);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;

    if (pendingScrollRestore.current !== null) {
      const prevHeight = pendingScrollRestore.current;
      pendingScrollRestore.current = null;
      el.scrollTop = el.scrollHeight - prevHeight;
      debugLog(4, "messages", "Scroll position restored after older batch");
      return;
    }

    if (pendingScrollTop.current) {
      pendingScrollTop.current = false;
      el.scrollTop = 0;
      debugLog(4, "messages", "Scrolled to top after full load");
    }
  }, [messages]);

  const loadOlder = async () => {
    if (!messages.length || loadingOlder) return;
    setLoadingOlder(true);
    const el = listRef.current;
    if (el) pendingScrollRestore.current = el.scrollHeight;

    const oldestId = messages[0].id;
    const res = await fetch(
      `/api/chats/${encodeURIComponent(chatId)}/messages?limit=50&before=${encodeURIComponent(oldestId)}`,
    );
    const data = await res.json();
    const older: ChatMessage[] = data.messages ?? [];

    setMessages((prev) => [...older, ...prev]);
    setHasOlder(data.hasOlder ?? false);
    setLoadingOlder(false);
    debugLog(4, "messages", "Older batch loaded", { count: older.length });
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
  }, [messages, myName, chatId, summary.participants.length, isPdf]);

  if (initialLoading) {
    return <ChatMessageListSkeleton />;
  }

  return (
    <MediaViewerProvider>
      <ChatLoadHistoryDialog
        open={historyDialogOpen}
        messageCount={summary.messageCount}
        loadedCount={messages.length}
        loading={loadingAll}
        onClose={() => setHistoryDialogOpen(false)}
        onLoadAll={loadAll}
      />
      <div
        ref={listRef}
        className={`chat-wallpaper flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] ${
          isPdf ? "max-h-none overflow-visible" : "safe-bottom"
        }`}
      >
        {!isPdf && hasOlder && (
          <div className="flex flex-col items-center gap-2 px-[var(--space-chat-x)] py-3">
            <LoadMoreButton
              label="Messaggi precedenti"
              onClick={loadOlder}
              loading={loadingOlder}
            />
            <LoadMoreButton
              label={loadingAll ? "Caricamento…" : "Carica tutta la chat"}
              onClick={loadAll}
              loading={loadingAll}
            />
          </div>
        )}
        <div className="py-3 pb-4">{items}</div>
        <div ref={bottomRef} />
      </div>
    </MediaViewerProvider>
  );
}
