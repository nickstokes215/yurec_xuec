export type ZoomDetail = {
  src: string;
  gallery?: string[];
  index?: number;
};

export function openZoom(src: string, gallery?: string[], index?: number) {
  if (!src) return;
  window.dispatchEvent(
    new CustomEvent<ZoomDetail>("yurec-zoom", {
      detail: { src, gallery, index },
    }),
  );
}
