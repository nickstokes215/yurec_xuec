import { createFileRoute, Navigate } from "@tanstack/react-router";
import { OfflineAccessPage } from "@/components/offline-manager";
import { usePaid } from "@/lib/use-paid";

export const Route = createFileRoute("/offline")({ component: OfflineRoute });

function OfflineRoute() {
  const { paid } = usePaid();
  if (!paid) return <Navigate to="/donate" />;
  return <OfflineAccessPage />;
}
