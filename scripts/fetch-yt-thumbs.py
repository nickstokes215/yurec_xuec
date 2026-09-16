#!/usr/bin/env python3
# Скачивает обложки YouTube в public/thumbs/{код}.jpg
# Имена берутся из videos.json → thumb (s01e00.jpg, song-nlo.jpg и т.д.).
from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "thumbs"
VIDEOS = ROOT / "src" / "data" / "videos.json"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
QUALITIES = ("sddefault.jpg", "hqdefault.jpg", "mqdefault.jpg", "maxresdefault.jpg")


def is_jpeg(data: bytes) -> bool:
    return len(data) > 4000 and data[:2] == b"\xff\xd8"


def fetch(url: str) -> bytes | None:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "image/jpeg,image/*;q=0.8,*/*;q=0.5",
            "Referer": "https://www.youtube.com/",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read()
        return data if is_jpeg(data) else None
    except Exception as e:
        print("  miss", url, e, file=sys.stderr)
        return None


def grab(vid: str) -> bytes | None:
    for q in QUALITIES:
        for host in ("i.ytimg.com", "img.youtube.com"):
            data = fetch(f"https://{host}/vi/{vid}/{q}")
            if data:
                return data
    return None


def dest_for(v: dict) -> Path | None:
    thumb = str(v.get("thumb") or "")
    if thumb.startswith("/thumbs/") and thumb.endswith(".jpg"):
        return ROOT / "public" / thumb.lstrip("/").split("?")[0]
    return None


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    videos = json.loads(VIDEOS.read_text(encoding="utf-8"))
    need = [
        v
        for v in videos
        if v.get("id")
        and v.get("mediaType") != "image"
        and not str(v.get("id")).startswith("tg")
        and dest_for(v) is not None
    ]
    ok = 0
    fail = []
    for v in need:
        dest = dest_for(v)
        if dest is None:
            continue
        if dest.is_file() and dest.stat().st_size > 4000:
            ok += 1
            continue
        data = grab(v["id"])
        if not data:
            fail.append(v["id"])
            print("FAIL", v["id"], dest.name)
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        ok += 1
        print(f"OK   {v['id']}  {len(data)}  {dest.name}")
    print(f"thumbs {ok}/{len(need)}, fail {len(fail)}")
    if fail:
        print("missing:", ", ".join(fail), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
