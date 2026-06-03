"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatSummary } from "@/lib/types";
import { debugLog } from "@/lib/debug";

type ChatUploadDialogProps = {
  open: boolean;
  onClose: () => void;
  onImported: (summary: ChatSummary) => void;
  storageMode?: string;
};

const LARGE_ZIP = 4 * 1024 * 1024;

export function ChatUploadDialog({
  open,
  onClose,
  onImported,
  storageMode,
}: ChatUploadDialogProps) {
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

    setProgress("Importazione in corso…");
    const res = await fetch("/api/chats/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload fallito");
    return data.summary as ChatSummary;
  };

  const uploadViaS3 = async (file: File) => {
    setProgress("Preparazione upload S3…");
    const presignRes = await fetch("/api/chats/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: "application/zip" }),
    });
    const presign = await presignRes.json();
    if (!presignRes.ok) throw new Error(presign.error ?? "Presign fallito");

    setProgress("Caricamento zip su S3…");
    const putRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": presign.contentType },
      body: file,
    });
    if (!putRes.ok) throw new Error("Upload S3 fallito");

    setProgress("Elaborazione chat…");
    const importRes = await fetch("/api/chats/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ s3Key: presign.key, title: title.trim() || undefined }),
    });
    const data = await importRes.json();
    if (!importRes.ok) throw new Error(data.error ?? "Import fallito");
    return data.summary as ChatSummary;
  };

  const handleSubmit = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      debugLog(3, "upload-ui", "Starting upload", { name: file.name, size: file.size });

      try {
        const useS3 = file.size > LARGE_ZIP && storageMode === "cloud";
        const summary = useS3 ? await uploadViaS3(file) : await uploadDirect(file);
        debugLog(4, "upload-ui", "Import complete", { id: summary.id });
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
    [onClose, onImported, storageMode, title],
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
          <span className="mt-1 text-xs text-[#667781]">
            {storageMode === "cloud" ? "File grandi → upload diretto S3" : "Max ~50MB su upload diretto"}
          </span>
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
