"""Susun 10 paket tryout dari data/questions/*.json -> data/tryouts.json.

Jalankan: python -I scripts/build_tryouts.py
Reproducible (seed tetap per paket).
"""
import json
import random
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
QUESTIONS_DIR = DATA / "questions"

KOMPOSISI = {
    "Advokasi Kebijakan Perpajakan": 22,
    "Analisis Kepatuhan Wajib Pajak": 20,
    "Analisis Potensi Pajak": 15,
    "Ekstensifikasi Perpajakan": 15,
    "Pemeriksaan Pajak": 20,
    "Profiling Wajib Pajak": 8,
}
DURASI_MENIT = 60
MIN_PRIORITAS_MERAH_PER_PAKET = 45  # target >=45 soal prioritas>=2 per paket 100 soal


def load_questions():
    questions = []
    for f in sorted(QUESTIONS_DIR.glob("*.json")):
        data = json.loads(f.read_text(encoding="utf-8"))
        questions.extend(data)
    return questions


def pick_for_kompetensi(pool, komp, n, rng, prefer_merah_first=False, prefer_sulit=False):
    cand = [q for q in pool if q["kompetensi"] == komp]
    if prefer_merah_first:
        cand.sort(key=lambda q: (-q["prioritas"], rng.random()))
    elif prefer_sulit:
        order = {"sulit": 0, "sedang": 1, "mudah": 2}
        cand.sort(key=lambda q: (order.get(q["kesulitan"], 1), rng.random()))
    else:
        rng.shuffle(cand)
    chosen = cand[:n]
    for q in chosen:
        pool.remove(q)
    return chosen


def build_paket(paket_id, nama, questions_pool, seed, deskripsi="", prioritas_merah_mode=False, sulit_mode=False):
    rng = random.Random(seed)
    pool = list(questions_pool)
    selected = []
    for komp, n in KOMPOSISI.items():
        selected.extend(pick_for_kompetensi(pool, komp, n, rng, prefer_merah_first=prioritas_merah_mode, prefer_sulit=sulit_mode))

    # Isi kekurangan (jika suatu kompetensi belum cukup soal) dari sisa pool kompetensi lain
    target_total = sum(KOMPOSISI.values())
    if len(selected) < target_total:
        rng.shuffle(pool)
        need = target_total - len(selected)
        selected.extend(pool[:need])

    rng.shuffle(selected)
    soal_ids = [q["id"] for q in selected]
    return {
        "id": paket_id,
        "nama": nama,
        "deskripsi": deskripsi,
        "durasi_menit": DURASI_MENIT,
        "soal_ids": soal_ids,
        "seed": seed,
    }, selected


def main():
    all_questions = load_questions()
    if not all_questions:
        print("Belum ada soal di data/questions/. Jalankan setelah bank soal tersedia.")
        (DATA / "tryouts.json").write_text("[]", encoding="utf-8")
        return

    by_komp = defaultdict(list)
    for q in all_questions:
        by_komp[q["kompetensi"]].append(q)
    print("Ketersediaan soal per kompetensi:")
    for komp, target in KOMPOSISI.items():
        avail = len(by_komp.get(komp, []))
        needed_for_8 = target * 8
        print(f"  {komp}: {avail} tersedia (butuh {needed_for_8} utk TO1-8 unik)")

    remaining_pool = list(all_questions)
    tryouts = []
    used_in_1_8 = set()

    for i in range(1, 9):
        paket, selected = build_paket(f"TO{i}", f"Tryout {i}", remaining_pool, seed=1000 + i)
        tryouts.append(paket)
        used_in_1_8.update(q["id"] for q in selected)

    # TO9: Prediksi Lingkaran Merah - 80% prioritas 3, boleh reuse dari TO1-8 (bank soal terbatas)
    pool_for_9 = list(all_questions)
    paket9, _ = build_paket(
        "TO9",
        "Tryout 9 — Prediksi Lingkaran Merah",
        pool_for_9,
        seed=1009,
        deskripsi="Dominan soal dari materi bertanda merah (prioritas tinggi).",
        prioritas_merah_mode=True,
    )
    tryouts.append(paket9)

    # TO10: Simulasi Final - soal yang belum dipakai di TO1-8 jika cukup, campuran terberat
    unused = [q for q in all_questions if q["id"] not in used_in_1_8]
    pool_for_10 = unused if len(unused) >= sum(KOMPOSISI.values()) else list(all_questions)
    paket10, _ = build_paket(
        "TO10",
        "Tryout 10 — Simulasi Final",
        pool_for_10,
        seed=1010,
        deskripsi="Simulasi final, campuran soal terberat (prioritas soal sulit).",
        sulit_mode=True,
    )
    tryouts.append(paket10)

    (DATA / "tryouts.json").write_text(json.dumps(tryouts, indent=2, ensure_ascii=False), encoding="utf-8")

    print("\nRingkasan paket:")
    by_id = {q["id"]: q for q in all_questions}
    for t in tryouts:
        qs = [by_id[i] for i in t["soal_ids"] if i in by_id]
        merah = sum(1 for q in qs if q["prioritas"] >= 2)
        sulit = sum(1 for q in qs if q["kesulitan"] == "sulit")
        print(f"  {t['id']}: {len(qs)} soal, prioritas-merah={merah}, sulit={sulit}")


if __name__ == "__main__":
    main()
