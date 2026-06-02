"use client";

import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";
import { requestAccountDeletion } from "@/lib/account/actions";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-start gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 size-4 rounded border-border-strong"
        />
        Je comprends que mon compte sera clôturé. Mes factures émises restent
        conservées 10 ans (obligation légale).
      </label>
      <form action={requestAccountDeletion}>
        <Button type="submit" variant="danger" size="sm" disabled={!confirmed}>
          <IconTrash size={16} aria-hidden /> Supprimer mon compte
        </Button>
      </form>
    </div>
  );
}
