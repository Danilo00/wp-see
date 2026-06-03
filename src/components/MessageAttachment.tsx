"use client";

import type { ChatAttachment } from "@/lib/types";
import { mediaUrl } from "@/lib/media-url";
import { debugLog } from "@/lib/debug";
import { useMediaViewerOptional } from "./MediaViewerProvider";
import { PlayIcon } from "./icons";

type MessageAttachmentProps = {
  chatId: string;
  attachment: ChatAttachment;
  compact?: boolean;
  interactive?: boolean;
};

export function MessageAttachment({
  chatId,
  attachment,
  compact,
  interactive = true,
}: MessageAttachmentProps) {
  const viewer = useMediaViewerOptional();
  const url = mediaUrl(chatId, attachment.filename);

  const openInViewer = () => {
    if (!interactive || !viewer) return;
    debugLog(4, "media", "Open attachment in viewer", {
      kind: attachment.kind,
      filename: attachment.filename,
    });
    viewer.openMedia({ url, kind: attachment.kind, filename: attachment.filename });
  };

  if (attachment.kind === "image" || attachment.kind === "sticker") {
    if (!interactive || !viewer) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={attachment.filename}
          className={`max-w-full rounded-lg object-cover ${compact ? "max-h-40 sm:max-h-48" : "max-h-52 sm:max-h-72"}`}
          loading="lazy"
        />
      );
    }

    return (
      <button
        type="button"
        onClick={openInViewer}
        className="block cursor-zoom-in overflow-hidden rounded-lg transition active:opacity-90"
        aria-label={`Apri immagine ${attachment.filename}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={attachment.filename}
          className={`max-w-full object-cover ${compact ? "max-h-40 sm:max-h-48" : "max-h-52 sm:max-h-72"}`}
          loading="lazy"
        />
      </button>
    );
  }

  if (attachment.kind === "audio") {
    return (
      <div className="min-w-0 max-w-full rounded-lg bg-black/5 p-2 sm:min-w-[220px]">
        <audio controls preload="metadata" className="h-10 w-full min-w-[200px] max-w-full">
          <source src={url} />
          Messaggio vocale
        </audio>
        <p className="mt-1 truncate text-[10px] text-[var(--wa-text-muted)]">{attachment.filename}</p>
      </div>
    );
  }

  if (attachment.kind === "video") {
    if (!interactive || !viewer) {
      return (
        <video
          controls
          preload="metadata"
          playsInline
          className="max-h-52 max-w-full rounded-lg sm:max-h-72"
        >
          <source src={url} />
        </video>
      );
    }

    return (
      <button
        type="button"
        onClick={openInViewer}
        className="relative block overflow-hidden rounded-lg"
        aria-label={`Apri video ${attachment.filename}`}
      >
        <video
          preload="metadata"
          playsInline
          muted
          className={`max-w-full object-cover ${compact ? "max-h-40 sm:max-h-48" : "max-h-52 sm:max-h-72"}`}
        >
          <source src={url} />
        </video>
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <PlayIcon />
        </span>
      </button>
    );
  }

  if (!interactive || !viewer) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[var(--wa-border)] bg-white/80 px-3 py-2 text-sm text-[var(--wa-text-muted)]">
        <span aria-hidden>📎</span>
        <span className="truncate">{attachment.filename}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={openInViewer}
      className="flex w-full items-center gap-2 rounded-lg border border-[var(--wa-border)] bg-white/80 px-3 py-2 text-left text-sm text-[#027eb5] transition hover:bg-white active:bg-[var(--wa-header)]"
      aria-label={`Apri allegato ${attachment.filename}`}
    >
      <span aria-hidden>📎</span>
      <span className="truncate">{attachment.filename}</span>
    </button>
  );
}
