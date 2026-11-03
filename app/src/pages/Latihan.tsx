import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PencilLine, Zap } from 'lucide-react'
import { useQuestions } from '../data/hooks'
import { useQuestionHistory } from '../lib/history'
import { useBookmarkSet } from '../lib/bookmarks'
import { usePendingSession } from '../store/session'
import { KOMPETENSI_LIST, type Kesulitan, type Kompetensi, type TipeSoal } from '../types'

function normalizeTopic(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Topik dari topics.json (editorial) dan topik per-soal (freeform dari batch generasi) tidak
 * dijamin sama persis — cocokkan via substring atau kata signifikan yang beririsan. */
function looseTopicMatch(questionTopic: string, target: string): boolean {
  const a = normalizeTopic(questionTopic)
  const b = normalizeTopic(target)
  if (!a || !b) return false
  if (a.includes(b) || b.includes(a)) return true
  const aWords = new Set(a.split(' ').filter((w) => w.length >= 4))
  const bWords = new Set(b.split(' ').filter((w) => w.length >= 4))
  let shared = 0
  for (const w of aWords) if (bWords.has(w)) shared++
  return shared >= 2
}

const TIPE_OPTIONS: { value: TipeSoal; label: string }[] = [
  { value: 'fakta', label: 'Fakta & Definisi' },
  { value: 'angka', label: 'Angka/Jangka Waktu' },
  { value: 'dasar_hukum', label: 'Dasar Hukum' },
  { value: 'proses', label: 'Urutan Proses' },
  { value: 'kasus', label: 'Studi Kasus' },
  { value: 'negasi', label: 'Pengecualian/Negasi' },
]

export default function Latihan() {
  const { questions, loading } = useQuestions()
  const history = useQuestionHistory(questions)
  const bookmarks = useBookmarkSet()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setPending = usePendingSession((s) => s.setPending)

  const [kompetensi, setKompetensi] = useState<Kompetensi | 'semua'>('semua')
  const [topik, setTopik] = useState<string>(params.get('topik') ?? '')
  const [tipe, setTipe] = useState<Set<TipeSoal>>(new Set())
  const [kesulitan, setKesulitan] = useState<Set<Kesulitan>>(new Set())
  const [hanyaMerah, setHanyaMerah] = useState(false)
  const [belumDikerjakan, setBelumDikerjakan] = useState(false)
  const [pernahSalah, setPernahSalah] = useState(false)
  const [hanyaDitandai, setHanyaDitandai] = useState(false)

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (kompetensi !== 'semua' && q.kompetensi !== kompetensi) return false
      if (topik && !looseTopicMatch(q.topik, topik) && !looseTopicMatch(q.subtopik, topik)) return false
      if (tipe.size > 0 && !tipe.has(q.tipe)) return false
      if (kesulitan.size > 0 && !kesulitan.has(q.kesulitan)) return false
      if (hanyaMerah && q.prioritas < 2) return false
      const h = history.get(q.id)
      if (belumDikerjakan && h?.attempted) return false
      if (pernahSalah && !h?.everWrong) return false
      if (hanyaDitandai && !bookmarks.has(q.id)) return false
      return true
    })
  }, [questions, kompetensi, topik, tipe, kesulitan, hanyaMerah, belumDikerjakan, pernahSalah, hanyaDitandai, history, bookmarks])

  const topikOptions = useMemo(() => {
    const set = new Set<string>()
    for (const q of questions) {
      if (kompetensi === 'semua' || q.kompetensi === kompetensi) set.add(q.topik)
    }
    return Array.from(set).sort()
  }, [questions, kompetensi])

  function toggleSet<T>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    setter(next)
  }

  function start(mode: 'belajar' | 'kuis_cepat', limit?: number) {
    const ids = filtered.map((q) => q.id)
    const shuffled = [...ids].sort(() => Math.random() - 0.5)
    const final = limit ? shuffled.slice(0, limit) : shuffled
    if (final.length === 0) return
    const label = topik || (kompetensi !== 'semua' ? kompetensi : 'Latihan')
    setPending(final, mode, label)
    navigate('/latihan/sesi')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Latihan</h1>
        <p className="text-sm text-(--text-muted)">{loading ? 'Memuat soal...' : `${filtered.length} soal cocok dengan filter`}</p>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-(--text-muted)">Kompetensi</label>
            <select
              value={kompetensi}
              onChange={(e) => {
                setKompetensi(e.target.value as Kompetensi | 'semua')
                setTopik('')
              }}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-(--border-subtle) bg-(--bg-app) text-sm"
            >
              <option value="semua">Semua Kompetensi</option>
              {KOMPETENSI_LIST.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-(--text-muted)">Topik</label>
            <select
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-(--border-subtle) bg-(--bg-app) text-sm"
            >
              <option value="">Semua Topik</option>
              {topikOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-(--text-muted) mb-1.5">Tipe Soal</p>
          <div className="flex flex-wrap gap-1.5">
            {TIPE_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => toggleSet(tipe, t.value, setTipe)}
                className={`chip ${tipe.has(t.value) ? 'chip-active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-(--text-muted) mb-1.5">Kesulitan</p>
          <div className="flex flex-wrap gap-1.5">
            {(['mudah', 'sedang', 'sulit'] as Kesulitan[]).map((k) => (
              <button
                key={k}
                onClick={() => toggleSet(kesulitan, k, setKesulitan)}
                className={`chip capitalize ${kesulitan.has(k) ? 'chip-active' : ''}`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-1">
          {[
            { v: hanyaMerah, set: setHanyaMerah, label: 'Hanya prioritas merah' },
            { v: belumDikerjakan, set: setBelumDikerjakan, label: 'Belum pernah dikerjakan' },
            { v: pernahSalah, set: setPernahSalah, label: 'Pernah salah' },
            { v: hanyaDitandai, set: setHanyaDitandai, label: 'Ditandai (bookmark)' },
          ].map((f) => (
            <label key={f.label} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={f.v} onChange={(e) => f.set(e.target.checked)} className="w-4 h-4 accent-navy-700" />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => start('belajar')}
          disabled={filtered.length === 0}
          className="btn-primary"
        >
          <PencilLine size={16} /> Mode Belajar ({filtered.length} soal)
        </button>
        {[10, 20, 50].map((n) => (
          <button
            key={n}
            onClick={() => start('kuis_cepat', n)}
            disabled={filtered.length === 0}
            className="btn-secondary disabled:opacity-40"
          >
            <Zap size={16} /> Kuis Cepat {n}
          </button>
        ))}
      </div>
    </div>
  )
}
