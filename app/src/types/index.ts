export type Kompetensi =
  | 'Advokasi Kebijakan Perpajakan'
  | 'Analisis Kepatuhan Wajib Pajak'
  | 'Analisis Potensi Pajak'
  | 'Ekstensifikasi Perpajakan'
  | 'Pemeriksaan Pajak'
  | 'Profiling Wajib Pajak'

export const KOMPETENSI_LIST: Kompetensi[] = [
  'Advokasi Kebijakan Perpajakan',
  'Analisis Kepatuhan Wajib Pajak',
  'Analisis Potensi Pajak',
  'Ekstensifikasi Perpajakan',
  'Pemeriksaan Pajak',
  'Profiling Wajib Pajak',
]

export const KOMPETENSI_SHORT: Record<Kompetensi, string> = {
  'Advokasi Kebijakan Perpajakan': 'Advokasi',
  'Analisis Kepatuhan Wajib Pajak': 'Kepatuhan',
  'Analisis Potensi Pajak': 'Potensi',
  'Ekstensifikasi Perpajakan': 'Ekstensifikasi',
  'Pemeriksaan Pajak': 'Pemeriksaan',
  'Profiling Wajib Pajak': 'Profiling',
}

export type TipeSoal = 'fakta' | 'angka' | 'dasar_hukum' | 'proses' | 'kasus' | 'negasi'
export type Kesulitan = 'mudah' | 'sedang' | 'sulit'
export type OpsiKey = 'A' | 'B' | 'C' | 'D'
export type PdfCode = 'A' | 'B' | 'C'

export interface SumberSoal {
  pdf: PdfCode
  halaman: number
  kutipan: string
}

export interface Question {
  id: string
  kompetensi: Kompetensi
  topik: string
  subtopik: string
  tipe: TipeSoal
  kesulitan: Kesulitan
  prioritas: 0 | 1 | 2 | 3
  pertanyaan: string
  opsi: Record<OpsiKey, string>
  kunci: OpsiKey
  pembahasan: string
  sumber: SumberSoal[]
  fact_ids?: string[]
  tags?: string[]
}

export interface Tryout {
  id: string
  nama: string
  deskripsi?: string
  durasi_menit: number
  soal_ids: string[]
  seed: number
}

export interface TopikSubtopik {
  nama: string
  sources: { pdf: PdfCode; pages: number[] }[]
  priority: 0 | 1 | 2 | 3
  est_questions: number
}

export interface TopikEntry {
  nama: string
  subtopik: TopikSubtopik[]
}

export interface KompetensiTopik {
  kompetensi: Kompetensi
  topik: TopikEntry[]
}

export interface JawabanSoal {
  questionId: string
  selected: OpsiKey | null
  flagged: boolean
  timeSpentMs: number
  answeredAt: number | null
}

export type AttemptMode = 'latihan' | 'kuis_cepat' | 'tryout' | 'fokus_merah'
export type AttemptStatus = 'in_progress' | 'submitted' | 'auto_submitted'

export interface Attempt {
  id?: number
  mode: AttemptMode
  tryoutId?: string
  questionIds: string[]
  optionOrder?: Record<string, OpsiKey[]>
  answers: Record<string, JawabanSoal>
  startedAt: number
  deadlineAt?: number
  finishedAt?: number
  status: AttemptStatus
  score?: number
  benar?: number
  salah?: number
  kosong?: number
}

export interface Bookmark {
  id?: number
  questionId: string
  createdAt: number
}

export interface FlashcardState {
  id?: number
  questionId: string
  repetitions: number
  easeFactor: number
  intervalDays: number
  dueAt: number
  lastResult?: 'lagi' | 'sulit' | 'baik' | 'mudah'
  updatedAt: number
}

export interface PlanChecklistItem {
  id?: number
  day: 1 | 2
  label: string
  done: boolean
}

export interface AppSettings {
  targetScore: number
  examDate: string // ISO datetime
  fontSize: 'sm' | 'md' | 'lg'
  theme: 'auto' | 'light' | 'dark'
  randomizeOptions: boolean
  scoring: 'plus1' | 'plus4min1'
}
