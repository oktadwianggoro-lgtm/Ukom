import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'motion/react'
import { CheckCircle2, Layers, Trophy, XCircle } from 'lucide-react'
import { useQuestions, useTryouts } from '../data/hooks'
import { useSettings } from '../store/settings'
import { computeScore } from '../lib/scoring'
import { db } from '../db'
import { newFlashcardState } from '../lib/srs'
import QuestionCard from '../components/QuestionCard'
import { BarBreakdown, TrendLine } from '../components/ResultChart'

export default function Hasil() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const attemptId = Number(params.get('attemptId'))
  const { tryouts } = useTryouts()
  const { questions } = useQuestions()
  const scoring = useSettings((s) => s.scoring)
  const targetScore = useSettings((s) => s.targetScore)
  const [filter, setFilter] = useState<'semua' | 'salah' | 'ragu'>('semua')
  const [added, setAdded] = useState(false)

  const attempt = useLiveQuery(() => db.attempts.get(attemptId), [attemptId])
  const allAttempts = useLiveQuery(() => db.attempts.where({ tryoutId: id }).toArray(), [id])

  const tryout = tryouts.find((t) => t.id === id)

  const breakdown = useMemo(() => {
    if (!attempt) return null
    return computeScore(attempt, questions, scoring, targetScore)
  }, [attempt, questions, scoring, targetScore])

  const trend = useMemo(() => {
    if (!allAttempts) return []
    return allAttempts
      .filter((a) => a.status !== 'in_progress')
      .sort((a, b) => a.startedAt - b.startedAt)
      .map((a, i) => ({ name: `Percobaan ${i + 1}`, skor: a.score ?? 0 }))
  }, [allAttempts])

  if (!attempt || !breakdown) return <p className="text-sm text-(--text-muted)">Memuat hasil...</p>

  const sessionQuestions = attempt.questionIds
    .map((qid) => questions.find((q) => q.id === qid))
    .filter((q): q is NonNullable<typeof q> => !!q)

  const filteredQuestions = sessionQuestions.filter((q) => {
    const ans = attempt.answers[q.id]
    if (filter === 'salah') return ans?.selected !== q.kunci
    if (filter === 'ragu') return ans?.flagged
    return true
  })

  async function tambahKeFlashcard() {
    const salahQuestions = sessionQuestions.filter((q) => attempt!.answers[q.id]?.selected !== q.kunci)
    for (const q of salahQuestions) {
      const existing = await db.flashcards.where({ questionId: q.id }).first()
      if (!existing) {
        await db.flashcards.add(newFlashcardState(q.id))
      }
    }
    setAdded(true)
  }

  const durasiMenit = attempt.finishedAt ? Math.round((attempt.finishedAt - attempt.startedAt) / 60000) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Hasil {tryout?.nama ?? attempt.mode}</h1>
          <p className="text-sm text-(--text-muted)">Dikerjakan {durasiMenit} menit</p>
        </div>
        <Link to="/tryout" className="text-sm font-semibold text-navy-700 dark:text-gold-400">
          Lihat Tryout Lain
        </Link>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0 }}
          className={`card-hover rounded-card shadow-card p-4 text-white ${breakdown.lulus ? 'bg-ok-green' : 'bg-prio-red'}`}
        >
          <Trophy size={18} className="mb-1" />
          <p className="text-xl lg:text-2xl font-bold">{breakdown.score}</p>
          <p className="text-xs opacity-90">{breakdown.lulus ? 'Lulus' : 'Belum lulus'} (target {targetScore})</p>
        </motion.div>
        <StatBox icon={CheckCircle2} label="Benar" value={breakdown.benar} iconClass="text-ok-green" chipClass="bg-ok-green/10" delay={0.05} />
        <StatBox icon={XCircle} label="Salah" value={breakdown.salah} iconClass="text-prio-red" chipClass="bg-prio-red/10" delay={0.1} />
        <StatBox icon={Layers} label="Kosong" value={breakdown.kosong} iconClass="text-(--text-muted)" chipClass="bg-(--bg-surface-2)" delay={0.15} />
        <StatBox icon={Layers} label="Total Soal" value={breakdown.total} iconClass="text-(--text-muted)" chipClass="bg-(--bg-surface-2)" delay={0.2} />
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-3">Breakdown per Kompetensi</h3>
          <BarBreakdown data={breakdown.perKompetensi} label="Akurasi" />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-3">Tren Skor Percobaan</h3>
          {trend.length > 1 ? <TrendLine data={trend} /> : <p className="text-sm text-(--text-muted) py-14 text-center">Kerjakan tryout ini lagi untuk melihat tren.</p>}
        </div>
      </section>

      <section className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {(['semua', 'salah', 'ragu'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`chip capitalize ${filter === f ? 'chip-active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={tambahKeFlashcard}
          disabled={added}
          className="btn-accent disabled:opacity-50"
        >
          {added ? 'Ditambahkan ke Flashcard' : 'Tambahkan semua yang salah ke Flashcard'}
        </button>
      </section>

      <section className="space-y-4">
        {filteredQuestions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={sessionQuestions.indexOf(q)}
            total={sessionQuestions.length}
            selected={attempt.answers[q.id]?.selected ?? null}
            optionOrder={attempt.optionOrder?.[q.id] ?? ['A', 'B', 'C', 'D']}
            onSelect={() => {}}
            showAnswer
          />
        ))}
        {filteredQuestions.length === 0 && <p className="text-sm text-(--text-muted) text-center py-10">Tidak ada soal untuk filter ini.</p>}
      </section>
    </div>
  )
}

function StatBox({
  icon: Icon,
  label,
  value,
  iconClass,
  chipClass,
  delay = 0,
}: {
  icon: typeof Trophy
  label: string
  value: number
  iconClass: string
  chipClass: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="card card-hover p-4"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${chipClass} ${iconClass}`}>
        <Icon size={17} />
      </div>
      <p className="text-xl lg:text-2xl font-bold">{value}</p>
      <p className="text-xs text-(--text-muted) mt-0.5">{label}</p>
    </motion.div>
  )
}
