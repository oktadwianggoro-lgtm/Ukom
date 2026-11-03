import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Attempt, Question } from '../types'

export interface DashboardStats {
  totalDikerjakan: number
  totalBenar: number
  akurasiKeseluruhan: number
  skorTryoutTerbaik: number | null
  perKompetensi: Record<string, { benar: number; total: number }>
  perTopik: Record<string, { benar: number; total: number }>
  topikTerlemah: { topik: string; akurasi: number; total: number }[]
  streak: number
  riwayatTryout: { name: string; skor: number }[]
}

function computeStreak(dates: Set<string>): number {
  let streak = 0
  const d = new Date()
  for (;;) {
    const key = d.toISOString().slice(0, 10)
    if (dates.has(key)) {
      streak += 1
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function useDashboardStats(questions: Question[]): DashboardStats | null {
  const attempts = useLiveQuery(() => db.attempts.toArray(), [])

  if (!attempts || questions.length === 0) return null

  const byId = new Map(questions.map((q) => [q.id, q]))
  let totalDikerjakan = 0
  let totalBenar = 0
  const perKompetensi: Record<string, { benar: number; total: number }> = {}
  const perTopik: Record<string, { benar: number; total: number }> = {}
  const activeDates = new Set<string>()
  const riwayatTryout: { name: string; skor: number }[] = []
  let skorTryoutTerbaik: number | null = null

  const sorted = [...attempts].sort((a, b) => a.startedAt - b.startedAt)

  for (const attempt of sorted as Attempt[]) {
    const dateKey = new Date(attempt.startedAt).toISOString().slice(0, 10)
    activeDates.add(dateKey)

    for (const qid of attempt.questionIds) {
      const ans = attempt.answers[qid]
      if (!ans || ans.selected === null) continue
      const q = byId.get(qid)
      if (!q) continue
      totalDikerjakan += 1
      perKompetensi[q.kompetensi] ??= { benar: 0, total: 0 }
      perKompetensi[q.kompetensi].total += 1
      perTopik[q.topik] ??= { benar: 0, total: 0 }
      perTopik[q.topik].total += 1
      if (ans.selected === q.kunci) {
        totalBenar += 1
        perKompetensi[q.kompetensi].benar += 1
        perTopik[q.topik].benar += 1
      }
    }

    if (attempt.mode === 'tryout' && (attempt.status === 'submitted' || attempt.status === 'auto_submitted')) {
      const skor = attempt.score ?? 0
      riwayatTryout.push({ name: attempt.tryoutId ?? '-', skor })
      if (skorTryoutTerbaik === null || skor > skorTryoutTerbaik) skorTryoutTerbaik = skor
    }
  }

  const topikTerlemah = Object.entries(perTopik)
    .filter(([, d]) => d.total >= 3)
    .map(([topik, d]) => ({ topik, akurasi: Math.round((d.benar / d.total) * 100), total: d.total }))
    .sort((a, b) => a.akurasi - b.akurasi)
    .slice(0, 3)

  return {
    totalDikerjakan,
    totalBenar,
    akurasiKeseluruhan: totalDikerjakan > 0 ? Math.round((totalBenar / totalDikerjakan) * 100) : 0,
    skorTryoutTerbaik,
    perKompetensi,
    perTopik,
    topikTerlemah,
    streak: computeStreak(activeDates),
    riwayatTryout,
  }
}
