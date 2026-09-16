import { useEffect, useState } from "react";
import {
  cancelDownload,
  initOffline,
  offlineSnap,
  playOffline,
  startDownload,
  subscribeOffline,
  type OfflineItem,
} from "@/lib/offline";
import { usePaid } from "@/lib/use-paid";
import { LicenseDialog } from "@/components/license-dialog";
import { cn } from "@/lib/utils";

export function OfflineBtn({ item, className }: { item: OfflineItem; className?: string }) {
  const { paid } = usePaid();
  const [gate, setGate] = useState(false);
  const [, bump] = useState(0);
  useEffect(() => {
    initOffline();
    return subscribeOffline(() => bump((n) => n + 1));
  }, []);
  const snap = offlineSnap(item.id);
  const busy = snap.state === "downloading";
  const cached = snap.state === "cached";
  const label = busy ? `${snap.progress}%` : cached ? "Оффлайн" : snap.state === "error" ? "Ещё раз" : "Скачать";

  async function onClick() {
    if (!paid) {
      setGate(true);
      return;
    }
    if (busy) {
      cancelDownload(item);
      return;
    }
    if (cached) {
      await playOffline(item);
      return;
    }
    startDownload(item);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void onClick()}
        title={snap.error || item.title}
        className={cn(
          "inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full px-3 text-xs font-medium",
          cached ? "bg-off text-off-fg" : "bg-dl text-dl-fg",
          className,
        )}
      >
        {label}
      </button>
      <LicenseDialog open={gate} onClose={() => setGate(false)} />
    </>
  );
}
