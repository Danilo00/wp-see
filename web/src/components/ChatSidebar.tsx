"use client";

import type { ChatSummary } from "@/lib/types";

type ChatSidebarProps = {
  chats: ChatSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUploadClick: () => void;
  loading?: boolean;
  storageMode?: string;
  className?: string;
};

export function ChatSidebar({
  chats,
  selectedId,
  onSelect,
  onUploadClick,
  loading,
  storageMode,
  className = "",
}: ChatSidebarProps) {
  return (
    <aside
      className={`flex h-full w-full flex-col border-r border-[#d1d7db] bg-white md:w-80 lg:w-96 ${className}`}
    >
      <div className="safe-top border-b border-[#d1d7db] bg-[#008069] px-4 py-3 text-white md:bg-[#f0f2f5] md:py-4 md:text-inherit">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold md:text-lg md:text-[#111b21]">WP See</h2>
            <p className="text-sm opacity-90 md:text-xs md:text-[#667781] md:opacity-100">
              {storageMode === "cloud" ? "MongoDB + AWS S3" : "Storage locale"}
            </p>
          </div>
          <button
            type="button"
            onClick={onUploadClick}
            className="min-h-[40px] shrink-0 rounded-lg bg-white/20 px-3 text-sm font-medium text-white active:bg-white/30 md:bg-[#008069] md:text-white md:hover:bg-[#006b57]"
          >
            + Importa
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        {loading && (
          <p className="p-4 text-sm text-[#667781]">Ricerca chat nella cartella…</p>
        )}
        {!loading && chats.length === 0 && (
          <p className="p-4 text-sm leading-relaxed text-[#667781]">
            Nessuna chat. Tocca <strong>Importa</strong> e carica uno zip esportato da WhatsApp.
          </p>
        )}
        {chats.map((chat) => (
          <button
            key={chat.id}
            type="button"
            onClick={() => onSelect(chat.id)}
            className={`flex min-h-[72px] w-full touch-manipulation flex-col justify-center gap-0.5 border-b border-[#f0f2f5] px-4 py-3 text-left transition active:bg-[#f0f2f5] md:min-h-0 md:hover:bg-[#f5f6f6] ${
              selectedId === chat.id ? "bg-[#f0f2f5] md:bg-[#f0f2f5]" : ""
            }`}
          >
            <span className="truncate text-base font-medium text-[#111b21] md:text-sm">
              {chat.title}
            </span>
            <span className="text-sm text-[#667781] md:text-xs">
              {chat.messageCount} messaggi · {chat.participants.length} partecipanti
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
