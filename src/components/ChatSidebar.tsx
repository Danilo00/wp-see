"use client";

import type { ChatSummary } from "@/lib/types";
import { ChatSidebarSkeleton } from "./ChatSidebarSkeleton";
import { Button } from "./ui/Button";

type ChatSidebarProps = {
  chats: ChatSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUploadClick: () => void;
  loading?: boolean;
  storageMode?: string;
  pendingDeleteIds?: string[];
  className?: string;
};

function storageLabel(mode?: string): string {
  if (mode === "hybrid") return "Cartella chats/ + Cloud";
  if (mode === "cloud") return "MongoDB + AWS S3";
  return "Storage locale";
}

function ChatAvatar({ title }: { title: string }) {
  const initial = title.charAt(0).toUpperCase();
  const hue = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white shadow-sm"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 45% 45%), hsl(${hue} 55% 38%))` }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function ChatSidebar({
  chats,
  selectedId,
  onSelect,
  onUploadClick,
  loading,
  storageMode,
  pendingDeleteIds = [],
  className = "",
}: ChatSidebarProps) {
  return (
    <aside
      className={`safe-top flex h-full w-full flex-col border-r border-[var(--wa-border)] bg-[var(--wa-surface)] pt-3 shadow-[2px_0_8px_rgba(0,0,0,0.04)] md:w-80 md:pt-4 lg:w-96 ${className}`}
    >
      <div className="border-b border-[var(--wa-border)] bg-[var(--wa-accent)] px-4 py-3.5 text-white md:bg-[var(--wa-header)] md:py-4 md:text-inherit">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight md:text-lg md:text-[var(--wa-text)]">
              WP See
            </h2>
            <p className="truncate text-sm opacity-90 md:text-xs md:text-[var(--wa-text-muted)] md:opacity-100">
              {storageLabel(storageMode)}
            </p>
          </div>
          <Button
            variant="onDark"
            onClick={onUploadClick}
            className="shrink-0 md:bg-[var(--wa-accent)] md:text-white md:shadow-sm md:hover:bg-[var(--wa-accent-hover)] md:active:bg-[var(--wa-accent-hover)]"
          >
            + Importa
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2 [-webkit-overflow-scrolling:touch]">
        {loading && <ChatSidebarSkeleton />}

        {!loading && chats.length === 0 && (
          <div className="mx-2 mt-4 rounded-2xl border border-dashed border-[var(--wa-border)] bg-[var(--wa-header)]/60 px-4 py-6 text-center">
            <p className="text-sm leading-relaxed text-[var(--wa-text-muted)]">
              Nessuna chat. Tocca <strong className="text-[var(--wa-text)]">Importa</strong> e carica
              uno zip esportato da WhatsApp.
            </p>
          </div>
        )}

        {!loading &&
          chats.map((chat) => {
            const isSelected = selectedId === chat.id;
            const isPendingDelete = pendingDeleteIds.includes(chat.id);

            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelect(chat.id)}
                disabled={isPendingDelete}
                className={`group relative flex min-h-[72px] w-full touch-manipulation items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 active:scale-[0.99] md:min-h-0 ${
                  isSelected
                    ? "bg-[var(--wa-header)] shadow-sm"
                    : "hover:bg-[#f5f6f6] active:bg-[var(--wa-header)]"
                } ${isPendingDelete ? "pointer-events-none opacity-40" : ""}`}
              >
                {isSelected && (
                  <span
                    className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-[var(--wa-accent)]"
                    aria-hidden
                  />
                )}
                <ChatAvatar title={chat.title} />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-[var(--wa-text)] md:text-sm">
                    {chat.title}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-[var(--wa-text-muted)] md:text-xs">
                    {chat.messageCount} messaggi · {chat.participants.length} partecipanti
                  </span>
                </div>
              </button>
            );
          })}
      </div>
    </aside>
  );
}
