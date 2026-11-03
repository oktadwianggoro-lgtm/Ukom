"""Ekstraksi teks per halaman dari 3 PDF materi UKOM/UKT JF PKN 2026.

Output: extract/{A,B,C}/p{NNN}.txt  (teks bersih per halaman)
        extract/{A,B,C}/meta.json  (jumlah halaman, daftar halaman "tipis" yang perlu dirender PNG)
"""
import json
import re
import sys
from pathlib import Path

import fitz  # pymupdf

ROOT = Path(__file__).resolve().parent.parent
MATERI = ROOT / "materi"
EXTRACT = ROOT / "extract"

FILES = {
    "A": "Bahan_Tampil_Pengawasan_UKT_Pengisian_Jabatan_Fungsional_2026.pdf",
    "B": "Bahan_Paparan_Pengawasan_Full_UKT_Pengisian_Jabatan_Fungsional_2026_Update.pdf",
    "C": "Bahan_Tampil_Pemeriksaan_UKT_JFPKN_2026__1_.pdf",
}

WATERMARK_PATTERNS = [
    r"UNTUK\s+INTERNAL\s+DJP",
    r"JANGAN\s+DISEBARLUASKAN",
    r"www\.pajak\.go\.id",
    r"DIREKTORAT\s+JENDERAL\s+PAJAK\s*$",
]

THIN_PAGE_CHARS = 80


def clean_text(raw: str) -> str:
    text = raw
    for pat in WATERMARK_PATTERNS:
        text = re.sub(pat, "", text, flags=re.IGNORECASE)

    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        # Stray single-letter vertical watermark remnants (J, P, D, N, A, ...)
        if len(stripped) == 1 and stripped.isalpha():
            continue
        # Pure slide-number lines
        if re.fullmatch(r"\d{1,4}", stripped):
            continue
        cleaned_lines.append(line)

    text = "\n".join(cleaned_lines)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def main():
    EXTRACT.mkdir(exist_ok=True)
    summary = {}

    for code, fname in FILES.items():
        pdf_path = MATERI / fname
        if not pdf_path.exists():
            print(f"[WARN] Missing file for {code}: {pdf_path}", file=sys.stderr)
            continue

        out_dir = EXTRACT / code
        out_dir.mkdir(exist_ok=True)

        doc = fitz.open(pdf_path)
        thin_pages = []
        page_lengths = {}

        for i, page in enumerate(doc):
            page_num = i + 1
            raw = page.get_text("text")
            cleaned = clean_text(raw)
            out_file = out_dir / f"p{page_num:03d}.txt"
            out_file.write_text(cleaned, encoding="utf-8")
            page_lengths[page_num] = len(cleaned)
            if len(cleaned) < THIN_PAGE_CHARS:
                thin_pages.append(page_num)

        meta = {
            "file": fname,
            "code": code,
            "total_pages": doc.page_count,
            "thin_pages": thin_pages,
            "thin_page_count": len(thin_pages),
        }
        (out_dir / "meta.json").write_text(
            json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        summary[code] = meta
        print(f"[{code}] {fname}: {doc.page_count} halaman, {len(thin_pages)} halaman tipis (<{THIN_PAGE_CHARS} char)")
        doc.close()

    (EXTRACT / "summary.json").write_text(
        json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
