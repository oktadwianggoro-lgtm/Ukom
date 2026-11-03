"""Kelompokkan subtopik di data/topics.json menjadi batch ~45-60 est_questions
per kompetensi (boleh memotong di tengah topik besar), untuk dasar prompt agent
generasi soal Fase 4.

Output: data/batch_plan.json
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

TARGET_PER_BATCH = 50
MAX_PER_BATCH = 65
PREFIX = {
    "Advokasi Kebijakan Perpajakan": "ADV",
    "Analisis Kepatuhan Wajib Pajak": "KEP",
    "Analisis Potensi Pajak": "POT",
    "Ekstensifikasi Perpajakan": "EKS",
    "Pemeriksaan Pajak": "PMR",
    "Profiling Wajib Pajak": "PRF",
}


def flatten_subtopik(komp_entry):
    """Yield (topik_nama, subtopik_dict) menjaga urutan."""
    for topik in komp_entry["topik"]:
        for sub in topik["subtopik"]:
            yield topik["nama"], sub


def main():
    topics = json.loads((DATA / "topics.json").read_text(encoding="utf-8"))
    plan = []

    for komp_entry in topics:
        komp = komp_entry["kompetensi"]
        prefix = PREFIX[komp]
        batch_no = 0

        current: dict = {"kompetensi": komp, "prefix": prefix, "items": [], "est_total": 0}

        def flush():
            nonlocal current, batch_no
            if not current["items"]:
                return
            batch_no += 1
            current["batch_no"] = batch_no
            plan.append(current)
            current = {"kompetensi": komp, "prefix": prefix, "items": [], "est_total": 0}

        for topik_nama, sub in flatten_subtopik(komp_entry):
            est = sub.get("est_questions", 0)
            if current["est_total"] + est > MAX_PER_BATCH and current["items"]:
                flush()
            current["items"].append({"topik": topik_nama, "subtopik": sub})
            current["est_total"] += est
            if current["est_total"] >= TARGET_PER_BATCH:
                flush()
        flush()

    (DATA / "batch_plan.json").write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Total batch: {len(plan)}  (target {TARGET_PER_BATCH}/batch, max {MAX_PER_BATCH})")
    grand_total = 0
    for b in plan:
        topik_set = []
        for it in b["items"]:
            if it["topik"] not in topik_set:
                topik_set.append(it["topik"])
        grand_total += b["est_total"]
        print(f"  {b['prefix']}-batch{b['batch_no']}: est={b['est_total']:3d} | {', '.join(t[:28] for t in topik_set)}")
    print(f"Grand total est_questions: {grand_total}")


if __name__ == "__main__":
    main()
