import type { Attempt, Question } from '../types'
import type { AppSettings } from '../types'

export interface ScoreBreakdown {
  benar: number
  salah: number
  kosong: number
  total: number
  score: number
  lulus: boolean
  perKompetensi: Record<string, { benar: number; total: number }>
  perTipe: Record<string, { benar: number; total: number }>
}

export function computeScore(
  attempt: Attempt,
  questions: Question[],
  scoring: AppSettings['scoring'],
  targetScore: number,
): ScoreBreakdown {
  const byId = new Map(questions.map((q) => [q.id, q]))
  let benar = 0
  let salah = 0
  let kosong = 0
  const perKompetensi: Record<string, { benar: number; total: number }> = {}
  const perTipe: Record<string, { benar: number; total: number }> = {}

  for (const qid of attempt.questionIds) {
    const q = byId.get(qid)
    if (!q) continue
    const jawaban = attempt.answers[qid]
    const selected = jawaban?.selected ?? null

    perKompetensi[q.kompetensi] ??= { benar: 0, total: 0 }
    perKompetensi[q.kompetensi].total += 1
    perTipe[q.tipe] ??= { benar: 0, total: 0 }
    perTipe[q.tipe].total += 1

    if (selected === null) {
      kosong += 1
    } else if (selected === q.kunci) {
      benar += 1
      perKompetensi[q.kompetensi].benar += 1
      perTipe[q.tipe].benar += 1
    } else {
      salah += 1
    }
  }

  const total = attempt.questionIds.length
  let rawScore: number
  if (scoring === 'plus4min1') {
    rawScore = benar * 4 - salah * 1
  } else {
    rawScore = benar
  }
  const maxScore = scoring === 'plus4min1' ? total * 4 : total
  const score = total > 0 ? Math.max(0, Math.round((rawScore / maxScore) * 100)) : 0

  return {
    benar,
    salah,
    kosong,
    total,
    score,
    lulus: score >= targetScore,
    perKompetensi,
    perTipe,
  }
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
