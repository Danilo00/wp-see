"use client";

import { Button } from "@/components/ui/Button";

type WhatsAppWebFallbackProps = {
  onOpenDirect: () => void;
  onRetryIframe: () => void;
};

export function WhatsAppWebFallback({ onOpenDirect, onRetryIframe }: WhatsAppWebFallbackProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--wa-accent)] text-3xl text-white shadow-sm">
        WA
      </div>
      <div className="max-w-sm space-y-2">
        <h2 className="text-lg font-semibold text-[var(--wa-text)]">WhatsApp Web non caricato</h2>
        <p className="text-sm leading-relaxed text-[var(--wa-text-muted)]">
          Su molti browser mobile WhatsApp blocca la visualizzazione in iframe. Apri la sessione
          direttamente oppure riprova l&apos;embed.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button fullWidth onClick={onOpenDirect}>
          Apri WhatsApp Web
        </Button>
        <Button variant="secondary" fullWidth onClick={onRetryIframe}>
          Riprova embed
        </Button>
      </div>
    </div>
  );
}
