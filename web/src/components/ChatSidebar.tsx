"use client";

import type { ChatSummary } from "@/lib/types";

type ChatSidebarProps = {
  chats: ChatSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
  className?: string;
};

export function ChatSidebar({
  chats,
  selectedId,
  onSelect,
  loading,
  className = "",
}: ChatSidebarProps) {
  return (
    <aside
      className={`flex h-full w-full flex-col border-r border-[#d1d7db] bg-white md:w-80 lg:w-96 ${className}`}
    >
      <div className="safe-top border-b border-[#d1d7db] bg-[#008069] px-4 py-4 text-white md:bg-[#f0f2f5] md:text-inherit">
        <h2 className="text-xl font-semibold md:text-lg md:text-[#111b21]">WP See</h2>
        <p className="text-sm opacity-90 md:text-xs md:text-[#667781] md:opacity-100">
          Chat WhatsApp da file .txt
        </p>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        {loading && (
          <p className="p-4 text-sm text-[#667781]">Ricerca chat nella cartella…</p>
        )}
        {!loading && chats.length === 0 && (
          <p className="p-4 text-sm leading-relaxed text-[#667781]">
            Nessuna chat trovata. Esporta da WhatsApp in una cartella con{" "}
            <code className="text-xs">_chat.txt</code> e imposta{" "}
            <code className="text-xs">CHATS_ROOT</code> in .env.local.
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
