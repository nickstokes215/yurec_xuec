import { LEVELS } from "@/data/game";
import { matchCheat, matchDev, matchJoke, matchPaid, matchRaven } from "@/lib/secret-gate";
import { setAchPeek } from "@/lib/use-achievements";
import { unlockAllEndings } from "@/lib/use-game";
import { unlockPaid } from "@/lib/use-paid";
import { unlockDeveloper } from "@/lib/use-settings";

export type CheatKind = "joke" | "raven" | "hack" | "paid" | "dev";

export function unlockAllPlay() {
  try {
    localStorage.setItem("yurec-av-all", "1");
    localStorage.setItem("yurec-av-batya", "1");
    localStorage.setItem("yurec-av-sveta", "1");
    localStorage.setItem("yurec-av-kostya", "1");
    localStorage.setItem("yurec-ark-all", "1");
  } catch {
    /* ignore */
  }
  for (const lvl of LEVELS) {
    unlockAllEndings(
      lvl.id,
      (lvl.endings || []).map((e) => e.id),
    );
  }
}

export function fireRavenJoke() {
  try {
    window.dispatchEvent(new Event("yurec-raven"));
  } catch {
    /* ignore */
  }
}

export function applyAdminCheat(raw: string): CheatKind | false {
  if (matchJoke(raw)) {
    fireRavenJoke();
    return "joke";
  }
  if (matchRaven(raw)) {
    setAchPeek(true);
    return "raven";
  }
  if (matchCheat(raw)) {
    unlockAllPlay();
    return "hack";
  }
  if (matchDev(raw)) {
    unlockDeveloper(raw);
    return "dev";
  }
  if (matchPaid(raw)) {
    unlockPaid(raw);
    return "paid";
  }
  return false;
}

export const CHEAT_MSG: Record<CheatKind, string> = {
  joke: "Гоша каркнул. И всё. Двор ржёт.",
  raven: "Все зашквары открыты до перезахода. Честные медали на месте.",
  hack: "Уровни открыты. Даже бабка вышла из бака.",
  paid: "Лицензия стоит. Двор твой.",
  dev: "Режим разработчика. Студия и чат открываются без спроса.",
};
