"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatSummary } from "@/lib/types";
import { debugLog } from "@/lib/debug";
import { exportElementToPdf } from "@/lib/pdf-export";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMySenderName } from "@/hooks/useMySenderName";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatSidebar } from "./ChatSidebar";
import { ChatUploadDialog } from "./ChatUploadDialog";
import { PdfExportView } from "./PdfExportView";

function waitForImages(root: HTMLElement | null): Promise<void> {
  if (!root) return Promise.resolve();
  const imgs = Array.from(root.querySelectorAll("img"));
  if (imgs.length === 0) return Promise.resolve();
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  ).then(() => undefined);
}

export function ChatApp() {
  const isMobile = useIsMobile();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [summary, setSummary] = useState<ChatSummary | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pdfMessages, setPdfMessages] = useState<ChatMessage[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [storageMode, setStorageMode] = useState<string>("local");
  const pdfRef = useRef<HTMLDivElement>(null);

  const loadChats = useCallback(() => {
    setLoadingChats(true);
    return fetch("/api/chats")
      .then((r) => r.json())
      .then((data) => {
        const list: ChatSummary[] = data.chats ?? [];
        setChats(list);
        setStorageMode(data.storage?.mode ?? "local");
        setLoadingChats(false);
        debugLog(4, "app", "Chats loaded", { count: list.length, storage: data.storage?.mode });
        return list;
      })
      .catch((err) => {
        debugLog(1, "app", "Failed to load chats", err);
        setLoadingChats(false);
        return [] as ChatSummary[];
      });
  }, []);

  const participants = summary?.participants ?? [];
  const { myName, setMyName } = useMySenderName(participants, selectedId);

  const showListOnMobile = isMobile && !mobileShowChat;
  const showChatOnMobile = isMobile && mobileShowChat && selectedId;

  useEffect(() => {
    loadChats().then((list) => {
      if (list.length > 0 && !isMobile) {
        setSelectedId((prev) => prev ?? list[0].id);
      }
    });
  }, [isMobile, loadChats]);

  useEffect(() => {
    if (!isMobile && chats.length > 0 && !selectedId) {
      setSelectedId(chats[0].id);
    }
  }, [isMobile, chats, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setSummary(null);
      return;
    }
    fetch(`/api/chats/${encodeURIComponent(selectedId)}`)
      .then((r) => r.json())
      .then((data) => setSummary(data.summary ?? null));
  }, [selectedId]);

  const handleSelectChat = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (isMobile) setMobileShowChat(true);
    },
    [isMobile],
  );

  const handleBackToList = useCallback(() => {
    setMobileShowChat(false);
  }, []);

  const handleImported = useCallback(
    (imported: ChatSummary) => {
      setChats((prev) => {
        const exists = prev.some((c) => c.id === imported.id);
        return exists ? prev.map((c) => (c.id === imported.id ? imported : c)) : [...prev, imported];
      });
      setSelectedId(imported.id);
      if (isMobile) setMobileShowChat(true);
    },
    [isMobile],
  );

  const handleExportPdf = useCallback(async () => {
    if (!selectedId || !summary) return;
    setExporting(true);
    debugLog(3, "app", "Preparing PDF export");

    try {
      const res = await fetch(
        `/api/chats/${encodeURIComponent(selectedId)}/messages?all=true`,
      );
      const data = await res.json();
      setPdfMessages(data.messages ?? []);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await waitForImages(pdfRef.current);

      if (pdfRef.current) {
        const safeName = summary.title.replace(/[^\w\s-]/g, "").trim() || "chat";
        await exportElementToPdf(pdfRef.current, `${safeName}-whatsapp.pdf`);
      }
    } catch (err) {
      debugLog(1, "app", "PDF export failed", err);
      alert("Errore durante l'esportazione PDF. Riprova.");
    } finally {
      setExporting(false);
      setPdfMessages([]);
    }
  }, [selectedId, summary]);

  return (
    <div className="app-shell flex overflow-hidden bg-[#d1d7db]">
      <ChatSidebar
        chats={chats}
        selectedId={selectedId}
        onSelect={handleSelectChat}
        onUploadClick={() => setUploadOpen(true)}
        loading={loadingChats}
        storageMode={storageMode}
        className={
          showListOnMobile || !isMobile
            ? showChatOnMobile
              ? "hidden md:flex"
              : "flex"
            : "hidden"
        }
      />

      <main
        className={`min-w-0 flex-1 flex-col bg-[#efeae2] ${
          showListOnMobile ? "hidden md:flex" : "flex"
        }`}
      >
        {summary && selectedId ? (
          <>
            <ChatHeader
              summary={summary}
              myName={myName}
              participants={participants}
              onMyNameChange={setMyName}
              onExportPdf={handleExportPdf}
              exporting={exporting}
              onBack={isMobile ? handleBackToList : undefined}
              isMobile={isMobile}
            />
            <ChatMessageList chatId={selectedId} summary={summary} myName={myName} />
          </>
        ) : (
          <div className="safe-top flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-[#667781] md:p-8">
            <p className="text-lg font-medium text-[#111b21]">
              {isMobile ? "Tocca una chat per aprirla" : "Seleziona una conversazione"}
            </p>
            <p className="max-w-md text-sm leading-relaxed">
              Importa uno zip WhatsApp con il pulsante <strong>+ Importa</strong> oppure seleziona
              una chat dalla lista.
            </p>
          </div>
        )}
      </main>

      {pdfMessages.length > 0 && summary && selectedId && (
        <PdfExportView
          ref={pdfRef}
          chatId={selectedId}
          summary={summary}
          messages={pdfMessages}
          myName={myName}
          title={summary.title}
        />
      )}

      <ChatUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onImported={handleImported}
      />
    </div>
  );
}
