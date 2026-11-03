"""Gabungkan data/topics_adv.json + data/topics_rest.json -> data/topics.json (format final dipakai app).

App mengharapkan array KompetensiTopik: [{ kompetensi, topik: [{ nama, subtopik: [...] }] }, ...]
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"


def main():
    merged = []

    adv_path = DATA / "topics_adv.json"
    if adv_path.exists():
        adv = json.loads(adv_path.read_text(encoding="utf-8"))
        merged.append({"kompetensi": adv["kompetensi"], "topik": adv["topik"]})

    rest_path = DATA / "topics_rest.json"
    if rest_path.exists():
        rest = json.loads(rest_path.read_text(encoding="utf-8"))
        for entry in rest["kompetensi_list"]:
            merged.append({"kompetensi": entry["kompetensi"], "topik": entry["topik"]})

    (DATA / "topics.json").write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")

    total_topik = sum(len(k["topik"]) for k in merged)
    total_subtopik = sum(len(t["subtopik"]) for k in merged for t in k["topik"])
    total_est = sum(s.get("est_questions", 0) for k in merged for t in k["topik"] for s in t["subtopik"])
    print(f"data/topics.json ditulis: {len(merged)} kompetensi, {total_topik} topik, {total_subtopik} subtopik, est_questions total={total_est}")
    for k in merged:
        print(f"  - {k['kompetensi']}: {len(k['topik'])} topik")


if __name__ == "__main__":
    main()
