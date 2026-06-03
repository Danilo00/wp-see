"use client";

import { Button } from "./ui/Button";

type ChatRenameDialogProps = {
  open: boolean;
  currentTitle: string;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (title: string) => void;
};

export function ChatRenameDialog({
  open,
  currentTitle,
  loading,
  error,
  onClose,
  onConfirm,
}: ChatRenameDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Chiudi" onClick={onClose} />
      <form
        role="dialog"
        aria-modal="true"
        aria-label="Rinomina chat"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const title = String(fd.get("title") ?? "").trim();
          if (title) onConfirm(title);
        }}
      >
        <h3 className="text-lg font-semibold text-[var(--wa-text)]">Rinomina chat</h3>
        <input
          name="title"
          type="text"
          defaultValue={currentTitle}
          autoFocus
          disabled={loading}
          className="mt-4 min-h-[48px] w-full rounded-xl border border-[var(--wa-border)] px-3 text-base text-[var(--wa-text)] focus:border-[var(--wa-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--wa-accent)]/20"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
            Annulla
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="flex-1">
            {loading ? "Salvataggio…" : "Salva"}
          </Button>
        </div>
      </form>
    </div>
  );
}
