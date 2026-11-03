# UKOM/UKT JF PKN 2026 — Aplikasi Latihan & Tryout

Aplikasi latihan soal offline (PWA, tanpa backend/login) untuk persiapan UKOM/UKT pengisian
Jabatan Fungsional Pemeriksa Pajak/PKN DJP 2026. Seluruh soal diturunkan dari 3 PDF materi
internal di folder `../materi/` — lihat `../PROGRESS.md` dan `../data/report.md` untuk status
pembuatan bank soal.

> ⚠️ Materi bersumber dari dokumen internal DJP. Jangan commit folder `materi/`, `extract/`,
> `data/` ke repo publik, dan jangan deploy aplikasi ini ke hosting publik. Lihat `.gitignore`
> di root proyek.

## Menjalankan aplikasi

```bash
cd app
npm install        # sekali saja
npm run dev         # mode pengembangan, http://localhost:5173
```

> **Jika di laptop kantor (proxy/TLS inspection Zscaler):** `npm install`/`npm create` bisa
> gagal dengan error `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`. Root cause: certificate authority
> perusahaan belum dipercaya Node. Root CA sudah diekspor ke `../zscaler-root.pem` saat setup
> awal — jalankan dengan env var ini jika perlu install ulang/update dependency:
> ```bash
> # PowerShell
> $env:NODE_EXTRA_CA_CERTS = "D:\Latihan Soal UKOM\zscaler-root.pem"
> npm install
> # Git Bash
> export NODE_EXTRA_CA_CERTS="D:/Latihan Soal UKOM/zscaler-root.pem"
> npm install
> ```
> `npm run dev`/`npm run build` yang hanya memakai dependency yang sudah ter-install tidak
> butuh ini (tidak ada akses network baru).

Build produksi (untuk dipakai offline / di-install sebagai PWA):

```bash
npm run build
npm run preview     # cek hasil build di http://localhost:4173
```

Membuka dari HP lewat Wi-Fi yang sama dengan laptop:

```bash
npm run serve:lan   # lalu buka http://<IP-laptop>:5173 dari HP
```

Setelah `npm run build`, buka aplikasi sekali di browser lalu gunakan menu
"Install app" / "Add to Home Screen" supaya bisa dipakai sepenuhnya offline.

## Struktur data

Sumber data asli ada di `../data/` (root proyek), **bukan** di `app/`. Setiap kali
`npm run dev` atau `npm run build` dijalankan, `scripts/sync-data.mjs` otomatis menyalin
`../data/` → `app/public/data/` dan membuat `manifest.json`. Jangan edit file di
`app/public/data/` langsung — editan akan tertimpa; edit sumbernya di `../data/`.

```
data/
├─ questions/*.json     # bank soal, dipecah per batch (lihat skema di bawah)
├─ topics.json          # hirarki Kompetensi -> Topik -> Subtopik (hasil merge_topics.py)
├─ topics_adv.json      # fragmen topik kompetensi Advokasi (sumber utama)
├─ topics_rest.json     # fragmen topik 5 kompetensi lain
├─ tryouts.json          # 10 paket tryout (hasil build_tryouts.py)
├─ facts_*.json          # bank fakta atomik per kompetensi (rujukan saat menulis soal)
├─ summaries/*.md        # "Materi Kilat" per topik, prefix: adv_/kep_/pot_/eks_/pmr_/prf_
└─ report.md              # hasil scripts/validate.py
```

Jika ingin memuat ulang data tanpa restart dev server: jalankan
`npm run sync-data` di folder `app/` lalu refresh browser.

## Menambah / mengubah soal

1. Tambahkan soal baru ke file JSON array di `../data/questions/` (boleh file baru,
   boleh menambah ke yang sudah ada), ikuti skema persis berikut:

```json
{
  "id": "PMR-0412",
  "kompetensi": "Pemeriksaan Pajak",
  "topik": "Jangka Waktu Pemeriksaan",
  "subtopik": "Pemeriksaan untuk menguji kepatuhan",
  "tipe": "angka",
  "kesulitan": "sedang",
  "prioritas": 3,
  "pertanyaan": "...",
  "opsi": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "kunci": "C",
  "pembahasan": "...",
  "sumber": [{ "pdf": "C", "halaman": 12, "kutipan": "potongan teks ≤200 karakter dari halaman tsb" }],
  "tags": ["PMK-15/2025"]
}
```

   Prefix id per kompetensi: `ADV` Advokasi, `KEP` Kepatuhan, `POT` Potensi, `EKS`
   Ekstensifikasi, `PMR` Pemeriksaan, `PRF` Profiling.

2. Dari root proyek (bukan `app/`), jalankan validator:

   ```bash
   python scripts/validate.py
   ```

   Ini mengecek field wajib, id unik, kunci valid, 4 opsi tidak duplikat, dan — paling
   penting — `sumber.kutipan` benar-benar ditemukan (fuzzy match) di teks halaman PDF
   (`extract/{A|B|C}/p{NNN}.txt`, hasil `scripts/extract.py`). Hasil lengkap ada di
   `data/report.md`.

3. Untuk menyusun ulang 10 paket tryout setelah menambah soal:

   ```bash
   python scripts/build_tryouts.py
   ```

4. Jalankan `npm run sync-data` (atau cukup `npm run dev` ulang) di `app/` supaya
   aplikasi memuat data terbaru.

## Tipe data (TypeScript)

Didefinisikan di `src/types/index.ts` — `Question`, `Tryout`, `Attempt`, dll. Progres
belajar (jawaban, tryout, bookmark, flashcard) disimpan di IndexedDB lewat Dexie
(`src/db.ts`), bukan di server — bisa diekspor/diimpor sebagai JSON dari halaman
Pengaturan untuk pindah perangkat.

## Komponen utama

- `QuestionCard` / `OptionButton` — tampilan soal & pilihan jawaban
- `QuestionGrid` — navigator nomor soal saat tryout
- `Timer` — countdown berbasis timestamp (akurat walau tab di-refresh)
- `ResultChart` — radar/bar/line chart (Recharts) untuk Dashboard & Hasil
- `CommandPalette` — Ctrl/Cmd+K untuk lompat ke halaman/tryout/cari soal
