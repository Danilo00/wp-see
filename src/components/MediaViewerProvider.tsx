"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { AttachmentKind } from "@/lib/types";
import { debugLog } from "@/lib/debug";
import { MediaViewerOverlay } from "./MediaViewerOverlay";

export type MediaViewerItem = {
  url: string;
  kind: AttachmentKind;
  filename: string;
};

type MediaViewerContextValue = {
  openMedia: (item: MediaViewerItem) => void;
  closeMedia: () => void;
};

const MediaViewerContext = createContext<MediaViewerContextValue | null>(null);

export function MediaViewerProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<MediaViewerItem | null>(null);

  const openMedia = useCallback((next: MediaViewerItem) => {
    debugLog(4, "media-viewer", "Open media", { kind: next.kind, filename: next.filename });
    setItem(next);
  }, []);

  const closeMedia = useCallback(() => {
    debugLog(4, "media-viewer", "Close media");
    setItem(null);
  }, []);

  return (
    <MediaViewerContext.Provider value={{ openMedia, closeMedia }}>
      {children}
      <MediaViewerOverlay item={item} onClose={closeMedia} />
    </MediaViewerContext.Provider>
  );
}

export function useMediaViewerOptional(): MediaViewerContextValue | null {
  return useContext(MediaViewerContext);
}
