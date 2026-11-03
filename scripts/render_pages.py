"""Render halaman tertentu dari satu PDF materi ke PNG untuk inspeksi visual.

Usage: python -I scripts/render_pages.py <A|B|C> <page1,page2,...> [--dpi 150]
Output: extract/{code}/png/p{NNN}.png
"""
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


def main():
    code = sys.argv[1]
    pages = [int(p) for p in sys.argv[2].split(",")]
    dpi = 150
    for arg in sys.argv[3:]:
        if arg.startswith("--dpi"):
            dpi = int(arg.split("=")[1]) if "=" in arg else int(sys.argv[sys.argv.index(arg) + 1])

    pdf_path = MATERI / FILES[code]
    out_dir = EXTRACT / code / "png"
    out_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    zoom = dpi / 72
    mat = fitz.Matrix(zoom, zoom)
    for p in pages:
        page = doc[p - 1]
        pix = page.get_pixmap(matrix=mat)
        out_file = out_dir / f"p{p:03d}.png"
        pix.save(out_file)
        print(f"saved {out_file}")
    doc.close()


if __name__ == "__main__":
    main()
