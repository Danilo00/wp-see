"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatSummary } from "@/lib/types";
import { debugLog } from "@/lib/debug";

type ChatUploadDialogProps = {
  open: boolean;
  onClose: () => void;
  onImported: (summary: ChatSummary) => void;
};

async function parseJsonResponse(res: Response): Promise<{ error?: string; summary?: ChatSummary }> {
  const text = await res.text();
  try {
    return JSON.parse(text) as { error?: string; summary?: ChatSummary };
  } catch {
    throw new Error(
      res.ok
        ? "Risposta non valida dal server"
        : `Upload fallito (${res.status}${text ? `: ${text.slice(0, 120)}` : ""})`,
    );
  }
}

export function ChatUploadDialog({ open, onClose, onImported }: ChatUploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  const reset = () => {
    setError(null);
    setProgress("");
    setTitle("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const uploadDirect = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    if (title.trim()) formData.append("title", title.trim());

    setProgress("Caricamento e importazione…");

    let res: Response;
    try {
      res = await fetch("/api/chats/upload", { method: "POST", body: formData });
    } catch (err) {
      debugLog(1, "upload-ui", "Network error", err);
      throw new Error(
        "Connessione fallita. Verifica che il server sia attivo e che il file non superi i limiti di Vercel (~4.5MB in produzione).",
      );
    }

    const data = await parseJsonResponse(res);
    if (!res.ok || !data.summary) {
      throw new Error(data.error ?? "Upload fallito");
    }
    return data.summary;
  };

  const handleSubmit = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      debugLog(3, "upload-ui", "Starting upload", { name: file.name, size: file.size });

      try {
        const summary = await uploadDirect(file);
        debugLog(4, "upload-ui", "Import complete", { id: summary.id, source: summary.source });
        onImported(summary);
        reset();
        onClose();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Errore upload";
        setError(msg);
        debugLog(1, "upload-ui", "Upload error", err);
      } finally {
        setLoading(false);
        setProgress("");
      }
    },
    [onClose, onImported, title],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Chiudi"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Importa chat WhatsApp"
        className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl"
      >
        <h3 className="text-lg font-semibold text-[#111b21]">Importa chat</h3>
        <p className="mt-1 text-sm text-[#667781]">
          Carica uno zip esportato da WhatsApp (con <code>_chat.txt</code> e allegati).
        </p>

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-[#111b21]">Titolo (opzionale)</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Es. Cliente XYZ"
            className="min-h-[44px] rounded-lg border border-[#d1d7db] px-3 text-base"
            disabled={loading}
          />
        </label>

        <label className="mt-3 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#008069] bg-[#f0f2f5] px-4 py-6 text-center">
          <span className="text-sm font-medium text-[#008069]">Seleziona file .zip</span>
          <span className="mt-1 text-xs text-[#667781]">Upload via server (no CORS S3)</span>
          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip"
            className="sr-only"
            disabled={loading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleSubmit(file);
            }}
          />
        </label>

        {progress && <p className="mt-3 text-sm text-[#027eb5]">{progress}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="mt-4 min-h-[44px] w-full rounded-lg text-sm font-medium text-[#667781] active:bg-[#f0f2f5] disabled:opacity-50"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
