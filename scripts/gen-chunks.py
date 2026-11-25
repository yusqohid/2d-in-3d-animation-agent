#!/usr/bin/env python3
"""Split a word-timing JSON into 1-2 word caption chunks for the kinetic caption overlay.

Usage:
    python scripts/gen-chunks.py                          # voice/Saham & crypto.json -> src/videos/demo/caption_chunks.json
    python scripts/gen-chunks.py --src <words.json> --out <caption_chunks.json>

Input format: a list whose first element has a "words" list of
{"type": "word", "text": str, "start": float, "end": float} (word-level STT output).
Output format: [{"text": str, "start": float, "end": float}, ...] consumed by
`src/videos/<project>/<X>CaptionOverlay.tsx`.
"""
import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SRC = os.path.join(ROOT, "voice", "Saham & crypto.json")
DEFAULT_OUT = os.path.join(ROOT, "src", "videos", "demo", "caption_chunks.json")

TERMINAL = (".", "?", "!", ":", ";", ",")


def chunk_words(clean_words):
    chunks = []
    i = 0
    while i < len(clean_words):
        w1 = clean_words[i]
        if i + 1 < len(clean_words):
            w2 = clean_words[i + 1]
            gap = w2["start"] - w1["end"]
            combined_len = len(w1["text"]) + len(w2["text"])
            has_terminal_punct = any(w1["text"].endswith(p) for p in TERMINAL)
            if not has_terminal_punct and gap < 0.35 and combined_len <= 16:
                chunks.append(
                    {
                        "text": f"{w1['text']} {w2['text']}",
                        "start": w1["start"],
                        "end": w2["end"],
                    }
                )
                i += 2
                continue
        chunks.append({"text": w1["text"], "start": w1["start"], "end": w1["end"]})
        i += 1
    return chunks


def main(argv):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--src", default=DEFAULT_SRC, help="word-timing JSON (default: %(default)s)")
    ap.add_argument("--out", default=DEFAULT_OUT, help="caption chunk JSON (default: %(default)s)")
    ap.add_argument("--print-words", action="store_true", help="print every word with its frame range")
    args = ap.parse_args(argv)

    if not os.path.exists(args.src):
        sys.exit(f"word JSON not found: {args.src}\nPass --src to point at the right file.")

    with open(args.src, "r", encoding="utf-8") as f:
        data = json.load(f)

    raw_words = data[0]["words"] if isinstance(data, list) else data["words"]
    clean_words = [
        {"text": w["text"].strip(), "start": round(w["start"], 2), "end": round(w["end"], 2)}
        for w in raw_words
        if w.get("type") == "word" and w.get("text", "").strip()
    ]
    print(f"Total clean words: {len(clean_words)}")

    chunks = chunk_words(clean_words)

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(chunks)} chunks to {os.path.relpath(args.out, ROOT)}")

    if args.print_words:
        for w in clean_words:
            f0 = int(round(w["start"] * 30))
            f1 = int(round(w["end"] * 30))
            print(f"{w['start']:6.2f}s (f={f0:4d}..{f1:4d}): {w['text']}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
