"use client";

import { Button } from "./ui/Button";

type ChatDeleteDialogProps = {
  open: boolean;
  title: string;
  source: "local" | "cloud";
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ChatDeleteDialog({
  open,
  title,
  source,
  loading,
  error,
  onClose,
  onConfirm,
}: ChatDeleteDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Chiudi" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Elimina chat"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
      >
        <h3 className="text-lg font-semibold text-[var(--wa-text)]">Elimina chat</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--wa-text-muted)]">
          Vuoi eliminare <strong className="text-[var(--wa-text)]">{title}</strong>?
          {source === "cloud" && (
            <> Verranno rimossi messaggi, metadati MongoDB e tutti gli allegati su AWS S3.</>
          )}
          {source === "local" && <> Verranno eliminati cartella e file in <code>chats/</code>.</>}
        </p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
            Annulla
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading} className="flex-1">
            {loading ? "Eliminazione…" : "Elimina"}
          </Button>
        </div>
      </div>
    </div>
  );
}
