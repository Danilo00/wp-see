"use client";

import { Button } from "./ui/Button";

type ChatLoadHistoryDialogProps = {
  open: boolean;
  messageCount: number;
  loadedCount: number;
  loading?: boolean;
  onClose: () => void;
  onLoadAll: () => void;
};

export function ChatLoadHistoryDialog({
  open,
  messageCount,
  loadedCount,
  loading,
  onClose,
  onLoadAll,
}: ChatLoadHistoryDialogProps) {
  if (!open) return null;

  const hidden = Math.max(0, messageCount - loadedCount);

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Chiudi"
        onClick={onClose}
        disabled={loading}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carica cronologia chat"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
      >
        <h3 className="text-lg font-semibold text-[var(--wa-text)]">Cronologia completa</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--wa-text-muted)]">
          Stai vedendo gli ultimi {loadedCount} messaggi
          {hidden > 0 ? ` su ${messageCount}` : ""}. Vuoi caricare tutta la conversazione
          dall&apos;inizio?
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Ultimi messaggi
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onLoadAll}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Caricamento…" : "Carica dall'inizio"}
          </Button>
        </div>
      </div>
    </div>
  );
}
