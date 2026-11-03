import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Layers, RotateCcw } from 'lucide-react'
import { useQuestions } from '../data/hooks'
import { db } from '../db'
import { applySrsGrade, type SrsGrade } from '../lib/srs'

const GRADES: { value: SrsGrade; label: string; className: string }[] = [
  { value: 'lagi', label: 'Lagi', className: 'bg-prio-red text-white' },
  { value: 'sulit', label: 'Sulit', className: 'bg-warn-amber text-navy-950' },
  { value: 'baik', label: 'Baik', className: 'bg-navy-700 text-white' },
  { value: 'mudah', label: 'Mudah', className: 'bg-ok-green text-white' },
]

export default function Flashcard() {
  const { questions } = useQuestions()
  const cards = useLiveQuery(() => db.flashcards.toArray(), [])
  const [flipped, setFlipped] = useState(false)
  const [cursor, setCursor] = useState(0)

  const dueCards = useMemo(() => {
    if (!cards) return []
    const now = Date.now()
    return cards.filter((c) => c.dueAt <= now)
  }, [cards])

  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions])
  const current = dueCards[cursor % Math.max(dueCards.length, 1)]
  const question = current ? byId.get(current.questionId) : undefined

  async function grade(g: SrsGrade) {
    if (!current?.id) return
    const result = applySrsGrade(current, g)
    await db.flashcards.update(current.id, {
      ...result,
      lastResult: g,
      dueAt: Date.now() + result.intervalDays * 86400000,
      updatedAt: Date.now(),
    })
    setFlipped(false)
    setCursor((c) => c + 1)
  }

  if (!cards) return <p className="text-sm text-(--text-muted)">Memuat...</p>

  if (cards.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-3">
        <Layers size={40} className="mx-auto text-(--text-muted)" />
        <h1 className="text-xl font-bold">Belum ada flashcard</h1>
        <p className="text-sm text-(--text-muted)">
          Kartu flashcard dibuat otomatis dari soal yang salah saat review hasil Tryout/Latihan, atau tandai soal di Bank Soal.
        </p>
      </div>
    )
  }

  if (dueCards.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-3">
        <Layers size={40} className="mx-auto text-ok-green" />
        <h1 className="text-xl font-bold">Semua kartu sudah direview hari ini!</h1>
        <p className="text-sm text-(--text-muted)">Total {cards.length} kartu di koleksi kamu. Kembali lagi nanti.</p>
      </div>
    )
  }

  if (!question) {
    return <p className="text-sm text-(--text-muted)">Soal untuk kartu ini tidak ditemukan.</p>
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Layers size={20} /> Flashcard
        </h1>
        <p className="text-sm text-(--text-muted)">{dueCards.length} kartu jatuh tempo</p>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="card card-hover w-full min-h-72 p-8 lg:p-10 flex flex-col items-center justify-center text-center gap-3"
      >
        {!flipped ? (
          <>
            <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-wide">Pertanyaan</span>
            <p className="text-lg font-medium whitespace-pre-line">{question.pertanyaan}</p>
            <span className="text-xs text-(--text-muted) flex items-center gap-1 mt-2">
              <RotateCcw size={13} /> Ketuk untuk lihat jawaban
            </span>
          </>
        ) : (
          <>
            <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-wide">Jawaban</span>
            <p className="text-lg font-bold text-ok-green">
              {question.kunci}. {question.opsi[question.kunci]}
            </p>
            <p className="text-sm text-(--text-muted) mt-2">{question.pembahasan}</p>
          </>
        )}
      </button>

      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button
              key={g.value}
              onClick={() => grade(g.value)}
              className={`py-3 rounded-2xl text-sm font-semibold shadow-sm hover:brightness-110 active:scale-95 transition ${g.className}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
