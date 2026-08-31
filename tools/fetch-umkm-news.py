#!/usr/bin/env python3
"""Fetch UMKM/PUS news from Google News RSS and write assets/data/umkm-news.json."""

from __future__ import annotations

import hashlib
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

QUERIES = [
    "UMKM Indonesia",
    '"usaha mikro" OR "usaha kecil menengah" Indonesia',
    '"pelaku usaha syariah" OR PUS OR pesantren Indonesia UMKM',
    "QRIS UMKM Indonesia",
    "site:bi.go.id UMKM OR syariah",
    "site:kemenkop.go.id UMKM",
]

KEYWORDS = re.compile(
    r"\b(umkm|usaha\s+mikro|usaha\s+kecil|menengah|qr[i]?s|kur|"
    r"pelaku\s+usaha\s+syariah|\bpus\b|ekonomi\s+syariah|halal|"
    r"pesantren|koperasi\s+syariah|bank\s+indonesia|\bbi\b|"
    r"binaan|inkubasi|klaster|ekspor\s+umkm|digitalisasi\s+umkm)\b",
    re.I,
)

NOISE = re.compile(
    r"\b(bola|sepak|politik|pilpres|gaji\s+artis|k-pop|drakor|"
    r"horoskop|goss?ip|seleb)\b",
    re.I,
)

FALLBACK = [
    {
        "title": "BI perluas MDR QRIS 0% untuk seluruh merchant mulai Oktober 2026",
        "url": "https://money.kompas.com/read/2026/08/17/095952526/bi-gratiskan-biaya-transaksi-qris-untuk-seluruh-pedagang-hingga-rp-500000-per",
        "publishedAt": "2026-08-17T00:00:00+00:00",
        "source": "seed",
    },
    {
        "title": "Transaksi QRIS tumbuh seiring digitalisasi UMKM di Indonesia",
        "url": "https://www.liputan6.com/bisnis/read/8273255/transaksi-qris-tumbuh-8242-2-faktor-ini-jadi-penopang",
        "publishedAt": "2026-08-16T00:00:00+00:00",
        "source": "seed",
    },
]


def normalize_title(title: str) -> str:
    return re.sub(r"\s+", " ", (title or "")).strip()


def item_id(title: str, url: str) -> str:
    base = normalize_title(title).lower() + "|" + (url or "").strip().lower()
    return hashlib.sha1(base.encode("utf-8")).hexdigest()[:16]


def is_relevant(title: str) -> bool:
    t = normalize_title(title)
    if len(t) < 12:
        return False
    if NOISE.search(t):
        return False
    return bool(KEYWORDS.search(t))


def parse_pubdate(raw: str) -> str | None:
    raw = (raw or "").strip()
    if not raw:
        return None
    try:
        dt = parsedate_to_datetime(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat()
    except Exception:
        return None


def fetch_rss(query: str) -> list[dict]:
    q = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={q}&hl=id&gl=ID&ceid=ID:id"
    req = urllib.request.Request(url, headers={"User-Agent": "BI-PRAMESTI-news-fetch/1.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        xml_text = resp.read()
    root = ET.fromstring(xml_text)
    items: list[dict] = []
    for node in root.findall(".//item"):
        title = normalize_title(node.findtext("title") or "")
        link = (node.findtext("link") or "").strip()
        pub = parse_pubdate(node.findtext("pubDate") or "")
        if not title or not link.startswith("http"):
            continue
        if not is_relevant(title):
            continue
        items.append(
            {
                "id": item_id(title, link),
                "title": title,
                "url": link,
                "publishedAt": pub,
                "source": "google-news",
            }
        )
    return items


def merge_items(batches: list[list[dict]]) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for batch in batches:
        for it in batch:
            key = it["id"]
            if key in seen:
                continue
            seen.add(key)
            out.append(it)
    out.sort(key=lambda x: x.get("publishedAt") or "", reverse=True)
    return out[:30]


def main() -> int:
    out_path = sys.argv[1] if len(sys.argv) > 1 else "assets/data/umkm-news.json"
    collected: list[list[dict]] = []
    for query in QUERIES:
        try:
            collected.append(fetch_rss(query))
        except Exception as exc:
            print(f"warn: {query!r} -> {exc}", file=sys.stderr)
    items = merge_items(collected)
    if len(items) < 3:
        for seed in FALLBACK:
            seed = {**seed, "id": item_id(seed["title"], seed["url"])}
            if seed["id"] not in {x["id"] for x in items}:
                items.append(seed)
        items.sort(key=lambda x: x.get("publishedAt") or "", reverse=True)
    payload = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "items": items[:24],
    }
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print(f"wrote {len(payload['items'])} items -> {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
