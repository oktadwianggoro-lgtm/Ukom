import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CheckCircle2 } from 'lucide-react'
import { useQuestions } from '../data/hooks'
import { usePendingSession } from '../store/session'
import { useSettings } from '../store/settings'
import { createAttempt, buildOptionOrder, saveAnswer, finishAttempt } from '../lib/attempts'
import { useBookmarkSet, toggleBookmark } from '../lib/bookmarks'
import QuestionCard from '../components/QuestionCard'
import type { OpsiKey } from '../types'

export default function LatihanSesi() {
  const { questionIds, mode, label, clear } = usePendingSession()
  const { questions } = useQuestions()
  const randomize = useSettings((s) => s.randomizeOptions)
  const navigate = useNavigate()

  const sessionQuestions = useMemo(
    () => questionIds.map((id) => questions.find((q) => q.id === id)).filter((q): q is NonNullable<typeof q> => !!q),
    [questionIds, questions],
  )

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<Record<string, OpsiKey | null>>({})
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const optionOrderRef = useRef(buildOptionOrder(sessionQuestions, randomize))
  const bookmarks = useBookmarkSet()

  useEffect(() => {
    if (sessionQuestions.length === 0) return
    const attemptMode = mode === 'belajar' ? 'latihan' : mode === 'fokus_merah' ? 'fokus_merah' : 'kuis_cepat'
    createAttempt({ mode: attemptMode, questionIds: sessionQuestions.map((q) => q.id), optionOrder: optionOrderRef.current }).then(
      setAttemptId,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionQuestions.length])

  if (sessionQuestions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-(--text-muted) mb-4">Tidak ada sesi aktif.</p>
        <button onClick={() => navigate('/latihan')} className="btn-primary">
          Kembali ke Latihan
        </button>
      </div>
    )
  }

  const q = sessionQuestions[index]
  const isBelajar = mode === 'belajar' || mode === 'fokus_merah'
  const showAnswer = isBelajar && revealed.has(q.id)

  async function handleSelect(letter: OpsiKey) {
    setSelected((prev) => ({ ...prev, [q.id]: letter }))
    if (attemptId !== null) {
      await saveAnswer(attemptId, q.id, { selected: letter, answeredAt: Date.now() })
    }
    if (isBelajar) {
      setRevealed((prev) => new Set(prev).add(q.id))
    }
  }

  async function finishSession() {
    if (attemptId === null) return
    let benar = 0
    let salah = 0
    let kosong = 0
    for (const sq of sessionQuestions) {
      const sel = selected[sq.id]
      if (!sel) kosong++
      else if (sel === sq.kunci) benar++
      else salah++
    }
    const total = sessionQuestions.length
    const score = total > 0 ? Math.round((benar / total) * 100) : 0
    await finishAttempt(attemptId, 'submitted', { score, benar, salah, kosong })
    setFinished(true)
  }

  function next() {
    if (index < sessionQuestions.length - 1) setIndex(index + 1)
    else if (!isBelajar) finishSession()
  }

  if (finished) {
    let benar = 0
    for (const sq of sessionQuestions) if (selected[sq.id] === sq.kunci) benar++
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <CheckCircle2 size={48} className="mx-auto text-ok-green" />
        <h2 className="text-xl font-bold">Sesi selesai!</h2>
        <p className="text-(--text-muted)">
          Benar {benar} dari {sessionQuestions.length} soal ({Math.round((benar / sessionQuestions.length) * 100)}%)
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              clear()
              navigate('/latihan')
            }}
            className="btn-primary"
          >
            Latihan Lagi
          </button>
          <button
            onClick={() => {
              clear()
              navigate('/')
            }}
            className="btn-secondary"
          >
            Ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            clear()
            navigate(-1)
          }}
          className="flex items-center gap-1.5 text-sm text-(--text-muted)"
        >
          <ArrowLeft size={15} /> Keluar
        </button>
        <div className="flex items-center gap-2">
          <span className="chip chip-active">{label || 'Latihan'}</span>
          <button
            onClick={() => toggleBookmark(q.id)}
            className="p-2 rounded-lg border border-(--border-subtle) hover:bg-(--bg-surface-2) transition-colors"
            aria-label="Tandai soal"
          >
            {bookmarks.has(q.id) ? <BookmarkCheck size={15} className="text-gold-600" /> : <Bookmark size={15} />}
          </button>
        </div>
      </div>

      <QuestionCard
        question={q}
        index={index}
        total={sessionQuestions.length}
        selected={selected[q.id] ?? null}
        optionOrder={optionOrderRef.current[q.id] ?? ['A', 'B', 'C', 'D']}
        onSelect={handleSelect}
        showAnswer={showAnswer}
      />

      <div className="flex items-center justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="btn-secondary disabled:opacity-40"
        >
          Sebelumnya
        </button>
        {isBelajar ? (
          showAnswer ? (
            <button onClick={next} className="btn-primary">
              {index < sessionQuestions.length - 1 ? 'Soal Berikutnya' : 'Selesai'} <ArrowRight size={15} />
            </button>
          ) : (
            <span className="text-xs text-(--text-muted)">Pilih jawaban untuk melihat pembahasan</span>
          )
        ) : (
          <button onClick={next} className="btn-primary">
            {index < sessionQuestions.length - 1 ? 'Berikutnya' : 'Selesai'} <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
