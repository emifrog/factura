"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function QuotePublicLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponible : l'utilisateur peut copier manuellement.
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="h-9 flex-1 rounded-md border border-border-strong bg-surface-subtle px-3 text-xs text-ink-muted"
      />
      <Button type="button" variant="secondary" size="sm" onClick={copy}>
        {copied ? (
          <IconCheck size={14} aria-hidden />
        ) : (
          <IconCopy size={14} aria-hidden />
        )}
        {copied ? "Copié" : "Copier"}
      </Button>
    </div>
  );
}
