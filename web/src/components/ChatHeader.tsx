"use client";

import { useState } from "react";
import type { ChatSummary } from "@/lib/types";
import { ChatActionsSheet } from "./ChatActionsSheet";
import { BackIcon, MenuIcon } from "./icons";

type ChatHeaderProps = {
  summary: ChatSummary;
  myName: string;
  participants: string[];
  onMyNameChange: (name: string) => void;
  onExportPdf: () => void;
  exporting: boolean;
  onBack?: () => void;
  isMobile?: boolean;
};

export function ChatHeader({
  summary,
  myName,
  participants,
  onMyNameChange,
  onExportPdf,
  exporting,
  onBack,
  isMobile,
}: ChatHeaderProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const dateShort =
    summary.dateRange &&
    `${summary.dateRange.from} – ${summary.dateRange.to}`;

  return (
    <>
      <header className="safe-top flex shrink-0 flex-col border-b border-[#d1d7db] bg-[#f0f2f5]">
        <div className="flex min-h-[56px] items-center gap-2 px-2 py-2 sm:gap-3 sm:px-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-[#111b21] active:bg-[#e9edef] md:hidden"
              aria-label="Torna alle chat"
            >
              <BackIcon />
            </button>
          )}

          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dfe5e7] text-lg font-semibold text-[#54656f]"
            aria-hidden
          >
            {summary.title.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-medium text-[#111b21]">{summary.title}</h1>
            <p className="truncate text-xs text-[#667781]">
              {summary.messageCount} messaggi
              {dateShort && !isMobile ? ` · ${dateShort}` : ""}
            </p>
          </div>

          {isMobile ? (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-[#54656f] active:bg-[#e9edef]"
              aria-label="Opzioni chat"
            >
              <MenuIcon />
            </button>
          ) : (
            <>
              <label className="hidden shrink-0 flex-col text-right lg:flex">
                <span className="text-[10px] text-[#667781]">I miei messaggi come</span>
                <select
                  value={myName}
                  onChange={(e) => onMyNameChange(e.target.value)}
                  className="mt-0.5 max-w-[200px] truncate rounded border border-[#d1d7db] bg-white px-2 py-1.5 text-xs text-[#111b21]"
                >
                  {participants.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={onExportPdf}
                disabled={exporting}
                className="hidden shrink-0 touch-manipulation rounded-lg bg-[#008069] px-3 py-2 text-sm font-medium text-white hover:bg-[#006b57] active:bg-[#006b57] disabled:opacity-60 sm:inline-flex"
              >
                {exporting ? "PDF…" : "Scarica PDF"}
              </button>
            </>
          )}
        </div>

        {!isMobile && (
          <div className="flex gap-2 border-t border-[#e9edef] px-4 py-2 lg:hidden">
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[10px] text-[#667781]">I miei messaggi come</span>
              <select
                value={myName}
                onChange={(e) => onMyNameChange(e.target.value)}
                className="min-h-[40px] w-full rounded-lg border border-[#d1d7db] bg-white px-2 text-sm text-[#111b21]"
              >
                {participants.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={onExportPdf}
              disabled={exporting}
              className="mt-auto min-h-[40px] shrink-0 touch-manipulation self-end rounded-lg bg-[#008069] px-4 text-sm font-medium text-white active:bg-[#006b57] disabled:opacity-60 sm:hidden"
            >
              PDF
            </button>
          </div>
        )}
      </header>

      {isMobile && (
        <ChatActionsSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          myName={myName}
          participants={participants}
          onMyNameChange={onMyNameChange}
          onExportPdf={onExportPdf}
          exporting={exporting}
        />
      )}
    </>
  );
}
