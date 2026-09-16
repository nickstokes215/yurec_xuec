import raw from "./achievements.json";
import changelogJson from "./changelog.json";

export type Achievement = {
  id: string;
  title: string;
  flavor: string;
  hint: string;
  photo: string;
};

type File = {
  cover: string;
  locked: string;
  pitch: string;
  items: Omit<Achievement, "photo">[];
};

const data = raw as File;
const v = changelogJson.version;

function withV(path: string) {
  return `${path}?v=${v}`;
}

export const ACH_COVER = withV(data.cover);
export const ACH_LOCKED = withV(data.locked);
export const ACH_PITCH = data.pitch;

export const ACHIEVEMENTS: Achievement[] = data.items.map((item) => ({
  ...item,
  photo: withV(`/achievements/${item.id}.jpg`),
}));

export const ACH_TOTAL = ACHIEVEMENTS.length;

