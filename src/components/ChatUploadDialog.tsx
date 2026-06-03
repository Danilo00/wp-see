"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatSummary } from "@/lib/types";
import { inferTitleFromWhatsAppName } from "@/lib/chat-title";
import { debugLog } from "@/lib/debug";
import { Button } from "./ui/Button";

type ChatUploadDialogProps = {
  open: boolean;
  onClose: () => void;
  onImported: (summary: ChatSummary) => void;
};

const ACCEPT = ".zip,.txt,application/zip,text/plain";

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

function isTextChatFile(name: string): boolean {
  return name.toLowerCase().endsWith(".txt");
}

function isSupportedFile(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith(".zip") || lower.endsWith(".txt");
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

  const uploadDirect = async (file: File, effectiveTitle: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (effectiveTitle) formData.append("title", effectiveTitle);

    setProgress(
      isTextChatFile(file.name)
        ? "Importazione chat di testo…"
        : "Caricamento zip e importazione…",
    );

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
      if (!isSupportedFile(file.name)) {
        setError("Formato non supportato. Usa un file .zip o .txt esportato da WhatsApp.");
        return;
      }

      setLoading(true);
      setError(null);

      const effectiveTitle = title.trim() || inferTitleFromWhatsAppName(file.name);
      if (!title.trim() && effectiveTitle) {
        setTitle(effectiveTitle);
      }

      debugLog(3, "upload-ui", "Starting upload", {
        name: file.name,
        size: file.size,
        title: effectiveTitle,
        type: isTextChatFile(file.name) ? "txt" : "zip",
      });

      try {
        const summary = await uploadDirect(file, effectiveTitle);
        debugLog(4, "upload-ui", "Import complete", { id: summary.id, title: summary.title });
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

  const onFileSelected = (file: File | undefined) => {
    if (!file) return;
    if (!title.trim()) {
      setTitle(inferTitleFromWhatsAppName(file.name));
    }
    void handleSubmit(file);
  };

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
        <h3 className="text-lg font-semibold text-[var(--wa-text)]">Importa chat</h3>
        <p className="mt-1 text-sm leading-relaxed text-[var(--wa-text-muted)]">
          Carica l&apos;export WhatsApp: riconosciamo automaticamente{" "}
          <code>.zip</code> (chat + media) oppure <code>_chat.txt</code> (solo messaggi).
        </p>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--wa-text)]">Titolo</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Es. Nome contatto"
            className="min-h-[44px] rounded-xl border border-[var(--wa-border)] bg-white px-3 text-base text-[var(--wa-text)] placeholder:text-[var(--wa-text-muted)] focus:border-[var(--wa-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--wa-accent)]/20"
            disabled={loading}
          />
          <span className="text-xs text-[var(--wa-text-muted)]">
            Opzionale: se vuoto, lo deduciamo dal nome file (es. &quot;WhatsApp Chat - Cliente.zip&quot;).
          </span>
        </label>

        <label className="mt-4 flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--wa-accent)] bg-[var(--wa-header)] px-4 py-6 text-center transition hover:bg-[#e9edef]">
          <span className="text-sm font-semibold text-[var(--wa-accent)]">Seleziona file</span>
          <span className="mt-1 text-xs leading-relaxed text-[var(--wa-text-muted)]">
            .zip con chat e allegati oppure .txt solo chat
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={loading}
            onChange={(e) => onFileSelected(e.target.files?.[0])}
          />
        </label>

        {progress && <p className="mt-3 text-sm font-medium text-[#027eb5]">{progress}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <Button variant="ghost" fullWidth onClick={handleClose} disabled={loading} className="mt-4">
          Annulla
        </Button>
      </div>
    </div>
  );
}
