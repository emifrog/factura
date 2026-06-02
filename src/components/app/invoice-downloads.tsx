"use client";

import { useTransition } from "react";
import { IconDownload } from "@tabler/icons-react";
import { getInvoiceDownloadUrl } from "@/lib/invoices/actions";
import { Button } from "@/components/ui/button";

export function InvoiceDownloads({ id }: { id: string }) {
  const [pending, start] = useTransition();

  const open = (kind: "pdf" | "xml") =>
    start(async () => {
      const url = await getInvoiceDownloadUrl(id, kind);
      if (url) window.open(url, "_blank", "noopener");
    });

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => open("pdf")}
        disabled={pending}
      >
        <IconDownload size={16} aria-hidden /> PDF Factur-X
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => open("xml")}
        disabled={pending}
      >
        <IconDownload size={16} aria-hidden /> XML
      </Button>
    </div>
  );
}
