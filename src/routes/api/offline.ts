import { createFileRoute } from "@tanstack/react-router";
import pack from "@/data/offline-index.json";

type Item = {
  id: string;
  url: string;
  size: number;
  sha256: string;
  file: string;
  ext?: string;
  kind?: string;
};

const items = (pack as { items: Item[] }).items;

function extOf(item: Item) {
  if (item.ext === "mp3") return "mp3";
  const f = (item.file || "").toLowerCase();
  if (f.endsWith(".mp3") || item.kind === "call") return "mp3";
  return "mp4";
}

async function hrefFor(publicUrl: string) {
  const api =
    "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=" + encodeURIComponent(publicUrl);
  const res = await fetch(api, { headers: { "User-Agent": "YurecOffline/1.50" } });
  if (!res.ok) throw new Error("yandex " + res.status);
  const data = (await res.json()) as { href?: string };
  if (!data.href) throw new Error("no href");
  return data.href;
}

export const Route = createFileRoute("/api/offline")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const id = u.searchParams.get("id") || "";
        const mode = u.searchParams.get("mode") || "meta";
        const item = items.find((x) => x.id === id);
        if (!item) return new Response("not found", { status: 404 });
        try {
          const href = await hrefFor(item.url);
          if (mode !== "file") {
            return Response.json({ id: item.id, href, size: item.size, sha256: item.sha256, file: item.file });
          }
          const up = await fetch(href, { headers: { "User-Agent": "YurecOffline/1.50" } });
          if (!up.ok || !up.body) return new Response("upstream " + up.status, { status: 502 });
          const ext = extOf(item);
          const headers = new Headers();
          headers.set("Content-Type", ext === "mp3" ? "audio/mpeg" : "video/mp4");
          headers.set("Cache-Control", "no-store");
          const len = up.headers.get("content-length") || String(item.size);
          if (len) headers.set("Content-Length", len);
          headers.set("Content-Disposition", 'attachment; filename="' + item.id + "." + ext + '"');
          return new Response(up.body, { status: 200, headers });
        } catch (e) {
          return new Response(e instanceof Error ? e.message : "fail", { status: 502 });
        }
      },
    },
  },
});
