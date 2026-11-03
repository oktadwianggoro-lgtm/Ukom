"""Deteksi halaman duplikat antara file A (1-159) dan bagian akhir file B (~640-861).

Output: extract/duplicates.json -> list of {a_page, b_page, similarity}
"""
import json
import difflib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXTRACT = ROOT / "extract"

A_DIR = EXTRACT / "A"
B_DIR = EXTRACT / "B"

A_RANGE = range(1, 160)
B_RANGE = range(600, 862)  # search window wide enough to be safe


def load(dir_, page):
    f = dir_ / f"p{page:03d}.txt"
    if not f.exists():
        return ""
    return f.read_text(encoding="utf-8")


def main():
    a_texts = {p: load(A_DIR, p) for p in A_RANGE}
    b_texts = {p: load(B_DIR, p) for p in B_RANGE}

    # Skip near-empty pages (diagrams) - handled separately via visual agents
    results = []
    for a_page, a_text in a_texts.items():
        if len(a_text) < 40:
            continue
        best_b = None
        best_ratio = 0.0
        for b_page, b_text in b_texts.items():
            if len(b_text) < 40:
                continue
            # Quick length-based filter before expensive ratio calc
            if abs(len(a_text) - len(b_text)) > max(len(a_text), len(b_text)) * 0.6:
                continue
            ratio = difflib.SequenceMatcher(None, a_text, b_text).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_b = b_page
        if best_b is not None and best_ratio > 0.5:
            results.append({"a_page": a_page, "b_page": best_b, "similarity": round(best_ratio, 3)})

    results.sort(key=lambda r: r["a_page"])
    (EXTRACT / "duplicates.json").write_text(
        json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    high = [r for r in results if r["similarity"] >= 0.8]
    print(f"Total pairs found: {len(results)} (similarity>=0.8: {len(high)})")
    for r in high:
        print(r)


if __name__ == "__main__":
    main()
