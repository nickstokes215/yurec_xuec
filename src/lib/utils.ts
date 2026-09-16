import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RETURN_KEY = "yurec-return";

export function rememberReturn(path: string) {
  if (path.startsWith("/story")) return;
  const keep =
    path === "/" ||
    path.startsWith("/videos") ||
    path.startsWith("/press") ||
    path.startsWith("/saved") ||
    path.startsWith("/citats") ||
    path.startsWith("/game") ||
    path.startsWith("/characters");
  if (!keep) return;
  try {
    sessionStorage.setItem(RETURN_KEY, path);
  } catch {
    /* ignore */
  }
}

export function getReturnPath() {
  try {
    return sessionStorage.getItem(RETURN_KEY) || "/";
  } catch {
    return "/";
  }
}