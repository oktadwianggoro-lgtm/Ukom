import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'motion/react'
import { AlertTriangle, Clock, ListChecks } from 'lucide-react'
import { useQuestions } from '../data/hooks'
import { useDashboardStats } from '../lib/stats'
import { db } from '../db'

const TEMPO_TARGET_SECONDS = 36

export default function Statistik() {
  const { questions } = useQuestions()
  const stats = useDashboardStats(questions)
  const attempts = useLiveQuery(() => db.attempts.toArray(), [])

  const avgTimeSeconds = useMemo(() => {
    if (!attempts) return 0
    let totalMs = 0
    let count = 0
    for (const a of attempts) {
      for (const ans of Object.values(a.answers)) {
        if (ans.selected !== null && ans.timeSpentMs > 0) {
          totalMs += ans.timeSpentMs
          count += 1
        }
      }
    }
    return count > 0 ? Math.round(totalMs / count / 1000) : 0
  }, [attempts])

  const tryoutHistory = useMemo(() => {
    if (!attempts) return []
    return attempts
      .filter((a) => a.mode === 'tryout' && a.status !== 'in_progress')
      .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  }, [attempts])

  const topikHeatmap = useMemo(() => {
    if (!stats) return []
    return Object.entries(stats.perTopik)
      .map(([topik, d]) => ({ topik, akurasi: d.total > 0 ? Math.round((d.benar / d.total) * 100) : 0, total: d.total }))
      .sort((a, b) => b.total - a.total)
  }, [stats])

  function heatColor(pct: number) {
    if (pct >= 80) return 'bg-ok-green-bg border-ok-green/40'
    if (pct >= 60) return 'bg-gold-100 border-gold-400/40 dark:bg-gold-700/15'
    if (pct >= 40) return 'bg-warn-amber/15 border-warn-amber/40'
    return 'bg-prio-red-bg border-prio-red/40'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Statistik</h1>

      <section className="grid grid-cols-2 gap-3 lg:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0 }}
          className="card card-hover p-4"
        >
          <div className="w-9 h-9 rounded-xl bg-navy-600/10 text-navy-600 flex items-center justify-center mb-3">
            <Clock size={17} />
          </div>
          <p className="text-xl lg:text-2xl font-bold">{avgTimeSeconds}s</p>
          <p className="text-xs text-(--text-muted) mt-0.5">Rata-rata waktu/soal</p>
          {avgTimeSeconds > TEMPO_TARGET_SECONDS && (
            <p className="text-[11px] text-prio-red flex items-center gap-1 mt-1">
              <AlertTriangle size={11} /> Di atas target {TEMPO_TARGET_SECONDS}s/soal
            </p>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="card card-hover p-4"
        >
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center mb-3">
            <ListChecks size={17} />
          </div>
          <p className="text-xl lg:text-2xl font-bold">{tryoutHistory.length}</p>
          <p className="text-xs text-(--text-muted) mt-0.5">Tryout diselesaikan</p>
        </motion.div>
      </section>

      <section className="card p-5">
        <h3 className="font-semibold text-sm mb-3">Heatmap Akurasi per Topik</h3>
        {topikHeatmap.length === 0 ? (
          <p className="text-sm text-(--text-muted) text-center py-8">Belum ada data.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {topikHeatmap.map((t, i) => (
              <motion.div
                key={t.topik}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
                className={`rounded-xl border p-3 ${heatColor(t.akurasi)}`}
              >
                <p className="text-xs font-semibold truncate">{t.topik}</p>
                <p className="text-sm font-bold">{t.akurasi}%</p>
                <p className="text-[11px] text-(--text-muted)">{t.total} soal</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-5">
        <h3 className="font-semibold text-sm mb-3">Riwayat Tryout</h3>
        {tryoutHistory.length === 0 ? (
          <p className="text-sm text-(--text-muted) text-center py-8">Belum ada tryout yang diselesaikan.</p>
        ) : (
          <div className="divide-y divide-(--border-subtle)">
            {tryoutHistory.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium">{a.tryoutId}</p>
                  <p className="text-xs text-(--text-muted)">
                    {a.finishedAt ? new Date(a.finishedAt).toLocaleString('id-ID') : '-'}
                  </p>
                </div>
                <span className="font-bold">{a.score}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
