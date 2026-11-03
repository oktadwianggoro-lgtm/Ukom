# PROGRESS — UKOM/UKT JF PKN 2026

Target ujian: 4-5 Nov 2026. Mulai: 2 Nov 2026.

## Fase 0 — Setup
- [x] Struktur folder (materi/extract/scripts/data/app)
- [x] 3 PDF + priority_pages.json di materi/ (nama file dikanonikkan ke underscore)
- [x] Tooling: Python 3.14 + pymupdf + pdfplumber (poppler pdftoppm tidak ada, pakai pymupdf untuk render PNG juga)
- [x] .gitignore (materi/, extract/, data/, node_modules, dist)

## Fase 1 — Ekstraksi
- [x] `scripts/extract.py` jalan: teks per halaman A(159) B(861) C(120) -> extract/{A,B,C}/p{NNN}.txt, watermark dibersihkan
  - Thin pages (<80 char, kandidat diagram): A=42, B=80, C=100 -> extract/{A,B,C}/meta.json
- [x] Render & verifikasi visual halaman merah (priority_pages.json) -> extract/priority_verified.json (141 entri gabungan: red_level3=85, level2=19, level1=24, level0=13)
  - B hlm 846-861 (belum terpindai) sudah dicek manual: tidak ada merah signifikan baru
- [x] extract/duplicates.json (A vs B): B hlm ~644-860 = duplikat A hlm 4-158 (offset tidak konstan tapi confirmed similarity>=0.8 utk 131 pasang halaman)

## Fase 2 — Peta Materi — SELESAI
- [x] data/topics_adv.json (Advokasi: 19 topik, 124 subtopik, est ~461 soal) + data/facts_adv.json (206 fakta) + data/summaries/adv_*.md (19 file)
- [x] data/topics_rest.json (5 kompetensi lain: 36 topik, 141 subtopik) + data/facts_rest.json (414 fakta) + summaries kep_/pot_/eks_/pmr_/prf_ (36 file)
- [x] data/topics.json (final, scripts/merge_topics.py): 6 kompetensi, 55 topik, 265 subtopik, est_questions total 2011

## Fase 3 — MVP + ~300 soal prioritas merah — SELESAI
- [x] Scaffold app (Vite + React 19 + TS + Tailwind v4 + Zustand + Dexie + PWA + react-router + recharts + fuse.js + react-markdown) — build & typecheck sukses
- [x] Halaman inti dibangun: Dashboard, Materi Kilat, Latihan (+ sesi), Fokus Merah, Tryout (list/detail/runner), Hasil&Review, Flashcard (SM-2), Bank Soal, Statistik, Pengaturan, Command Palette
- [x] app/scripts/sync-data.mjs: copy data/ -> app/public/data/ + generate manifest.json (jalan otomatis sebelum dev/build)
- [x] 2 bug ditemukan & diperbaiki saat review: (1) slug topik di MateriKilat tidak match nama file summary -> diganti fuzzy match via Fuse.js terhadap manifest; (2) label sesi latihan salah krn precedence `||`/`?:`
- [x] 270 soal prioritas merah dihasilkan (4 batch: adv_prioritas_merah_01=69, pmr_prioritas_merah_01=78, pmr_prioritas_merah_02=78, kep_pot_eks_prioritas_merah_01=45)
- [x] scripts/validate.py dijalankan — 0 error (setelah threshold fuzzy-match teks tipis dinaikkan ke <500 char jadi warning bukan error, krn banyak halaman diagram/SmartArt file C kehilangan text layer saat ekstraksi meski kutipan terverifikasi akurat via PNG manual)
- [x] scripts/build_tryouts.py dijalankan (10 TO x 100 soal, masih numpang isi dari pool terbatas krn Fase 4 belum penuh — PRF masih 0 soal native, fallback isi dari kompetensi lain)
- [x] npm run build sukses dgn data asli; preview server smoke-test OK (manifest, tryouts.json, index semua 200)
- [ ] CATATAN JUJUR: belum ada verifikasi interaktif via browser sungguhan (tool browser tidak tersedia di sesi ini) — hanya tsc/build/curl/review kode manual. Disarankan user coba manual sebentar saat app jalan.

## Fase 4 — Bank Soal — SELESAI (40/40 batch, 2272 soal bersih, jauh melebihi target ±2000)
- [x] data/batch_plan.json dari topics.json (scripts/plan_batches.py), 40 batch ~50 soal tiap batch
- [x] 4 wave generasi paralel (total ~40+ agent dispatch), semua 40 batch rencana selesai:
  - ADV 1-9 (9 batch), KEP 1-8 (8 batch), POT 1-6 (6 batch), EKS 1-6 (6 batch), PMR 1-8 (8 batch, termasuk pmr_batch03b lanjutan), PRF 1-3 (3 batch)
  - Plus 4 batch "prioritas merah" dari Fase 3 (270 soal)
- [x] Insiden & recovery selama proses (semua ditangani, tidak ada soal cacat tersisa):
  - Rate limit sesi (~14:50 WIB): beberapa agent gagal di tengah, file yg sudah tertulis tetap valid; yg benar2 kosong/parsial (ADV-04, PMR-03) diulang/dilanjutkan
  - 1 agent (ADV-04) gagal krn exceeds 64K output token/respons — diperbaiki dgn instruksi "tulis via script, jangan cetak JSON besar di chat"
  - 1 fabrikasi nyata ditemukan & dihapus: ADV-04-018 mengutip "PMK-61/PMK.03/2022" yg TIDAK ada di hlm B/122 (ditemukan via validate.py overlap=0.00, dikonfirmasi manual via PNG) — wave berikutnya ditambah peringatan eksplisit "jangan mengarang nomor PMK", 0 kasus serupa sesudahnya
  - 1 soal ambigu dihapus: PMR-05-010 (2 opsi ternormalisasi identik krn format "-" vs istilah majemuk)
  - 9 duplikat persis (jaccard 1.00) antar batch berbeda (kompetensi overlap pakai halaman sama) ditemukan & dihapus salah satu dari tiap pasang
  - Beberapa agent menemukan & memperbaiki sendiri kesalahan nomor halaman di batch_plan.json (offset 1 halaman) sebelum submit — dicatat di laporan masing2 agent
- [x] validate.py final: 2272 soal, 16 warning/error residual — SEMUA 16 sudah di-spot-check manual via render PNG & dikonfirmasi AKURAT (bukan soal cacat, hanya keterbatasan pencocokan teks otomatis pada halaman SmartArt/screenshot/logo yg teksnya tak sepenuhnya ter-ekstrak pymupdf)
- [x] Distribusi akhir: Pemeriksaan 552, Advokasi 544, Kepatuhan 398, Ekstensifikasi 320, Potensi 309, Profiling 149 | Kesulitan mudah/sedang/sulit = 30/51/18% (target 30/50/20) | Kunci A/B/C/D = 25.4/25.6/25.0/24.1% (target 23-27%, SEIMBANG)

## Fase 5 — 10 Tryout — SELESAI
- [x] scripts/build_tryouts.py dijalankan ulang dgn pool penuh 2272 soal -> data/tryouts.json (10 paket x 100 soal, prioritas-merah 88-100/paket, TO10 all-sulit utk simulasi final)

## Fase 6 — QA — SELESAI
- [x] validate.py: 2273 soal, 0 error nyata (16 residual = false-positive tervalidasi manual via render PNG, lihat catatan Fase 4)
- [x] npm run build sukses dgn 2273 soal final + 10 tryout final
- [x] Sampling 40 soal acak (seed=42) oleh agent QA khusus: render PNG tiap halaman sumber + bandingkan kunci/opsi — HASIL: 40/40 PASS, 0 perlu diperbaiki/dihapus. Detail di data/report.md bagian "QA Sampling 40 Soal (Fase 6)"
- [ ] CATATAN JUJUR: tidak ada verifikasi interaktif via browser sungguhan di sesi ini (tool browser tidak tersedia) — hanya tsc/build/curl/review kode manual + ratusan screenshot PNG materi utk verifikasi konten. Sarankan user coba app manual sebentar sebelum H-1 ujian.

## RINGKASAN AKHIR
- Total soal final: 2273 (target ±2000, TERLAMPAUI)
- Per kompetensi: Pemeriksaan 552-553, Advokasi 544, Kepatuhan 398-399, Ekstensifikasi 320, Potensi 309-310, Profiling 149
- 10 Tryout x 100 soal x 60 menit siap (TO1-8 mayoritas unik, TO9 dominan prioritas merah, TO10 dominan sulit)
- 5 topik paling sering muncul di halaman merah (berdasar jumlah soal prioritas>=2 per topik):
  1. Penyesuaian Ketentuan PMK-81/2024 atas Berbagai PMK Lama (Advokasi) — 123 soal
  2. Tata Cara Penilaian untuk Tujuan Perpajakan PMK-79/2023 (Potensi) — 104 soal
  3. Penggalian Potensi WP Orang Pribadi/Galpot OP (Potensi) — 90 soal
  4. Permintaan Penjelasan SP2DK - WP Terdaftar (Kepatuhan) — 88 soal
  5. Pemanfaatan Data & Analisis Mandiri SE-05/PJ/2022 (Potensi) — 80 soal
  (disusul: Kriteria & Jangka Waktu Pemeriksaan, Penetapan & Ketetapan Pajak, Tata Cara Pemeriksaan & Alur Proses — masing2 68-75 soal)
- Cara menjalankan: lihat app/README.md (ringkas: `cd app && npm install && npm run dev`)

## Catatan konflik A vs B
B hlm ~644-860 adalah duplikat hampir sempurna dari A hlm 4-158 (confirmed via extract/duplicates.json, 131 pasang similarity>=0.8). Soal generasi diarahkan memakai A sbg sumber utama utk topik yg overlap ini; B dipakai utk materi yg TIDAK ada di A (KUP/PPN/PBB dasar, penyesuaian PMK-81/2024).
