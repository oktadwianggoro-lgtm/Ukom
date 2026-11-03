# -*- coding: utf-8 -*-
"""Generate data/questions/kep_batch01.json (KEP batch 1).
Run from 'D:\\Latihan Soal UKOM' with: python -I scripts/build_kep_batch01.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "questions" / "kep_batch01.json"

KOMP = "Analisis Kepatuhan Wajib Pajak"
TOPIK_PMK = "Dasar Hukum Pengawasan: Kewenangan, Ruang Lingkup, Bentuk Kegiatan (PMK-111/2025)"
TOPIK_PROBIS = "Probis Pengawasan WP Terdaftar"

SUB1 = "Ruang Lingkup Kegiatan Intensifikasi (SE-05/PJ/2022) - PPM vs PKM, PnKF vs PnKM"
SUB2 = "Kewenangan dan Tujuan Pengawasan Pasal 2 PMK-111/2025"
SUB3 = "Ruang Lingkup Pengawasan Pasal 3 PMK-111/2025"
SUB4 = "Bentuk Kegiatan Pengawasan Pasal 4 PMK-111/2025 (a-j) & Kegiatan Pendukung"
SUB5 = "Probis Pengawasan WP Terdaftar: Permintaan Penjelasan, Teguran, Imbauan (ruang lingkup materi)"

questions = []


def add(topik, subtopik, tipe, kesulitan, prioritas, pertanyaan, opsi, kunci,
        pembahasan, sumber, tags):
    n = len(questions) + 1
    questions.append({
        "id": f"KEP-01-{n:03d}",
        "kompetensi": KOMP,
        "topik": topik,
        "subtopik": subtopik,
        "tipe": tipe,
        "kesulitan": kesulitan,
        "prioritas": prioritas,
        "pertanyaan": pertanyaan,
        "opsi": opsi,
        "kunci": kunci,
        "pembahasan": pembahasan,
        "sumber": sumber,
        "tags": tags,
    })


# ======================================================================
# SUBTOPIK 1 — Ruang Lingkup Kegiatan Intensifikasi SE-05/PJ/2022 (p.5)
# ======================================================================
TAGS1 = ["SE-05/PJ/2022"]
P5 = lambda kutipan: [{"pdf": "A", "halaman": 5, "kutipan": kutipan}]

add(TOPIK_PMK, SUB1, "fakta", "mudah", 3,
    "Apa kepanjangan dari PPM dalam ruang lingkup kegiatan intensifikasi sesuai SE-05/PJ/2022?",
    {"A": "Pengawasan Pembayaran Masa", "B": "Penelitian Pembayaran Material",
     "C": "Pengawasan Potensi Masa", "D": "Pemeriksaan Pembayaran Masa"},
    "A",
    "Diagram ruang lingkup kegiatan intensifikasi membagi Pengawasan WP yang Telah Memiliki NPWP menjadi Pengawasan Pembayaran Masa (PPM) dan Pengawasan Kepatuhan Material (PKM).",
    P5("Pengawasan Pembayaran Masa (PPM)"), TAGS1)

add(TOPIK_PMK, SUB1, "dasar_hukum", "mudah", 3,
    "Ruang lingkup kegiatan intensifikasi yang membagi pengawasan menjadi PPM dan PKM sebagaimana digunakan dalam materi pengawasan diatur dalam...",
    {"A": "PMK-111/2025", "B": "SE-05/PJ/2022", "C": "UU KUP Pasal 29",
     "D": "PMK-17/PMK.03/2013"},
    "B",
    "Judul diagram menyebutkan secara eksplisit 'Ruang Lingkup Kegiatan Intensifikasi dalam SE-05/PJ/2022' sebagai dasar pembagian PPM/PKM dan PnKF/PnKM.",
    P5("Ruang Lingkup Kegiatan Intensifikasi dalam SE-05/PJ/2022"), TAGS1)

add(TOPIK_PMK, SUB1, "kasus", "sedang", 3,
    "Suatu kewajiban perpajakan Wajib Pajak memiliki jatuh tempo di Tahun Pajak berjalan. Kewajiban tersebut termasuk ruang lingkup pengawasan jenis...",
    {"A": "Pengawasan Kepatuhan Material (PKM)", "B": "Pengawasan Pembayaran Masa (PPM)",
     "C": "Penelitian Kepatuhan Formal (PnKF)", "D": "Penelitian Kepatuhan Material (PnKM)"},
    "B",
    "PPM mencakup kewajiban dengan jatuh tempo di Tahun Pajak berjalan, sedangkan PKM mencakup kewajiban dengan jatuh tempo sebelum Tahun Pajak berjalan.",
    P5("Jatuh tempo di Tahun Pajak berjalan"), TAGS1)

add(TOPIK_PMK, SUB1, "kasus", "sedang", 3,
    "Suatu kewajiban perpajakan Wajib Pajak memiliki jatuh tempo sebelum Tahun Pajak berjalan. Kewajiban tersebut termasuk ruang lingkup pengawasan jenis...",
    {"A": "Pengawasan Kepatuhan Material (PKM)", "B": "Pengawasan Pembayaran Masa (PPM)",
     "C": "Kunjungan", "D": "Daftar Nominatif"},
    "A",
    "Pengawasan Kepatuhan Material (PKM) adalah pengawasan atas kewajiban dengan jatuh tempo sebelum Tahun Pajak berjalan, berbeda dengan PPM yang jatuh tempo di Tahun Pajak berjalan.",
    P5("Jatuh tempo sebelum Tahun Pajak berjalan"), TAGS1)

add(TOPIK_PMK, SUB1, "angka", "sedang", 3,
    "Berapa jumlah kriteria yang diteliti dalam Penelitian Kepatuhan Formal (PnKF) sesuai ruang lingkup kegiatan intensifikasi SE-05/PJ/2022?",
    {"A": "3 kriteria", "B": "4 kriteria", "C": "5 kriteria", "D": "6 kriteria"},
    "C",
    "PnKF meneliti 5 kriteria: ketepatan waktu dikukuhkan sebagai PKP, ketepatan waktu pembayaran/penyetoran pajak, ketepatan waktu dan/atau kelengkapan Laporan Pajak, angsuran pajak, serta layanan dan/atau fasilitas.",
    P5("1. Ketepatan waktu dikukuhkan sebagai PKP 2. Ketepatan waktu pembayaran/ penyetoran pajak 3. Ketepatan waktu dan/atau kelengkapan Laporan Pajak 4. Angsuran pajak 5. Layanan dan/ atau fasilitas"),
    TAGS1)

add(TOPIK_PMK, SUB1, "negasi", "sedang", 3,
    "Berikut termasuk kriteria yang diteliti dalam Penelitian Kepatuhan Formal (PnKF), KECUALI...",
    {"A": "Ketepatan waktu dikukuhkan sebagai PKP", "B": "Ketepatan waktu dan/atau kelengkapan Laporan Pajak",
     "C": "Estimasi potensi pajak yang belum dipenuhi", "D": "Angsuran pajak"},
    "C",
    "Estimasi potensi pajak yang belum dipenuhi merupakan bagian dari hasil KKPt/LHPt pada proses PnKM, bukan kriteria yang diteliti dalam PnKF.",
    P5("Ditemukan indikasi ketidakpatuhan dan estimasi potensi yang belum dipenuhi"), TAGS1)

add(TOPIK_PMK, SUB1, "proses", "sedang", 3,
    "Dalam alur Penelitian Kepatuhan Material (PnKM), simpul yang menghubungkan PnKM dengan proses Validasi dan/atau Analisis atas data dan/atau Keterangan disebut...",
    {"A": "KKPt/LHPt", "B": "DPP", "C": "Daftar Nominatif", "D": "Berita Acara"},
    "B",
    "Diagram menunjukkan PnKM terhubung ke simpul DPP sebelum masuk ke proses Validasi dan/atau Analisis atas data dan/atau Keterangan yang menghasilkan KKPt/LHPt.",
    P5("DPP"), TAGS1)

add(TOPIK_PMK, SUB1, "proses", "sulit", 3,
    "Apabila hasil KKPt/LHPt menunjukkan ditemukan indikasi ketidakpatuhan dan estimasi potensi yang belum dipenuhi, tindak lanjut yang dihasilkan berupa...",
    {"A": "Tidak di TL", "B": "Daftar Nominatif", "C": "Penerusan Data dan/atau Keterangan",
     "D": "P2DK, Usul Rik, Buper"},
    "D",
    "Hasil KKPt/LHPt berupa ditemukannya indikasi ketidakpatuhan dan estimasi potensi yang belum dipenuhi ditindaklanjuti dengan P2DK, Usul Rik, atau Buper.",
    P5("Ditemukan indikasi ketidakpatuhan dan estimasi potensi yang belum dipenuhi"), TAGS1)

add(TOPIK_PMK, SUB1, "proses", "sedang", 3,
    "Apabila hasil KKPt/LHPt menunjukkan tidak ditemukan indikasi ketidakpatuhan, maka status tindak lanjutnya adalah...",
    {"A": "P2DK, Usul Rik, Buper", "B": "Penerusan Data dan/atau Keterangan",
     "C": "Tidak di TL", "D": "Daftar Nominatif"},
    "C",
    "Jika tidak ditemukan indikasi ketidakpatuhan pada KKPt/LHPt, kasus tersebut berstatus Tidak di TL (tidak ditindaklanjuti).",
    P5("Tidak ditemukan indikasi ketidakpatuhan"), TAGS1)

add(TOPIK_PMK, SUB1, "proses", "sulit", 3,
    "Apabila dari hasil validasi dan/atau analisis diketahui WP sedang dilakukan pemeriksaan, telah dilakukan pemeriksaan, sedang dilakukan pemeriksaan Bukper, atau sedang dilakukan penyidikan, maka tindak lanjut KKPt/LHPt adalah...",
    {"A": "Tidak di TL", "B": "P2DK, Usul Rik, Buper", "C": "Daftar Nominatif",
     "D": "Penerusan Data dan/atau Keterangan"},
    "D",
    "Untuk WP yang sedang/telah diperiksa atau sedang dilakukan Bukper/penyidikan, tindak lanjutnya berupa Penerusan Data dan/atau Keterangan.",
    P5("WP sedang dilakukan pemeriksaan, telah dilakukan pemeriksaan, sedang dilakukan pemeriksaan Bukper / sedang dilakukan penyidikan"),
    TAGS1)

# ======================================================================
# SUBTOPIK 2 — Kewenangan dan Tujuan Pengawasan Pasal 2 PMK-111/2025 (p.6)
# ======================================================================
TAGS2 = ["PMK-111/2025", "Pasal 2 PMK-111/2025"]
P6 = lambda kutipan: [{"pdf": "A", "halaman": 6, "kutipan": kutipan}]

add(TOPIK_PMK, SUB2, "dasar_hukum", "mudah", 2,
    "Ketentuan mengenai kewenangan dan tujuan Pengawasan dalam PMK 111/2025 diatur dalam...",
    {"A": "Pasal 4", "B": "Pasal 3", "C": "Pasal 2", "D": "Pasal 5"},
    "C",
    "Materi menyebutkan secara eksplisit judul 'Kewenangan dan Tujuan Pengawasan' disertai keterangan Pasal 2.",
    P6("Kewenangan dan Tujuan Pengawasan Pasal 2"), TAGS2)

add(TOPIK_PMK, SUB2, "fakta", "mudah", 2,
    "Berdasarkan Pasal 2 PMK 111/2025, pihak yang berwenang melakukan Pengawasan adalah...",
    {"A": "Kepala Kantor Wilayah DJP", "B": "Direktur Jenderal Pajak", "C": "Account Representative",
     "D": "Kepala Kantor Pelayanan Pajak"},
    "B",
    "Pasal 2 PMK 111/2025 menyatakan Direktur Jenderal Pajak berwenang melakukan Pengawasan.",
    P6("Direktur Jenderal Pajak Berwenang melakukan Pengawasan"), TAGS2)

add(TOPIK_PMK, SUB2, "fakta", "mudah", 2,
    "Tujuan Pengawasan sebagaimana diatur dalam Pasal 2 PMK 111/2025 adalah...",
    {"A": "Menyusun profil risiko kepatuhan Wajib Pajak", "B": "Melakukan pemeriksaan bukti permulaan",
     "C": "Mewujudkan kepatuhan Wajib Pajak", "D": "Meningkatkan penerimaan negara"},
    "C",
    "Pasal 2 PMK 111/2025 menegaskan bahwa Pengawasan oleh Direktur Jenderal Pajak bertujuan mewujudkan kepatuhan Wajib Pajak.",
    P6("Berwenang melakukan Pengawasan yang bertujuan mewujudkan kepatuhan Wajib Pajak"), TAGS2)

add(TOPIK_PMK, SUB2, "proses", "sedang", 2,
    "Kewenangan Pengawasan yang dimiliki Direktur Jenderal Pajak berdasarkan Pasal 2 PMK 111/2025 didelegasikan kepada...",
    {"A": "Direktur Pemeriksaan dan Penagihan", "B": "Kepala Kantor Wilayah DJP",
     "C": "Account Representative", "D": "Kepala Kantor Pelayanan Pajak"},
    "D",
    "Diagram menunjukkan adanya delegasi kewenangan dari Direktur Jenderal Pajak kepada Kepala KPP untuk melaksanakan Pengawasan.",
    P6("Delegasi Kewenangan"), TAGS2)

add(TOPIK_PMK, SUB2, "kasus", "sedang", 2,
    "Seorang Kepala KPP melaksanakan kegiatan Pengawasan terhadap Wajib Pajak di wilayah kerjanya. Pelaksanaan kegiatan tersebut didasarkan pada...",
    {"A": "Permohonan resmi yang diajukan oleh Wajib Pajak bersangkutan", "B": "Putusan yang dijatuhkan oleh pengadilan pajak",
     "C": "Kewenangan yang didelegasikan oleh Direktur Jenderal Pajak", "D": "Instruksi lisan yang disampaikan langsung oleh Wajib Pajak"},
    "C",
    "Kepala KPP melaksanakan Pengawasan atas dasar delegasi kewenangan dari Direktur Jenderal Pajak sebagaimana digambarkan dalam Pasal 2 PMK 111/2025.",
    P6("Delegasi Kewenangan"), TAGS2)

add(TOPIK_PMK, SUB2, "negasi", "sedang", 2,
    "Berikut adalah pihak yang digambarkan dalam alur kewenangan dan tujuan Pengawasan Pasal 2 PMK 111/2025, KECUALI...",
    {"A": "Direktur Jenderal Pajak", "B": "Kepala KPP", "C": "Wajib Pajak", "D": "Pengadilan Pajak"},
    "D",
    "Alur Pasal 2 PMK 111/2025 hanya menggambarkan Direktur Jenderal Pajak, Kepala KPP, dan Wajib Pajak; Pengadilan Pajak tidak digambarkan dalam alur tersebut.",
    P6("Direktur Jenderal Pajak ... Kepala KPP ... Wajib Pajak"), TAGS2)

add(TOPIK_PMK, SUB2, "kasus", "sedang", 2,
    "Setelah menerima delegasi kewenangan dari Direktur Jenderal Pajak, Kepala KPP melaksanakan Pengawasan. Pihak yang menjadi sasaran pelaksanaan Pengawasan tersebut adalah...",
    {"A": "Kantor Wilayah DJP", "B": "Direktur Jenderal Pajak", "C": "Komite Kepatuhan", "D": "Wajib Pajak"},
    "D",
    "Alur Pasal 2 PMK 111/2025 menunjukkan Kepala KPP melaksanakan Pengawasan yang sasarannya adalah Wajib Pajak.",
    P6("Pengawasan ... Wajib Pajak"), TAGS2)

# ======================================================================
# SUBTOPIK 3 — Ruang Lingkup Pengawasan Pasal 3 PMK-111/2025 (p.7)
# ======================================================================
TAGS3 = ["PMK-111/2025", "Pasal 3 PMK-111/2025"]
P7 = lambda kutipan: [{"pdf": "A", "halaman": 7, "kutipan": kutipan}]

add(TOPIK_PMK, SUB3, "dasar_hukum", "mudah", 2,
    "Ruang lingkup Pengawasan yang membedakan WP Terdaftar, WP Belum Terdaftar, dan Pengawasan Wilayah diatur dalam PMK 111/2025 pada...",
    {"A": "Pasal 2", "B": "Pasal 4", "C": "Pasal 3", "D": "Pasal 5"},
    "C",
    "Judul materi menyebutkan 'Ruang Lingkup Pengawasan dalam PMK 111/2025' dengan keterangan Pasal 3.",
    P7("Ruang Lingkup Pengawasan dalam PMK 111/2025 Pasal 3"), TAGS3)

add(TOPIK_PMK, SUB3, "angka", "sedang", 2,
    "Ruang lingkup Pengawasan sebagaimana diatur dalam Pasal 3 PMK 111/2025 dikelompokkan menjadi berapa kategori?",
    {"A": "2 kategori", "B": "4 kategori", "C": "5 kategori", "D": "3 kategori"},
    "D",
    "Pasal 3 PMK 111/2025 mengelompokkan ruang lingkup Pengawasan menjadi 3 kategori: WP Terdaftar, WP Belum Terdaftar, dan Pengawasan Wilayah.",
    P7("WP Terdaftar | WP Belum Terdaftar | Pengawasan Wilayah"), TAGS3)

add(TOPIK_PMK, SUB3, "negasi", "sedang", 2,
    "Berikut termasuk ruang lingkup Pengawasan bagi WP Terdaftar sesuai Pasal 3 PMK 111/2025, KECUALI...",
    {"A": "Pembukuan atau pencatatan", "B": "Pelaporan SPOP PBB",
     "C": "Pendaftaran untuk memperoleh NPWP/aktivasi NIK sebagai NPWP", "D": "Pelaporan tempat kegiatan usaha untuk memperoleh NITKU"},
    "C",
    "Pendaftaran untuk memperoleh NPWP/aktivasi NIK sebagai NPWP merupakan ruang lingkup Pengawasan bagi WP Belum Terdaftar, bukan WP Terdaftar yang sudah memiliki NPWP.",
    P7("Pendaftaran untuk memperoleh NPWP / melakukan aktivasi NIK sebagai NPWP"), TAGS3)

add(TOPIK_PMK, SUB3, "fakta", "mudah", 2,
    "Ruang lingkup Pengawasan yang secara khusus berlaku bagi WP Belum Terdaftar dan tidak termasuk ruang lingkup bagi WP Terdaftar adalah...",
    {"A": "Pendaftaran objek pajak PBB atas perkebunan, perhutanan, pertambangan, minyak dan gas bumi, dan sektor lainnya",
     "B": "Pemotongan dan/atau pemungutan pajak",
     "C": "Pembayaran dan/atau penyetoran pajak", "D": "Pendaftaran untuk memperoleh NPWP/aktivasi NIK sebagai NPWP"},
    "D",
    "Ruang lingkup WP Belum Terdaftar mencakup pendaftaran untuk memperoleh NPWP/aktivasi NIK sebagai NPWP, yang secara logis tidak berlaku bagi WP Terdaftar yang sudah memiliki NPWP.",
    P7("Pendaftaran untuk memperoleh NPWP / melakukan aktivasi NIK sebagai NPWP"), TAGS3)

add(TOPIK_PMK, SUB3, "fakta", "mudah", 2,
    "Cakupan Pengawasan Wilayah berdasarkan Pasal 3 PMK 111/2025 meliputi pengawasan atas kegiatan ekonomi Wajib Pajak serta...",
    {"A": "Penilaian aset Wajib Pajak", "B": "Identifikasi Wajib Pajak di setiap wilayah kerja",
     "C": "Penyusunan profil risiko kepatuhan", "D": "Pemeriksaan bukti permulaan"},
    "B",
    "Pengawasan Wilayah mencakup pengawasan atas kegiatan ekonomi yang dilakukan oleh Wajib Pajak serta identifikasi Wajib Pajak di setiap wilayah kerja.",
    P7("Pengawasan atas kegiatan ekonomi yang dilakukan oleh Wajib Pajak serta identifikasi Wajib Pajak di setiap wilayah kerja"),
    TAGS3)

add(TOPIK_PMK, SUB3, "kasus", "sulit", 2,
    "Direktorat Jenderal Pajak melakukan pengawasan atas kewajiban Pajak Minimum Global suatu grup usaha multinasional. Berdasarkan pengecualian dalam Pasal 3 PMK 111/2025, pelaksanaan pengawasan tersebut mengacu pada...",
    {"A": "SE-05/PJ/2022", "B": "PMK mengenai sistem inti administrasi perpajakan",
     "C": "PMK Pajak Minimum Global berdasarkan Kesepakatan", "D": "PMK 111/2025 secara umum"},
    "C",
    "Pengecualian pada Pasal 3 PMK 111/2025 menyatakan Pengawasan terkait Pajak Minimum Global dilaksanakan sesuai PMK Pajak Minimum Global berdasarkan Kesepakatan.",
    P7("Pengawasan terkait Pajak Minimum Global dilaksanakan sesuai PMK Pajak Minimum Global berdasarkan Kesepakatan."),
    TAGS3)

add(TOPIK_PMK, SUB3, "dasar_hukum", "sulit", 2,
    "Pengawasan WP terkait kewajiban pelaporan surat pemberitahuan objek pajak Pajak Bumi dan Bangunan, berdasarkan pengecualian dalam Pasal 3 PMK 111/2025, dilaksanakan sesuai dengan...",
    {"A": "Undang-Undang KUP", "B": "SE-05/PJ/2022",
     "C": "PMK Pajak Minimum Global berdasarkan Kesepakatan", "D": "PMK mengenai sistem inti administrasi perpajakan"},
    "D",
    "Pengecualian pada Pasal 3 PMK 111/2025 menyatakan Pengawasan WP terkait kewajiban pelaporan SPOP PBB dilaksanakan sesuai PMK mengenai ketentuan perpajakan dalam rangka pelaksanaan sistem inti administrasi perpajakan.",
    P7("Pengawasan WP terkait kewajiban pelaporan surat pemberitahuan objek pajak PBB dilaksanakan sesuai PMK mengenai ketentuan perpajakan dalam rangka pelaksanaan sistem inti administrasi perpajakan."),
    TAGS3)

# ======================================================================
# SUBTOPIK 4 — Bentuk Kegiatan Pengawasan Pasal 4 PMK-111/2025 (p.8)
# ======================================================================
TAGS4 = ["PMK-111/2025", "Pasal 4 PMK-111/2025"]
P8 = lambda kutipan: [{"pdf": "A", "halaman": 8, "kutipan": kutipan}]

add(TOPIK_PMK, SUB4, "dasar_hukum", "mudah", 3,
    "Bentuk kegiatan Pengawasan yang terdiri atas huruf a sampai dengan huruf j diatur dalam PMK 111/2025 pada...",
    {"A": "Pasal 2", "B": "Pasal 3", "C": "Pasal 5", "D": "Pasal 4"},
    "D",
    "Materi berjudul 'Bentuk Kegiatan Pengawasan dalam PMK 111/2025' dengan keterangan Pasal 4, memuat huruf a sampai dengan j.",
    P8("Pasal 4 Bentuk Kegiatan Pengawasan dalam PMK 111/2025"), TAGS4)

add(TOPIK_PMK, SUB4, "dasar_hukum", "mudah", 3,
    "Bentuk kegiatan Pengawasan huruf a Pasal 4 PMK 111/2025 adalah...",
    {"A": "Mengundang Wajib Pajak untuk hadir ke kantor Direktorat Jenderal Pajak secara luring atau melalui media daring",
     "B": "Meminta penjelasan atas data dan/atau keterangan dari Wajib Pajak",
     "C": "Melaksanakan kegiatan pendukung Pengawasan sesuai ketentuan peraturan perundang-undangan di bidang perpajakan",
     "D": "Melakukan pembahasan dengan Wajib Pajak"},
    "B",
    "Pasal 4 huruf a PMK 111/2025 menyatakan Direktur Jenderal Pajak meminta penjelasan atas data dan/atau keterangan dari Wajib Pajak.",
    P8("meminta penjelasan atas data dan/atau keterangan dari Wajib Pajak"), TAGS4)

add(TOPIK_PMK, SUB4, "fakta", "mudah", 3,
    "Bentuk kegiatan Pengawasan huruf d Pasal 4 PMK 111/2025 adalah...",
    {"A": "Memberikan teguran", "B": "Mengundang Wajib Pajak untuk hadir ke kantor Direktorat Jenderal Pajak",
     "C": "Melakukan Kunjungan", "D": "Meminta dokumen penentuan harga transfer"},
    "C",
    "Pasal 4 huruf d PMK 111/2025 menyebutkan bentuk kegiatan Pengawasan berupa melakukan Kunjungan.",
    P8("melakukan Kunjungan"), TAGS4)

add(TOPIK_PMK, SUB4, "proses", "sedang", 3,
    "Bentuk kegiatan Pengawasan berupa mengundang Wajib Pajak untuk hadir ke kantor Direktorat Jenderal Pajak sebagaimana Pasal 4 huruf c PMK 111/2025 dapat dilakukan melalui...",
    {"A": "Hanya secara luring", "B": "Hanya melalui Account Representative",
     "C": "Secara luring atau melalui media daring", "D": "Hanya melalui media daring"},
    "C",
    "Pasal 4 huruf c menyatakan Wajib Pajak diundang untuk hadir ke kantor Direktorat Jenderal Pajak secara luring atau melalui media daring.",
    P8("mengundang Wajib Pajak untuk hadir ke kantor Direktorat Jenderal Pajak secara luring atau melalui media daring"),
    TAGS4)

add(TOPIK_PMK, SUB4, "negasi", "sulit", 3,
    "Berikut termasuk bentuk kegiatan Pengawasan sebagaimana Pasal 4 PMK 111/2025, KECUALI...",
    {"A": "Mengumpulkan data ekonomi di wilayah kerja", "B": "Melakukan penyidikan tindak pidana perpajakan",
     "C": "Meminta dokumen penentuan harga transfer", "D": "Memberikan teguran"},
    "B",
    "Penyidikan tindak pidana perpajakan bukan merupakan bentuk kegiatan Pengawasan pada Pasal 4 huruf a-j PMK 111/2025, melainkan proses hukum tersendiri di luar ruang lingkup pasal ini.",
    P8("a. meminta penjelasan ... j. melaksanakan kegiatan pendukung Pengawasan"), TAGS4)

add(TOPIK_PMK, SUB4, "proses", "sulit", 3,
    "Permintaan dokumen penentuan harga transfer sebagai salah satu bentuk kegiatan Pengawasan dilaksanakan sesuai dengan Peraturan Menteri Keuangan yang mengatur mengenai...",
    {"A": "Tata cara pemeriksaan pajak sesuai ketentuan peraturan perundang-undangan di bidang perpajakan",
     "B": "Pajak Minimum Global berdasarkan Kesepakatan",
     "C": "Penerapan prinsip kewajaran dan kelaziman usaha dalam transaksi yang dipengaruhi hubungan istimewa",
     "D": "Sistem inti administrasi perpajakan sesuai ketentuan peraturan perundang-undangan di bidang perpajakan"},
    "C",
    "Catatan pada Pasal 4 menegaskan bahwa permintaan dokumen penentuan harga transfer dilaksanakan sesuai PMK yang mengatur penerapan prinsip kewajaran dan kelaziman usaha dalam transaksi yang dipengaruhi hubungan istimewa.",
    P8("dilaksanakan sesuai dengan Peraturan Menteri Keuangan yang mengatur mengenai penerapan prinsip kewajaran dan kelaziman usaha dalam transaksi yang dipengaruhi hubungan istimewa."),
    TAGS4)

add(TOPIK_PMK, SUB4, "fakta", "mudah", 3,
    "Kegiatan pendukung Pengawasan sebagaimana dimaksud Pasal 4 huruf j PMK 111/2025 di antaranya berupa pengusulan penilaian untuk tujuan...",
    {"A": "Pemeriksaan", "B": "Penagihan", "C": "Perpajakan", "D": "Keberatan"},
    "C",
    "Salah satu kegiatan pendukung Pengawasan huruf j adalah pengusulan penilaian untuk tujuan perpajakan.",
    P8("pengusulan penilaian untuk tujuan perpajakan"), TAGS4)

add(TOPIK_PMK, SUB4, "negasi", "sulit", 3,
    "Berikut termasuk kegiatan pendukung Pengawasan sebagaimana dimaksud huruf j Pasal 4 PMK 111/2025, KECUALI...",
    {"A": "Permintaan data dan/atau keterangan kepada pihak ketiga", "B": "Penerbitan Surat Perintah Pemeriksaan Pajak",
     "C": "Pengusulan penilaian untuk tujuan perpajakan", "D": "Pembahasan dengan pihak internal Direktorat Jenderal Pajak bersama Wajib Pajak"},
    "B",
    "Kegiatan pendukung Pengawasan huruf j hanya mencakup empat hal: pengusulan penilaian, pembahasan internal DJP bersama WP, permintaan data/keterangan ke pihak ketiga, dan kegiatan lain sesuai penugasan; penerbitan Surat Perintah Pemeriksaan Pajak bukan bagian dari kegiatan pendukung Pengawasan.",
    P8("a. pengusulan penilaian untuk tujuan perpajakan; b. pembahasan dengan pihak internal DJP; c. permintaan data dan/atau keterangan kepada pihak ketiga; d. melakukan kegiatan lainnya"),
    TAGS4)

add(TOPIK_PMK, SUB4, "fakta", "mudah", 3,
    "Bentuk kegiatan Pengawasan huruf f Pasal 4 PMK 111/2025 adalah...",
    {"A": "Menyampaikan imbauan", "B": "Melakukan pembahasan dengan Wajib Pajak",
     "C": "Melakukan Kunjungan", "D": "Memberikan teguran"},
    "D",
    "Pasal 4 huruf f PMK 111/2025 menyatakan bentuk kegiatan Pengawasan berupa memberikan teguran.",
    P8("memberikan teguran"), TAGS4)

add(TOPIK_PMK, SUB4, "dasar_hukum", "mudah", 3,
    "Bentuk kegiatan Pengawasan huruf i Pasal 4 PMK 111/2025 menyatakan bahwa Direktur Jenderal Pajak...",
    {"A": "Mengumpulkan data ekonomi di wilayah kerja", "B": "Menerbitkan surat dalam rangka Pengawasan",
     "C": "Meminta dokumen penentuan harga transfer", "D": "Melaksanakan kegiatan pendukung Pengawasan"},
    "B",
    "Pasal 4 huruf i PMK 111/2025 menyatakan bentuk kegiatan Pengawasan berupa menerbitkan surat dalam rangka Pengawasan.",
    P8("menerbitkan surat dalam rangka Pengawasan"), TAGS4)

add(TOPIK_PMK, SUB4, "proses", "sedang", 3,
    "Kegiatan mengumpulkan data ekonomi di wilayah kerja sebagai salah satu bentuk kegiatan Pengawasan diatur dalam Pasal 4 huruf...",
    {"A": "g", "B": "i", "C": "j", "D": "h"},
    "D",
    "Pasal 4 huruf h PMK 111/2025 mengatur bentuk kegiatan Pengawasan berupa mengumpulkan data ekonomi di wilayah kerja.",
    P8("mengumpulkan data ekonomi di wilayah kerja"), TAGS4)

add(TOPIK_PMK, SUB4, "angka", "sedang", 3,
    "Pasal 4 PMK 111/2025 mengatur bentuk kegiatan Pengawasan yang terdiri dari...",
    {"A": "8 huruf (a-h)", "B": "9 huruf (a-i)", "C": "12 huruf (a-l)", "D": "10 huruf (a-j)"},
    "D",
    "Pasal 4 PMK 111/2025 memuat bentuk kegiatan Pengawasan dari huruf a sampai dengan huruf j, yaitu 10 bentuk kegiatan.",
    P8("a. ... j. melaksanakan kegiatan pendukung Pengawasan sesuai ketentuan peraturan perundang-undangan di bidang perpajakan."),
    TAGS4)

add(TOPIK_PMK, SUB4, "angka", "sedang", 3,
    "Kegiatan pendukung Pengawasan sebagaimana dimaksud huruf j Pasal 4 PMK 111/2025 terdiri dari...",
    {"A": "2 huruf (a-b)", "B": "5 huruf (a-e)", "C": "4 huruf (a-d)", "D": "3 huruf (a-c)"},
    "C",
    "Kegiatan pendukung Pengawasan huruf j dirinci menjadi 4 huruf (a-d): pengusulan penilaian, pembahasan internal DJP bersama WP, permintaan data/keterangan pihak ketiga, dan kegiatan lain sesuai penugasan.",
    P8("a. pengusulan penilaian ...; b. pembahasan dengan pihak internal ...; c. permintaan data dan/atau keterangan kepada pihak ketiga; dan d. melakukan kegiatan lainnya"),
    TAGS4)

add(TOPIK_PMK, SUB4, "kasus", "sedang", 3,
    "Account Representative hendak memperoleh data dan/atau keterangan dari rekan bisnis Wajib Pajak yang sedang diawasi, dalam rangka kegiatan pendukung Pengawasan. Kegiatan tersebut termasuk...",
    {"A": "Pengusulan penilaian untuk tujuan perpajakan", "B": "Pembahasan dengan pihak internal Direktorat Jenderal Pajak",
     "C": "Melakukan kegiatan lainnya sesuai penugasan", "D": "Permintaan data dan/atau keterangan kepada pihak ketiga"},
    "D",
    "Permintaan data dan/atau keterangan kepada pihak ketiga (seperti rekan bisnis WP) merupakan kegiatan pendukung Pengawasan huruf c pada Pasal 4 huruf j PMK 111/2025.",
    P8("permintaan data dan/atau keterangan kepada pihak ketiga"), TAGS4)

add(TOPIK_PMK, SUB4, "fakta", "sedang", 3,
    "Bentuk kegiatan Pengawasan huruf c Pasal 4 PMK 111/2025 adalah...",
    {"A": "Melaksanakan kegiatan pendukung Pengawasan sesuai ketentuan peraturan perundang-undangan di bidang perpajakan",
     "B": "Menerbitkan surat dalam rangka Pengawasan",
     "C": "Mengundang Wajib Pajak untuk hadir ke kantor Direktorat Jenderal Pajak secara luring atau melalui media daring",
     "D": "Mengumpulkan data ekonomi di wilayah kerja"},
    "C",
    "Pasal 4 huruf c PMK 111/2025 menyatakan bentuk kegiatan Pengawasan berupa mengundang Wajib Pajak untuk hadir ke kantor Direktorat Jenderal Pajak secara luring atau melalui media daring.",
    P8("mengundang Wajib Pajak untuk hadir ke kantor Direktorat Jenderal Pajak secara luring atau melalui media daring"),
    TAGS4)

# ======================================================================
# SUBTOPIK 5 — Probis Pengawasan WP Terdaftar (p.9-10)
# ======================================================================
TAGS5 = ["PMK-111/2025", "SP2DK"]
P9 = lambda kutipan: [{"pdf": "A", "halaman": 9, "kutipan": kutipan}]
P10 = lambda kutipan: [{"pdf": "A", "halaman": 10, "kutipan": kutipan}]

add(TOPIK_PROBIS, SUB5, "fakta", "mudah", 2,
    "Probis Pengawasan WP Terdaftar dalam PMK 111/2025 terdiri atas tiga kegiatan utama, yaitu Permintaan Penjelasan atas Data dan/atau Keterangan, Pemberian Teguran, dan...",
    {"A": "Penyampaian Imbauan", "B": "Pelaksanaan Pemeriksaan", "C": "Penerbitan Surat Ketetapan Pajak",
     "D": "Pengusulan Penyidikan"},
    "A",
    "Diagram Probis Pengawasan WP Terdaftar menunjukkan tiga kegiatan: Permintaan Penjelasan atas Data dan/atau Keterangan, Penyampaian Imbauan, dan Pemberian Teguran.",
    P9("Permintaan Penjelasan atas Data dan/atau Keterangan ... Penyampaian Imbauan ... Pemberian Teguran"), TAGS5)

add(TOPIK_PROBIS, SUB5, "fakta", "sedang", 2,
    "Salah satu ruang lingkup yang dicakup baik oleh kegiatan Permintaan Penjelasan maupun Penyampaian Imbauan dalam Probis Pengawasan WP Terdaftar adalah...",
    {"A": "Pendaftaran untuk memperoleh NPWP/aktivasi NIK sebagai NPWP", "B": "SPT tidak disampaikan sesuai batas waktu",
     "C": "Angsuran pajak dalam tahun pajak berjalan yang harus dibayar sendiri oleh Wajib Pajak",
     "D": "Pendaftaran objek pajak PBB atas perkebunan, perhutanan, pertambangan, minyak dan gas bumi, dan sektor lainnya"},
    "C",
    "Ruang lingkup materi Permintaan Penjelasan dan Penyampaian Imbauan mencakup angsuran pajak dalam tahun pajak berjalan yang harus dibayar sendiri oleh Wajib Pajak, selain pengukuhan PKP, pembayaran/penyetoran, pelaporan pajak, layanan/fasilitas, dan kewajiban formal.",
    P9("angsuran pajak dalam tahun pajak berjalan yang harus dibayar sendiri oleh Wajib Pajak"), TAGS5)

add(TOPIK_PROBIS, SUB5, "negasi", "sedang", 2,
    "Berikut termasuk ruang lingkup kegiatan Permintaan Penjelasan dan Penyampaian Imbauan dalam Probis Pengawasan WP Terdaftar, KECUALI...",
    {"A": "Pengukuhan sebagai Pengusaha Kena Pajak", "B": "Pembayaran dan/atau penyetoran pajak",
     "C": "Layanan dan/atau fasilitas perpajakan yang diterima dan/atau dimiliki oleh Wajib Pajak",
     "D": "SPT tidak disampaikan sesuai batas waktu"},
    "D",
    "SPT tidak disampaikan sesuai batas waktu merupakan ruang lingkup kegiatan Pemberian Teguran, bukan Permintaan Penjelasan atau Penyampaian Imbauan.",
    P9("SPT tidak disampaikan sesuai batas waktu"), TAGS5)

add(TOPIK_PROBIS, SUB5, "fakta", "sedang", 2,
    "Ruang lingkup kegiatan Pemberian Teguran dalam Probis Pengawasan WP Terdaftar mencakup SPT tidak disampaikan sesuai batas waktu dan...",
    {"A": "Angsuran pajak dalam tahun pajak berjalan yang harus dibayar sendiri oleh Wajib Pajak",
     "B": "Pelaksanaan ketentuan peraturan perundang-undangan di bidang perpajakan",
     "C": "Layanan dan/atau fasilitas perpajakan yang diterima dan/atau dimiliki oleh Wajib Pajak",
     "D": "Pengukuhan sebagai Pengusaha Kena Pajak"},
    "B",
    "Ruang lingkup Pemberian Teguran mencakup dua hal: SPT tidak disampaikan sesuai batas waktu, dan pelaksanaan ketentuan peraturan perundang-undangan di bidang perpajakan.",
    P9("pelaksanaan ketentuan peraturan undangan di bidang perpajakan"), TAGS5)

add(TOPIK_PROBIS, SUB5, "proses", "mudah", 2,
    "Kegiatan Permintaan Penjelasan atas Data dan/atau Keterangan dalam Tata Cara Pengawasan WP Terdaftar dituangkan dalam bentuk surat berupa...",
    {"A": "Surat Teguran", "B": "SP2DK", "C": "Surat Imbauan", "D": "SP3-P2DK"},
    "B",
    "Diagram Tata Cara Pengawasan WP Terdaftar menunjukkan bahwa Permintaan Penjelasan atas Data dan/atau Keterangan dituangkan dalam SP2DK.",
    P10("SP2DK"), TAGS5)

add(TOPIK_PROBIS, SUB5, "angka", "sedang", 2,
    "Jangka waktu maksimal yang diberikan kepada Wajib Pajak untuk menyampaikan penjelasan atas SP2DK, berdasarkan Tata Cara Pengawasan WP Terdaftar, adalah...",
    {"A": "7 hari", "B": "14 hari", "C": "14 hari + 7 hari", "D": "30 hari"},
    "C",
    "Diagram menunjukkan jangka waktu penyampaian penjelasan atas SP2DK maksimal 14 hari ditambah 7 hari.",
    P10("Max 14 hari + 7 hari"), TAGS5)

add(TOPIK_PROBIS, SUB5, "angka", "sedang", 2,
    "Jangka waktu maksimal yang diberikan kepada Wajib Pajak untuk menanggapi surat imbauan, berdasarkan Tata Cara Pengawasan WP Terdaftar, adalah...",
    {"A": "14 hari + 7 hari", "B": "14 hari", "C": "7 hari", "D": "21 hari"},
    "B",
    "Diagram menunjukkan jangka waktu tanggapan atas surat imbauan maksimal 14 hari, berbeda dengan SP2DK yang ditambah 7 hari.",
    P10("surat imbauan Max 14 hari"), TAGS5)

add(TOPIK_PROBIS, SUB5, "kasus", "sulit", 2,
    "Wajib Pajak tidak menyampaikan penjelasan atas SP2DK dalam jangka waktu yang ditentukan. Berdasarkan Tata Cara Pengawasan WP Terdaftar, tindak lanjut yang dilakukan adalah...",
    {"A": "Langsung menerbitkan SP3-P2DK tanpa proses lebih lanjut", "B": "Langsung mengusulkan pemeriksaan bukti permulaan",
     "C": "Undangan pembahasan/Kunjungan", "D": "Menerbitkan Surat Ketetapan Pajak"},
    "C",
    "Apabila WP tidak menyampaikan penjelasan/belum sesuai atas SP2DK, tindak lanjutnya berupa Undangan pembahasan/Kunjungan sebelum berujung pada berita acara.",
    P10("WP tidak menyampaikan penjelasan/ belum sesuai ... Undangan pembahasan/ Kunjungan"), TAGS5)

add(TOPIK_PROBIS, SUB5, "proses", "sedang", 2,
    "Apabila berdasarkan tindak lanjut SP2DK Wajib Pajak dinyatakan case closed, produk hukum yang diterbitkan adalah...",
    {"A": "Surat Imbauan", "B": "Surat Teguran", "C": "Berita Acara Pemeriksaan", "D": "SP3-P2DK"},
    "D",
    "Diagram menunjukkan alur SP2DK yang case closed berujung pada penerbitan SP3-P2DK.",
    P10("case closed (huruf a) ... SP3-P2DK"), TAGS5)

add(TOPIK_PROBIS, SUB5, "proses", "sedang", 2,
    "Dalam Tata Cara Pengawasan WP Terdaftar, kegiatan Pengawasan dilaksanakan oleh Account Representative/pegawai DJP berdasarkan surat perintah Pengawasan maupun...",
    {"A": "Berdasarkan laporan masyarakat", "B": "Secara manual oleh Kepala Kantor Wilayah",
     "C": "Otomatis melalui Sistem", "D": "Berdasarkan putusan pengadilan pajak"},
    "C",
    "Diagram menyebutkan pelaksana Tata Cara Pengawasan WP Terdaftar adalah Account Representative/Pegawai DJP berdasarkan surat perintah Pengawasan, maupun secara otomatis melalui Sistem.",
    P10("Account Representative / Pegawai DJP Berdasarkan surat perintah Pengawasan Otomatis melalui Sistem"), TAGS5)

add(TOPIK_PROBIS, SUB5, "negasi", "sulit", 2,
    "Berikut termasuk media penyampaian SP2DK, surat imbauan, atau surat teguran kepada Wajib Pajak sebagaimana Tata Cara Pengawasan WP Terdaftar, KECUALI...",
    {"A": "Melalui Akun Wajib Pajak", "B": "Melalui faksimile", "C": "Melalui media sosial resmi DJP",
     "D": "Langsung dengan Berita Acara"},
    "C",
    "Media penyampaian yang diatur meliputi melalui Akun WP, pos elektronik, pos, faksimile, dan langsung dengan Berita Acara; media sosial resmi DJP tidak disebutkan sebagai media penyampaian.",
    P10("melalui Akun WP - melalui pos elektronik - melalui pos - melalui faksimile - Langsung (dengan BA)"), TAGS5)

add(TOPIK_PROBIS, SUB5, "fakta", "mudah", 2,
    "Selain melalui Akun WP, pos elektronik, pos, dan langsung dengan Berita Acara, SP2DK/surat imbauan/surat teguran juga dapat disampaikan melalui...",
    {"A": "Telepon", "B": "Pesan singkat (SMS)", "C": "Media sosial", "D": "Faksimile"},
    "D",
    "Diagram Tata Cara Pengawasan WP Terdaftar menyebutkan faksimile sebagai salah satu media penyampaian SP2DK/surat imbauan/surat teguran.",
    P10("melalui faksimile"), TAGS5)

add(TOPIK_PROBIS, SUB5, "proses", "sulit", 2,
    "Jika Wajib Pajak memenuhi kewajiban/penjelasannya sudah sesuai atas surat imbauan yang disampaikan, status kasus yang tercatat dalam Tata Cara Pengawasan WP Terdaftar adalah...",
    {"A": "Usulan lain (huruf b-l)", "B": "Diteruskan ke pemeriksaan", "C": "SP3-P2DK", "D": "Case closed (huruf a)"},
    "D",
    "Apabila WP memenuhi kewajiban/penjelasan sudah sesuai atas surat imbauan, status kasusnya langsung case closed (huruf a) tanpa melalui tahap pembahasan.",
    P10("Memenuhi kewajiban/ Penjelasan WP sudah sesuai ... case closed (huruf a)"), TAGS5)

add(TOPIK_PROBIS, SUB5, "proses", "sedang", 2,
    "Tindak lanjut atas Surat Teguran yang disampaikan kepada Wajib Pajak, berdasarkan Tata Cara Pengawasan WP Terdaftar, dapat berupa Kunjungan, Surat Undangan Pembahasan, atau...",
    {"A": "Pengusulan penyidikan", "B": "Kegiatan lain", "C": "Pemeriksaan bukti permulaan", "D": "Penerbitan SP3-P2DK"},
    "B",
    "Diagram menyebutkan Surat Teguran dapat ditindaklanjuti dengan Kunjungan, Surat Undangan Pembahasan, atau kegiatan lain.",
    P10("dapat ditindaklanjuti: Kunjungan, Surat Undangan Pembahasan, kegiatan lain"), TAGS5)

add(TOPIK_PROBIS, SUB5, "kasus", "sedang", 2,
    "Seorang Account Representative mengirimkan surat imbauan kepada Wajib Pajak terkait kewajiban pelaporan pajak. Wajib Pajak tidak menyampaikan penjelasan/belum sesuai dalam jangka waktu yang ditentukan. Berdasarkan Tata Cara Pengawasan WP Terdaftar, langkah tindak lanjut berikutnya adalah...",
    {"A": "Langsung menerbitkan Surat Ketetapan Pajak", "B": "Langsung case closed",
     "C": "Mengusulkan pemeriksaan tanpa pembahasan", "D": "Undangan pembahasan/Kunjungan"},
    "D",
    "Apabila WP tidak menyampaikan penjelasan/belum sesuai atas surat imbauan, tindak lanjutnya berupa Undangan pembahasan/Kunjungan sebelum berujung pada berita acara dan usulan lain.",
    P10("WP tidak menyampaikan penjelasan/ belum sesuai ... Undangan pembahasan/ Kunjungan"), TAGS5)

# ======================================================================
# Rebalance kunci (A/B/C/D) distribution without changing option CONTENT:
# for each question, keep the same 4 option texts, just reassign which
# letter slot each text sits in, via round-robin for the correct answer.
LETTERS = ["A", "B", "C", "D"]
for i, q in enumerate(questions):
    correct_text = q["opsi"][q["kunci"]]
    distractor_texts = [v for k, v in q["opsi"].items() if k != q["kunci"]]
    new_correct_letter = LETTERS[i % 4]
    remaining_letters = [l for l in LETTERS if l != new_correct_letter]
    new_opsi = {new_correct_letter: correct_text}
    for letter, text in zip(remaining_letters, distractor_texts):
        new_opsi[letter] = text
    # reorder dict by A,B,C,D for readability
    q["opsi"] = {l: new_opsi[l] for l in LETTERS}
    q["kunci"] = new_correct_letter

OUT.parent.mkdir(parents=True, exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(questions)} questions to {OUT}")

# quick distribution report
from collections import Counter
print("tipe:", Counter(q["tipe"] for q in questions))
print("kesulitan:", Counter(q["kesulitan"] for q in questions))
print("kunci:", Counter(q["kunci"] for q in questions))
print("subtopik counts:", Counter(q["subtopik"] for q in questions))
ids = [q["id"] for q in questions]
print("unique ids:", len(set(ids)) == len(ids))
