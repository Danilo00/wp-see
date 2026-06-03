"use client";

import { useState } from "react";
import type { ChatSummary } from "@/lib/types";
import { Skeleton } from "./ui/Skeleton";
import { Button } from "./ui/Button";
import { ChatActionsSheet } from "./ChatActionsSheet";
import { BackIcon, MenuIcon } from "./icons";

type ChatHeaderProps = {
  summary: ChatSummary;
  myName: string;
  participants: string[];
  onMyNameChange: (name: string) => void;
  onExportPdf: () => void;
  onRename: () => void;
  onDelete: () => void;
  exporting: boolean;
  onBack?: () => void;
  isMobile?: boolean;
  loading?: boolean;
  pending?: boolean;
};

function HeaderAvatar({ title }: { title: string }) {
  const initial = title.charAt(0).toUpperCase();
  const hue = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white shadow-sm"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 45% 45%), hsl(${hue} 55% 38%))` }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function ChatHeader({
  summary,
  myName,
  participants,
  onMyNameChange,
  onExportPdf,
  onRename,
  onDelete,
  exporting,
  onBack,
  isMobile,
  loading,
  pending,
}: ChatHeaderProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const dateShort =
    summary.dateRange && `${summary.dateRange.from} – ${summary.dateRange.to}`;

  return (
    <>
      <header
        className={`safe-top shrink-0 border-b border-[var(--wa-border)] bg-[var(--wa-header)] transition-opacity ${
          pending ? "opacity-70" : ""
        }`}
      >
        <div className="flex min-h-[60px] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-[var(--wa-text)] transition active:bg-[#e9edef] md:hidden"
              aria-label="Torna alle chat"
            >
              <BackIcon />
            </button>
          )}

          {loading ? (
            <Skeleton className="h-11 w-11 shrink-0" rounded="full" />
          ) : (
            <HeaderAvatar title={summary.title} />
          )}

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <>
                <h1 className="truncate text-base font-medium text-[var(--wa-text)]">
                  {summary.title}
                </h1>
                <p className="truncate text-xs text-[var(--wa-text-muted)]">
                  {summary.messageCount} messaggi
                  {dateShort && !isMobile ? ` · ${dateShort}` : ""}
                </p>
              </>
            )}
          </div>

          {isMobile ? (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              disabled={loading}
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-[#54656f] transition active:bg-[#e9edef] disabled:opacity-50"
              aria-label="Opzioni chat"
            >
              <MenuIcon />
            </button>
          ) : (
            <>
              <label className="hidden shrink-0 flex-col text-right lg:flex">
                <span className="text-[10px] text-[var(--wa-text-muted)]">I miei messaggi come</span>
                <select
                  value={myName}
                  onChange={(e) => onMyNameChange(e.target.value)}
                  disabled={loading}
                  className="mt-0.5 max-w-[200px] truncate rounded-lg border border-[var(--wa-border)] bg-white px-2.5 py-1.5 text-xs text-[var(--wa-text)] transition focus:border-[var(--wa-accent)] focus:outline-none disabled:opacity-50"
                >
                  {participants.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                variant="primary"
                onClick={onExportPdf}
                disabled={exporting || loading}
                className="hidden shrink-0 sm:inline-flex"
              >
                {exporting ? "PDF…" : "Scarica PDF"}
              </Button>
              <Button
                variant="secondary"
                onClick={onRename}
                disabled={loading || pending}
                className="hidden shrink-0 sm:inline-flex"
              >
                Rinomina
              </Button>
              <Button
                variant="dangerSoft"
                onClick={onDelete}
                disabled={loading || pending}
                className="hidden shrink-0 sm:inline-flex"
              >
                Elimina
              </Button>
            </>
          )}
        </div>

        {!isMobile && (
          <div className="flex gap-2 border-t border-[#e9edef] px-4 py-2.5 lg:hidden">
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[10px] text-[var(--wa-text-muted)]">I miei messaggi come</span>
              <select
                value={myName}
                onChange={(e) => onMyNameChange(e.target.value)}
                disabled={loading}
                className="min-h-[44px] w-full rounded-xl border border-[var(--wa-border)] bg-white px-3 text-sm text-[var(--wa-text)] disabled:opacity-50"
              >
                {participants.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="primary"
              onClick={onExportPdf}
              disabled={exporting || loading}
              className="mt-auto shrink-0 self-end sm:hidden"
            >
              PDF
            </Button>
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
          onRename={onRename}
          onDelete={onDelete}
          exporting={exporting}
        />
      )}
    </>
  );
}
