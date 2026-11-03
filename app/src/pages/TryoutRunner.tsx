import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Grid3x3, X } from 'lucide-react'
import { useQuestions, useTryouts } from '../data/hooks'
import { useSettings } from '../store/settings'
import { buildOptionOrder, createAttempt, getActiveTryoutAttempt, saveAnswer, finishAttempt } from '../lib/attempts'
import { computeScore } from '../lib/scoring'
import { db } from '../db'
import type { Attempt, OpsiKey } from '../types'
import QuestionCard from '../components/QuestionCard'
import QuestionGrid from '../components/QuestionGrid'
import Timer from '../components/Timer'

export default function TryoutRunner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tryouts } = useTryouts()
  const { questions } = useQuestions()
  const randomize = useSettings((s) => s.randomizeOptions)
  const scoring = useSettings((s) => s.scoring)
  const targetScore = useSettings((s) => s.targetScore)

  const tryout = tryouts.find((t) => t.id === id)
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [index, setIndex] = useState(0)
  const [gridOpen, setGridOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const questionStartRef = useRef<number>(Date.now())
  const submittingRef = useRef(false)

  const sessionQuestions = useMemo(() => {
    if (!tryout) return []
    const byId = new Map(questions.map((q) => [q.id, q]))
    return tryout.soal_ids.map((qid) => byId.get(qid)).filter((q): q is NonNullable<typeof q> => !!q)
  }, [tryout, questions])

  useEffect(() => {
    if (!tryout || sessionQuestions.length === 0) return
    let active = true
    ;(async () => {
      const existing = await getActiveTryoutAttempt(tryout.id)
      if (existing) {
        if (active) {
          setAttempt(existing)
          setAttemptId(existing.id ?? null)
        }
        return
      }
      const optionOrder = buildOptionOrder(sessionQuestions, randomize)
      const newId = await createAttempt({
        mode: 'tryout',
        tryoutId: tryout.id,
        questionIds: sessionQuestions.map((q) => q.id),
        durationMs: tryout.durasi_menit * 60000,
        optionOrder,
      })
      const fresh = await db.attempts.get(newId)
      if (active && fresh) {
        setAttempt(fresh)
        setAttemptId(newId)
      }
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tryout?.id, sessionQuestions.length])

  const refreshAttempt = useCallback(async () => {
    if (attemptId === null) return
    const fresh = await db.attempts.get(attemptId)
    if (fresh) setAttempt(fresh)
  }, [attemptId])

  const handleSubmit = useCallback(
    async (auto: boolean) => {
      if (attemptId === null || !attempt || submittingRef.current) return
      submittingRef.current = true
      const score = computeScore(attempt, sessionQuestions, scoring, targetScore)
      await finishAttempt(attemptId, auto ? 'auto_submitted' : 'submitted', {
        score: score.score,
        benar: score.benar,
        salah: score.salah,
        kosong: score.kosong,
      })
      navigate(`/tryout/${tryout?.id}/hasil?attemptId=${attemptId}`)
    },
    [attemptId, attempt, sessionQuestions, scoring, targetScore, navigate, tryout?.id],
  )

  const q = sessionQuestions[index]

  const handleSelect = useCallback(
    async (letter: OpsiKey) => {
      if (attemptId === null || !q) return
      const now = Date.now()
      const elapsed = now - questionStartRef.current
      questionStartRef.current = now
      const prevTime = attempt?.answers[q.id]?.timeSpentMs ?? 0
      await saveAnswer(attemptId, q.id, { selected: letter, answeredAt: now, timeSpentMs: prevTime + elapsed })
      if (navigator.vibrate) navigator.vibrate(10)
      await refreshAttempt()
    },
    [attemptId, q, attempt, refreshAttempt],
  )

  const toggleFlag = useCallback(async () => {
    if (attemptId === null || !q) return
    const current = attempt?.answers[q.id]?.flagged ?? false
    await saveAnswer(attemptId, q.id, { flagged: !current })
    await refreshAttempt()
  }, [attemptId, q, attempt, refreshAttempt])

  useEffect(() => {
    questionStartRef.current = Date.now()
  }, [index])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (confirmOpen) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const key = e.key.toLowerCase()
      const letterMap: Record<string, OpsiKey> = { a: 'A', b: 'B', c: 'C', d: 'D', '1': 'A', '2': 'B', '3': 'C', '4': 'D' }
      if (letterMap[key]) {
        handleSelect(letterMap[key])
      } else if (key === 'arrowright') {
        setIndex((i) => Math.min(sessionQuestions.length - 1, i + 1))
      } else if (key === 'arrowleft') {
        setIndex((i) => Math.max(0, i - 1))
      } else if (key === 'r') {
        toggleFlag()
      } else if (key === 'g') {
        setGridOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSelect, toggleFlag, sessionQuestions.length, confirmOpen])

  if (!tryout) return <p className="text-sm text-(--text-muted)">Tryout tidak ditemukan.</p>
  if (!attempt || !q) return <p className="text-sm text-(--text-muted)">Menyiapkan ujian...</p>

  const emptyCount = sessionQuestions.filter((sq) => !attempt.answers[sq.id]?.selected).length
  const flaggedCount = sessionQuestions.filter((sq) => attempt.answers[sq.id]?.flagged).length

  function gridState(i: number): 'answered' | 'flagged' | 'empty' {
    const sq = sessionQuestions[i]
    const a = attempt!.answers[sq.id]
    if (a?.flagged) return 'flagged'
    if (a?.selected) return 'answered'
    return 'empty'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="font-bold text-lg">{tryout.nama}</h1>
        <div className="flex items-center gap-2">
          <Timer deadlineAt={attempt.deadlineAt ?? Date.now()} onExpire={() => handleSubmit(true)} />
          <button
            onClick={() => setGridOpen(true)}
            className="lg:hidden p-2.5 rounded-xl border border-(--border-subtle)"
            aria-label="Buka grid nomor"
          >
            <Grid3x3 size={18} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-4">
          <QuestionCard
            question={q}
            index={index}
            total={sessionQuestions.length}
            selected={attempt.answers[q.id]?.selected ?? null}
            optionOrder={attempt.optionOrder?.[q.id] ?? ['A', 'B', 'C', 'D']}
            onSelect={handleSelect}
            flagged={attempt.answers[q.id]?.flagged}
            onToggleFlag={toggleFlag}
            showAnswer={false}
          />
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="btn-secondary disabled:opacity-40"
            >
              Sebelumnya
            </button>
            {index < sessionQuestions.length - 1 ? (
              <button
                onClick={() => setIndex((i) => i + 1)}
                className="btn-primary"
              >
                Berikutnya
              </button>
            ) : (
              <button
                onClick={() => setConfirmOpen(true)}
                className="btn-primary bg-none bg-prio-red hover:brightness-110"
              >
                Selesaikan Ujian
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-4 card p-4 space-y-3">
            <p className="text-xs font-semibold text-(--text-muted)">Navigasi Soal</p>
            <QuestionGrid total={sessionQuestions.length} current={index} getState={gridState} onJump={setIndex} />
            <Legend />
            <button
              onClick={() => setConfirmOpen(true)}
              className="btn-primary bg-none bg-prio-red hover:brightness-110 w-full"
            >
              Selesaikan Ujian
            </button>
          </div>
        </div>
      </div>

      {gridOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-end lg:hidden" onClick={() => setGridOpen(false)}>
          <div
            className="w-full bg-(--bg-surface) rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Navigasi Soal</p>
              <button onClick={() => setGridOpen(false)} aria-label="Tutup">
                <X size={18} />
              </button>
            </div>
            <QuestionGrid
              total={sessionQuestions.length}
              current={index}
              getState={gridState}
              onJump={(i) => {
                setIndex(i)
                setGridOpen(false)
              }}
            />
            <Legend />
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmOpen(false)}>
          <div className="card p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold">Selesaikan ujian?</h3>
            <p className="text-sm text-(--text-muted)">
              {emptyCount} soal kosong, {flaggedCount} soal ditandai ragu-ragu. Jawaban tidak dapat diubah setelah disubmit.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="btn-primary bg-none bg-prio-red hover:brightness-110 flex-1"
              >
                Ya, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-(--text-muted)">
      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-ok-green-bg border border-ok-green/50 inline-block" /> Dijawab</span>
      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-warn-amber/20 border border-warn-amber inline-block" /> Ragu-ragu</span>
      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm border border-(--border-subtle) inline-block" /> Kosong</span>
    </div>
  )
}
