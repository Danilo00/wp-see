"use client";

import { useEffect } from "react";

type ChatActionsSheetProps = {
  open: boolean;
  onClose: () => void;
  myName: string;
  participants: string[];
  onMyNameChange: (name: string) => void;
  onExportPdf: () => void;
  exporting: boolean;
};

export function ChatActionsSheet({
  open,
  onClose,
  myName,
  participants,
  onMyNameChange,
  onExportPdf,
  exporting,
}: ChatActionsSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Chiudi menu"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Opzioni chat"
        className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl animate-slide-up"
      >
        <div className="mx-auto mb-3 mt-2 h-1 w-10 rounded-full bg-[#d1d7db]" />
        <div className="px-4 pb-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#111b21]">I miei messaggi come</span>
            <select
              value={myName}
              onChange={(e) => onMyNameChange(e.target.value)}
              className="min-h-[48px] w-full rounded-lg border border-[#d1d7db] bg-[#f0f2f5] px-3 text-base text-[#111b21]"
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
            onClick={() => {
              onExportPdf();
              onClose();
            }}
            disabled={exporting}
            className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#008069] text-base font-medium text-white active:bg-[#006b57] disabled:opacity-60"
          >
            <PdfIcon />
            {exporting ? "Generazione PDF…" : "Scarica chat in PDF"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 flex min-h-[48px] w-full items-center justify-center rounded-lg text-base font-medium text-[#667781] active:bg-[#f0f2f5]"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

function PdfIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
