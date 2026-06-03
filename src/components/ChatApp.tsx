"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, ChatSummary } from "@/lib/types";
import { debugLog } from "@/lib/debug";
import { exportElementToPdf } from "@/lib/pdf-export";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMySenderName } from "@/hooks/useMySenderName";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatSidebar } from "./ChatSidebar";
import { ChatUploadDialog } from "./ChatUploadDialog";
import { ChatRenameDialog } from "./ChatRenameDialog";
import { ChatDeleteDialog } from "./ChatDeleteDialog";
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
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pdfMessages, setPdfMessages] = useState<ChatMessage[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
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

  const listSummary = useMemo(
    () => (selectedId ? chats.find((c) => c.id === selectedId) ?? null : null),
    [chats, selectedId],
  );

  const activeSummary = summary ?? listSummary;
  const participants = activeSummary?.participants ?? [];
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
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);
    debugLog(4, "app", "Loading chat summary", { id: selectedId });

    fetch(`/api/chats/${encodeURIComponent(selectedId)}`)
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary ?? null);
        setSummaryLoading(false);
        debugLog(4, "app", "Chat summary loaded", { id: selectedId });
      })
      .catch((err) => {
        debugLog(1, "app", "Failed to load chat summary", err);
        setSummaryLoading(false);
      });
  }, [selectedId]);

  const handleSelectChat = useCallback(
    (id: string) => {
      setSelectedId(id);
      setSummary(null);
      if (isMobile) setMobileShowChat(true);
      debugLog(4, "app", "Chat selected (optimistic)", { id });
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
      setSummary(imported);
      if (isMobile) setMobileShowChat(true);
      debugLog(3, "app", "Chat imported (optimistic add)", { id: imported.id });
    },
    [isMobile],
  );

  const handleExportPdf = useCallback(async () => {
    if (!selectedId || !activeSummary) return;
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
        const safeName = activeSummary.title.replace(/[^\w\s-]/g, "").trim() || "chat";
        await exportElementToPdf(pdfRef.current, `${safeName}-whatsapp.pdf`);
      }
    } catch (err) {
      debugLog(1, "app", "PDF export failed", err);
      alert("Errore durante l'esportazione PDF. Riprova.");
    } finally {
      setExporting(false);
      setPdfMessages([]);
    }
  }, [selectedId, activeSummary]);

  const openRename = useCallback(() => {
    setActionError(null);
    setRenameOpen(true);
  }, []);

  const openDelete = useCallback(() => {
    setActionError(null);
    setDeleteOpen(true);
  }, []);

  const handleRename = useCallback(
    async (title: string) => {
      if (!selectedId || !activeSummary) return;

      const previousChats = chats;
      const previousSummary = summary;
      const previousSelectedId = selectedId;

      const optimistic: ChatSummary = { ...activeSummary, title };
      setChats((prev) => prev.map((c) => (c.id === selectedId ? optimistic : c)));
      setSummary(optimistic);
      setRenameOpen(false);
      setRenameLoading(true);
      setActionError(null);
      debugLog(3, "app", "Renaming chat (optimistic)", { id: selectedId, title });

      try {
        const res = await fetch(`/api/chats/${encodeURIComponent(selectedId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Errore rinomina");

        const updated: ChatSummary = data.summary;
        setChats((prev) => {
          const without = prev.filter((c) => c.id !== selectedId);
          const exists = without.some((c) => c.id === updated.id);
          return exists
            ? without.map((c) => (c.id === updated.id ? updated : c))
            : [...without, updated];
        });
        setSelectedId(updated.id);
        setSummary(updated);
        debugLog(3, "app", "Rename confirmed", { id: updated.id });
      } catch (err) {
        setChats(previousChats);
        setSummary(previousSummary);
        setSelectedId(previousSelectedId);
        const message = err instanceof Error ? err.message : "Errore rinomina";
        debugLog(1, "app", "Rename failed — rolled back", err);
        setActionError(message);
        setRenameOpen(true);
      } finally {
        setRenameLoading(false);
      }
    },
    [selectedId, activeSummary, chats, summary],
  );

  const handleDelete = useCallback(async () => {
    if (!selectedId) return;

    const idToDelete = selectedId;
    const previousChats = chats;
    const previousSelectedId = selectedId;
    const previousSummary = summary;
    const previousMobileShowChat = mobileShowChat;

    const remaining = chats.filter((c) => c.id !== idToDelete);
    const nextId = remaining[0]?.id ?? null;

    setPendingDeleteIds((prev) => [...prev, idToDelete]);
    setChats(remaining);
    setDeleteOpen(false);
    setSelectedId(nextId);
    setSummary(nextId ? (remaining.find((c) => c.id === nextId) ?? null) : null);
    if (isMobile) setMobileShowChat(false);
    setDeleteLoading(true);
    setActionError(null);
    debugLog(3, "app", "Deleting chat (optimistic)", { id: idToDelete });

    try {
      const res = await fetch(`/api/chats/${encodeURIComponent(idToDelete)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore eliminazione");
      debugLog(3, "app", "Delete confirmed", { id: idToDelete });
    } catch (err) {
      setChats(previousChats);
      setSelectedId(previousSelectedId);
      setSummary(previousSummary);
      if (isMobile) setMobileShowChat(previousMobileShowChat);
      const message = err instanceof Error ? err.message : "Errore eliminazione";
      debugLog(1, "app", "Delete failed — rolled back", err);
      setActionError(message);
      setDeleteOpen(true);
    } finally {
      setPendingDeleteIds((prev) => prev.filter((id) => id !== idToDelete));
      setDeleteLoading(false);
    }
  }, [selectedId, chats, summary, isMobile, mobileShowChat]);

  return (
    <div className="app-shell flex overflow-hidden bg-[var(--wa-border)]">
      <ChatSidebar
        chats={chats}
        selectedId={selectedId}
        onSelect={handleSelectChat}
        onUploadClick={() => setUploadOpen(true)}
        loading={loadingChats}
        storageMode={storageMode}
        pendingDeleteIds={pendingDeleteIds}
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
        {selectedId && activeSummary ? (
          <>
            <ChatHeader
              summary={activeSummary}
              myName={myName}
              participants={participants}
              onMyNameChange={setMyName}
              onExportPdf={handleExportPdf}
              onRename={openRename}
              onDelete={openDelete}
              exporting={exporting}
              onBack={isMobile ? handleBackToList : undefined}
              isMobile={isMobile}
              loading={summaryLoading && !summary}
              pending={pendingDeleteIds.includes(selectedId)}
            />
            <ChatMessageList chatId={selectedId} summary={activeSummary} myName={myName} />
          </>
        ) : (
          <div className="safe-top flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-center md:px-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--wa-header)] shadow-sm">
              <span className="text-3xl" aria-hidden>
                💬
              </span>
            </div>
            <div className="max-w-sm space-y-2">
              <p className="text-lg font-medium text-[var(--wa-text)]">
                {isMobile ? "Tocca una chat per aprirla" : "Seleziona una conversazione"}
              </p>
              <p className="text-sm leading-relaxed text-[var(--wa-text-muted)]">
                Importa uno zip WhatsApp con il pulsante{" "}
                <strong className="text-[var(--wa-text)]">+ Importa</strong> oppure seleziona una
                chat dalla lista.
              </p>
            </div>
          </div>
        )}
      </main>

      {pdfMessages.length > 0 && activeSummary && selectedId && (
        <PdfExportView
          ref={pdfRef}
          chatId={selectedId}
          summary={activeSummary}
          messages={pdfMessages}
          myName={myName}
          title={activeSummary.title}
        />
      )}

      <ChatUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onImported={handleImported}
      />

      {activeSummary && (
        <>
          <ChatRenameDialog
            open={renameOpen}
            currentTitle={activeSummary.title}
            loading={renameLoading}
            error={actionError}
            onClose={() => {
              setRenameOpen(false);
              setActionError(null);
            }}
            onConfirm={handleRename}
          />
          <ChatDeleteDialog
            open={deleteOpen}
            title={activeSummary.title}
            source={activeSummary.source ?? "local"}
            loading={deleteLoading}
            error={actionError}
            onClose={() => {
              setDeleteOpen(false);
              setActionError(null);
            }}
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  );
}
