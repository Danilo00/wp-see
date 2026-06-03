"use client";

import { useEffect, useRef } from "react";
import { debugLog } from "@/lib/debug";
import type { MediaViewerItem } from "./MediaViewerProvider";
import { CloseIcon } from "./icons";

type MediaViewerOverlayProps = {
  item: MediaViewerItem | null;
  onClose: () => void;
};

function isPdf(filename: string): boolean {
  return filename.toLowerCase().endsWith(".pdf");
}

export function MediaViewerOverlay({ item, onClose }: MediaViewerOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!item) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [item, onClose]);

  useEffect(() => {
    if (!item || item.kind !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    void video.play().catch((err) => {
      debugLog(2, "media-viewer", "Autoplay blocked", err);
    });

    return () => {
      video.pause();
      video.currentTime = 0;
    };
  }, [item]);

  if (!item) return null;

  const showImage = item.kind === "image" || item.kind === "sticker";
  const showVideo = item.kind === "video";
  const showPdf = item.kind === "document" && isPdf(item.filename);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#0b141a]/98"
      role="dialog"
      aria-modal="true"
      aria-label={item.filename}
    >
      <header className="safe-top flex shrink-0 items-center gap-2 border-b border-white/10 px-2 py-2 text-white">
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi anteprima"
          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full transition hover:bg-white/10 active:bg-white/20"
        >
          <CloseIcon />
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.filename}</p>
        <a
          href={item.url}
          download={item.filename}
          className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-white/90 transition hover:bg-white/10"
          onClick={() => debugLog(4, "media-viewer", "Download media", { filename: item.filename })}
        >
          Scarica
        </a>
      </header>

      <div
        className="flex flex-1 items-center justify-center overflow-hidden p-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-full max-w-full items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {showImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.filename}
              className="max-h-[calc(100dvh-5rem)] max-w-full object-contain"
            />
          )}

          {showVideo && (
            <video
              ref={videoRef}
              controls
              playsInline
              preload="auto"
              className="max-h-[calc(100dvh-5rem)] max-w-full rounded-lg bg-black"
            >
              <source src={item.url} />
            </video>
          )}

          {showPdf && (
            <iframe
              src={item.url}
              title={item.filename}
              className="h-[calc(100dvh-5rem)] w-[min(100vw-2rem,56rem)] rounded-lg bg-white"
            />
          )}

          {!showImage && !showVideo && !showPdf && (
            <div className="max-w-sm rounded-2xl bg-[#1f2c34] px-6 py-8 text-center text-white shadow-xl">
              <span className="text-4xl" aria-hidden>
                📎
              </span>
              <p className="mt-4 break-all text-sm font-medium">{item.filename}</p>
              <p className="mt-2 text-xs text-white/70">Anteprima non disponibile per questo tipo di file.</p>
              <a
                href={item.url}
                download={item.filename}
                className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--wa-accent)] px-5 text-sm font-medium text-white transition hover:bg-[var(--wa-accent-hover)]"
              >
                Scarica file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
