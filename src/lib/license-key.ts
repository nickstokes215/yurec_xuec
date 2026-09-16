import { unlockPaid } from "@/lib/use-paid";
import { unlockDeveloper } from "@/lib/use-settings";

export function applyLicenseKey(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (unlockDeveloper(v)) return true;
  return unlockPaid(v);
}
