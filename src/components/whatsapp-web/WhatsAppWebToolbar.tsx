"use client";

import Link from "next/link";
import { BackIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

type WhatsAppWebToolbarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onRefresh: () => void;
  onOpenDirect: () => void;
};

export function WhatsAppWebToolbar({
  collapsed,
  onToggleCollapse,
  onRefresh,
  onOpenDirect,
}: WhatsAppWebToolbarProps) {
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onToggleCollapse}
        className="safe-top absolute left-1/2 top-0 z-20 -translate-x-1/2 rounded-b-xl bg-(--wa-accent) px-4 py-1 text-xs font-medium text-white shadow-md"
        aria-label="Mostra barra strumenti"
      >
        Strumenti
      </button>
    );
  }

  return (
    <header className="safe-top z-20 flex shrink-0 items-center gap-2 border-b border-(--wa-border) bg-(--wa-header) px-2 py-2">
      <Link
        href="/"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-(--wa-text) hover:bg-white active:bg-white"
        aria-label="Torna a WP See"
      >
        <BackIcon className="h-6 w-6" />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-(--wa-text)">WhatsApp Web</p>
        <p className="truncate text-xs text-(--wa-text-muted)">Wrapper mobile</p>
      </div>

      <Button variant="ghost" className="min-h-11 px-3" onClick={onRefresh}>
        Aggiorna
      </Button>
      <Button variant="secondary" className="min-h-11 px-3" onClick={onOpenDirect}>
        Apri
      </Button>
      <button
        type="button"
        onClick={onToggleCollapse}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-(--wa-text-muted) hover:bg-white active:bg-white"
        aria-label="Nascondi barra strumenti"
      >
        ▼
      </button>
    </header>
  );
}
