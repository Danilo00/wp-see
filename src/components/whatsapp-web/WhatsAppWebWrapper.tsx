"use client";

import { useCallback, useEffect, useState } from "react";
import { debugLog } from "@/lib/debug";
import { useIsMobile } from "@/hooks/useIsMobile";
import { WhatsAppWebToolbar } from "./WhatsAppWebToolbar";
import { WhatsAppWebFrame, WHATSAPP_WEB_URL } from "./WhatsAppWebFrame";
import { WhatsAppWebFallback } from "./WhatsAppWebFallback";

type ViewMode = "iframe" | "fallback";

export function WhatsAppWebWrapper() {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>("iframe");
  const [frameKey, setFrameKey] = useState(0);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    debugLog(4, "whatsapp-web", "Wrapper mounted", { isMobile });
  }, [isMobile]);

  const openDirect = useCallback(() => {
    debugLog(3, "whatsapp-web", "Opening WhatsApp Web in same window");
    window.location.assign(WHATSAPP_WEB_URL);
  }, []);

  const refreshIframe = useCallback(() => {
    debugLog(4, "whatsapp-web", "Refreshing iframe");
    setIframeReady(false);
    setViewMode("iframe");
    setFrameKey((k) => k + 1);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIframeReady(true);
  }, []);

  const handleIframeError = useCallback(() => {
    debugLog(2, "whatsapp-web", "Switching to fallback view");
    setViewMode("fallback");
  }, []);

  const toggleToolbar = useCallback(() => {
    setToolbarCollapsed((current) => {
      const next = !current;
      debugLog(4, "whatsapp-web", "Toolbar toggled", { collapsed: next });
      return next;
    });
  }, []);

  return (
    <div className="wa-web-shell flex h-full flex-col overflow-hidden bg-(--wa-header)">
      <WhatsAppWebToolbar
        collapsed={toolbarCollapsed}
        onToggleCollapse={toggleToolbar}
        onRefresh={refreshIframe}
        onOpenDirect={openDirect}
      />

      <div className="safe-bottom relative min-h-0 flex-1 bg-white">
        {viewMode === "fallback" ? (
          <WhatsAppWebFallback onOpenDirect={openDirect} onRetryIframe={refreshIframe} />
        ) : (
          <>
            {!iframeReady && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-(--wa-header)">
                <div className="h-10 w-10 animate-pulse rounded-full bg-(--wa-accent)/20" />
                <p className="text-sm text-(--wa-text-muted)">Caricamento WhatsApp Web…</p>
              </div>
            )}
            <WhatsAppWebFrame
              frameKey={frameKey}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </>
        )}

        {viewMode === "iframe" && iframeReady && isMobile && (
          <button
            type="button"
            onClick={() => setViewMode("fallback")}
            className="safe-bottom absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm"
          >
            Non si vede? Tocca qui
          </button>
        )}
      </div>
    </div>
  );
}
