"use client";

import { useEffect, useRef } from "react";
import { debugLog } from "@/lib/debug";

export const WHATSAPP_WEB_URL = "https://web.whatsapp.com/";

type WhatsAppWebFrameProps = {
  frameKey: number;
  onLoad: () => void;
  onError: () => void;
};

const IFRAME_LOAD_TIMEOUT_MS = 8000;

export function WhatsAppWebFrame({ frameKey, onLoad, onError }: WhatsAppWebFrameProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    loadedRef.current = false;
    debugLog(4, "whatsapp-web", "Iframe mount", { frameKey, url: WHATSAPP_WEB_URL });

    timeoutRef.current = setTimeout(() => {
      if (!loadedRef.current) {
        debugLog(2, "whatsapp-web", "Iframe load timeout", { frameKey });
        onError();
      }
    }, IFRAME_LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [frameKey, onError]);

  const handleLoad = () => {
    loadedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    debugLog(4, "whatsapp-web", "Iframe loaded", { frameKey });
    onLoad();
  };

  return (
    <iframe
      key={frameKey}
      src={WHATSAPP_WEB_URL}
      title="WhatsApp Web"
      className="h-full w-full border-0 bg-white"
      allow="microphone; camera; clipboard-read; clipboard-write; fullscreen"
      referrerPolicy="no-referrer-when-downgrade"
      onLoad={handleLoad}
      onError={() => {
        debugLog(1, "whatsapp-web", "Iframe error event", { frameKey });
        onError();
      }}
    />
  );
}
