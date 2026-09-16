import data from "./yard-map.json";

export type YardKind = "goto" | "look";
export type YardTone = "gold" | "copper" | "teal" | "violet" | "hero";

export type YardPin = {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: YardKind;
  goto?: string;
  char?: string;
  blurb: string;
  offscreen?: boolean;
  cloud?: boolean;
  thumb?: string;
  tone?: YardTone;
};

export type YardLayer = {
  id: string;
  title: string;
  kicker: string;
  hint: string;
  src: string;
  wide: boolean;
  pins: YardPin[];
};

export const YARD_LAYERS = data.layers as YardLayer[];

export function getYardLayer(id: string) {
  return YARD_LAYERS.find((l) => l.id === id) || YARD_LAYERS[0];
}

export const YARD_COVER = "/maps/yard.jpg?v=1.53.8";
