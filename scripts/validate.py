"""Validasi bank soal data/questions/*.json sesuai aturan kualitas di PROMPT_UKOM_JFPKN_2026.md.

Jalankan: python -I scripts/validate.py
Output: data/report.md + ringkasan ke stdout. Exit code 1 jika ada error (bukan warning).
"""
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
EXTRACT = ROOT / "extract"
QUESTIONS_DIR = DATA / "questions"

REQUIRED_FIELDS = [
    "id", "kompetensi", "topik", "subtopik", "tipe", "kesulitan", "prioritas",
    "pertanyaan", "opsi", "kunci", "pembahasan", "sumber",
]
VALID_TIPE = {"fakta", "angka", "dasar_hukum", "proses", "kasus", "negasi"}
VALID_KESULITAN = {"mudah", "sedang", "sulit"}
VALID_PRIORITAS = {0, 1, 2, 3}
VALID_OPSI_KEYS = {"A", "B", "C", "D"}
VALID_PDF = {"A", "B", "C"}
ID_PREFIX = {
    "Advokasi Kebijakan Perpajakan": "ADV",
    "Analisis Kepatuhan Wajib Pajak": "KEP",
    "Analisis Potensi Pajak": "POT",
    "Ekstensifikasi Perpajakan": "EKS",
    "Pemeriksaan Pajak": "PMR",
    "Profiling Wajib Pajak": "PRF",
}

_page_text_cache: dict[tuple[str, int], str] = {}


def normalize(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def load_page_text(pdf: str, page: int) -> str | None:
    key = (pdf, page)
    if key in _page_text_cache:
        return _page_text_cache[key]
    f = EXTRACT / pdf / f"p{page:03d}.txt"
    if not f.exists():
        _page_text_cache[key] = None
        return None
    text = f.read_text(encoding="utf-8")
    _page_text_cache[key] = text
    return text


def kutipan_fuzzy_match(kutipan: str, page_text: str) -> float:
    """Token-overlap ratio: proporsi kata signifikan (>=3 huruf) di kutipan yang muncul di page_text."""
    kutipan_norm = normalize(kutipan)
    page_norm = normalize(page_text)
    tokens = [t for t in kutipan_norm.split() if len(t) >= 3]
    if not tokens:
        return 1.0
    page_tokens = set(page_norm.split())
    found = sum(1 for t in tokens if t in page_tokens)
    return found / len(tokens)


def load_all_questions():
    questions = []
    errors_by_file = {}
    if not QUESTIONS_DIR.exists():
        return questions, errors_by_file
    for f in sorted(QUESTIONS_DIR.glob("*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            errors_by_file[f.name] = [f"JSON tidak valid: {e}"]
            continue
        if not isinstance(data, list):
            errors_by_file[f.name] = ["Root harus berupa array"]
            continue
        for i, q in enumerate(data):
            q["_file"] = f.name
            q["_index"] = i
            questions.append(q)
    return questions, errors_by_file


def main():
    questions, file_errors = load_all_questions()
    errors: list[str] = []
    warnings: list[str] = []

    for fname, errs in file_errors.items():
        for e in errs:
            errors.append(f"[{fname}] {e}")

    seen_ids: dict[str, str] = {}
    per_kompetensi = Counter()
    per_tipe = Counter()
    per_kesulitan = Counter()
    per_prioritas = Counter()
    per_kunci_global = Counter()
    per_kunci_by_file = defaultdict(Counter)
    pertanyaan_norms: list[tuple[str, str]] = []  # (id, normalized text) for similarity check

    for q in questions:
        loc = f"{q.get('_file')}#{q.get('_index')}"
        qid = q.get("id", f"<no-id:{loc}>")

        missing = [f for f in REQUIRED_FIELDS if f not in q]
        if missing:
            errors.append(f"{qid} ({loc}): field wajib hilang: {missing}")
            continue

        if qid in seen_ids:
            errors.append(f"{qid}: id duplikat (muncul di {seen_ids[qid]} dan {loc})")
        else:
            seen_ids[qid] = loc

        komp = q["kompetensi"]
        expected_prefix = ID_PREFIX.get(komp)
        if expected_prefix and not qid.startswith(expected_prefix):
            warnings.append(f"{qid}: prefix id tidak sesuai kompetensi '{komp}' (harap awalan {expected_prefix})")

        if q["tipe"] not in VALID_TIPE:
            errors.append(f"{qid}: tipe tidak valid: {q['tipe']}")
        if q["kesulitan"] not in VALID_KESULITAN:
            errors.append(f"{qid}: kesulitan tidak valid: {q['kesulitan']}")
        if q["prioritas"] not in VALID_PRIORITAS:
            errors.append(f"{qid}: prioritas tidak valid: {q['prioritas']}")

        opsi = q.get("opsi", {})
        if set(opsi.keys()) != VALID_OPSI_KEYS:
            errors.append(f"{qid}: opsi harus persis {{A,B,C,D}}, dapat: {list(opsi.keys())}")
        else:
            texts = [normalize(v) for v in opsi.values()]
            if len(set(texts)) < 4:
                errors.append(f"{qid}: ada opsi dengan teks duplikat")

        kunci = q.get("kunci")
        if kunci not in VALID_OPSI_KEYS:
            errors.append(f"{qid}: kunci tidak valid: {kunci}")
        elif kunci not in opsi:
            errors.append(f"{qid}: kunci '{kunci}' tidak ada di opsi")
        else:
            per_kunci_global[kunci] += 1
            per_kunci_by_file[q["_file"]][kunci] += 1

        sumber = q.get("sumber", [])
        if not sumber:
            errors.append(f"{qid}: sumber kosong")
        for s in sumber:
            pdf = s.get("pdf")
            halaman = s.get("halaman")
            kutipan = s.get("kutipan", "")
            if pdf not in VALID_PDF:
                errors.append(f"{qid}: kode pdf tidak valid: {pdf}")
                continue
            page_text = load_page_text(pdf, halaman) if isinstance(halaman, int) else None
            if page_text is None:
                errors.append(f"{qid}: halaman {pdf} hlm {halaman} tidak ditemukan di extract/")
                continue
            if not kutipan:
                warnings.append(f"{qid}: kutipan kosong untuk sumber {pdf} hlm {halaman}")
                continue
            page_char_count = len(page_text.strip())
            if page_char_count < 500:
                # Halaman diagram/infografis/SmartArt sering kehilangan sebagian besar teksnya saat
                # ekstraksi pymupdf (grouped shapes / text-in-picture tidak selalu tertangkap get_text),
                # walau isi aslinya (dicek via render PNG) jauh lebih kaya (dikonfirmasi manual utk
                # beberapa kasus: halaman dgn <500 char ekstraksi ternyata benar2 berisi kutipan yg
                # tepat saat dicek visual). kutipan di bawah ambang ini tidak bisa diverifikasi andal
                # lewat pencocokan teks otomatis -> turunkan jadi warning (perlu cek manual QA).
                warnings.append(
                    f"{qid}: halaman {pdf} hlm {halaman} teks ekstraksi tipis ({page_char_count} char) — "
                    f"kutipan tidak bisa diverifikasi otomatis, perlu cek manual thd PNG: \"{kutipan[:80]}\""
                )
                continue
            ratio = kutipan_fuzzy_match(kutipan, page_text)
            if ratio < 0.8:
                errors.append(
                    f"{qid}: kutipan tidak cocok dgn teks {pdf} hlm {halaman} (overlap {ratio:.2f} < 0.8): \"{kutipan[:80]}...\""
                )

        per_kompetensi[komp] += 1
        per_tipe[q["tipe"]] += 1
        per_kesulitan[q["kesulitan"]] += 1
        per_prioritas[q["prioritas"]] += 1
        pertanyaan_norms.append((qid, normalize(q.get("pertanyaan", ""))))

    # Similarity check antar soal (deteksi hampir sama) - token-set jaccard, cepat utk dataset besar
    warnings_sim = []
    token_sets = {qid: set(t.split()) for qid, t in pertanyaan_norms}
    by_length_bucket: dict[int, list[str]] = defaultdict(list)
    for qid, toks in token_sets.items():
        by_length_bucket[len(toks) // 5].append(qid)
    checked_pairs = 0
    MAX_PAIRS = 400000
    for bucket in by_length_bucket.values():
        for i in range(len(bucket)):
            for j in range(i + 1, len(bucket)):
                checked_pairs += 1
                if checked_pairs > MAX_PAIRS:
                    break
                a, b = token_sets[bucket[i]], token_sets[bucket[j]]
                if not a or not b:
                    continue
                inter = len(a & b)
                union = len(a | b)
                sim = inter / union if union else 0
                if sim >= 0.85:
                    warnings_sim.append(f"{bucket[i]} mirip {bucket[j]} (jaccard {sim:.2f})")

    # Distribusi kunci global
    total_keyed = sum(per_kunci_global.values())
    if total_keyed > 0:
        for k in VALID_OPSI_KEYS:
            pct = per_kunci_global.get(k, 0) / total_keyed * 100
            if pct < 20 or pct > 30:
                warnings.append(f"Distribusi kunci global '{k}' = {pct:.1f}% (target 23-27%)")

    # Tulis report
    lines = ["# Laporan Validasi Bank Soal\n"]
    lines.append(f"Total soal: {len(questions)}\n")
    lines.append(f"Error: {len(errors)} | Warning: {len(warnings) + len(warnings_sim)}\n")

    lines.append("\n## Rekap per Kompetensi\n")
    for k, v in per_kompetensi.most_common():
        lines.append(f"- {k}: {v}\n")
    lines.append("\n## Rekap per Tipe\n")
    for k, v in per_tipe.most_common():
        lines.append(f"- {k}: {v}\n")
    lines.append("\n## Rekap per Kesulitan\n")
    for k, v in per_kesulitan.most_common():
        lines.append(f"- {k}: {v}\n")
    lines.append("\n## Rekap per Prioritas\n")
    for k in sorted(per_prioritas):
        lines.append(f"- prioritas {k}: {per_prioritas[k]}\n")
    lines.append("\n## Distribusi Kunci Global\n")
    for k in sorted(per_kunci_global):
        pct = per_kunci_global[k] / total_keyed * 100 if total_keyed else 0
        lines.append(f"- {k}: {per_kunci_global[k]} ({pct:.1f}%)\n")

    if errors:
        lines.append(f"\n## Error ({len(errors)})\n")
        for e in errors[:500]:
            lines.append(f"- {e}\n")
    if warnings:
        lines.append(f"\n## Warning ({len(warnings)})\n")
        for w in warnings[:300]:
            lines.append(f"- {w}\n")
    if warnings_sim:
        lines.append(f"\n## Kemiripan Antar Soal ({len(warnings_sim)})\n")
        for w in warnings_sim[:300]:
            lines.append(f"- {w}\n")

    DATA.mkdir(exist_ok=True)
    (DATA / "report.md").write_text("".join(lines), encoding="utf-8")

    print(f"Total soal: {len(questions)}")
    print(f"Error: {len(errors)}  Warning: {len(warnings) + len(warnings_sim)}")
    print("Detail lengkap -> data/report.md")

    if errors:
        print("\n--- 20 error pertama ---")
        for e in errors[:20]:
            print(" -", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
