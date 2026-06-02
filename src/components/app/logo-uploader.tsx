"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState, useRef } from "react";
import { IconUpload, IconTrash, IconPhoto } from "@tabler/icons-react";
import {
  uploadLogo,
  deleteLogo,
  type LogoState,
} from "@/lib/company/logo-actions";
import { Button } from "@/components/ui/button";

const initialState: LogoState = { status: "idle" };

export function LogoUploader({ logoUrl }: { logoUrl: string | null }) {
  const [state, formAction, isUploading] = useActionState(
    uploadLogo,
    initialState,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-5">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-subtle">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo de l'entreprise"
              className="size-full object-contain"
            />
          ) : (
            <IconPhoto size={28} className="text-ink-subtle" aria-hidden />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <form action={formAction} className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full text-sm text-ink-muted file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-border-strong file:bg-surface file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand"
              onChange={(e) => {
                if (e.target.files?.length) e.target.form?.requestSubmit();
              }}
            />
            {isUploading && (
              <span className="flex items-center gap-1.5 text-sm text-ink-muted">
                <IconUpload size={16} aria-hidden /> Envoi…
              </span>
            )}
          </form>
          <p className="text-xs text-ink-subtle">
            PNG, JPEG ou WebP — 2 Mo max. Redimensionné automatiquement.
          </p>
          {state.status === "error" && (
            <p className="text-xs text-danger-strong">{state.message}</p>
          )}
        </div>
      </div>

      {logoUrl && (
        <form action={deleteLogo}>
          <Button type="submit" variant="ghost" size="sm">
            <IconTrash size={16} aria-hidden /> Retirer le logo
          </Button>
        </form>
      )}
    </div>
  );
}
