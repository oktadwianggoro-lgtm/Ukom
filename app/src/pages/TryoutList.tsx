import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'motion/react'
import { CheckCircle2, Clock, Flame, ListChecks, PlayCircle, Target } from 'lucide-react'
import { useTryouts } from '../data/hooks'
import { db } from '../db'

function tryoutAccent(nama: string) {
  if (nama.includes('Prediksi Lingkaran Merah')) {
    return {
      bar: 'from-prio-red to-gold-500',
      badge: 'bg-prio-red/10 text-prio-red',
      icon: Flame,
    }
  }
  if (nama.includes('Simulasi Final')) {
    return {
      bar: 'from-navy-900 to-navy-600',
      badge: 'bg-navy-900/10 text-navy-700 dark:bg-navy-300/15 dark:text-navy-200',
      icon: Target,
    }
  }
  return {
    bar: 'from-navy-600 to-gold-400',
    badge: 'bg-navy-900/10 text-navy-700 dark:bg-navy-300/15 dark:text-navy-200',
    icon: ListChecks,
  }
}

export default function TryoutList() {
  const { tryouts, loading } = useTryouts()
  const attempts = useLiveQuery(() => db.attempts.where('mode').equals('tryout').toArray(), [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Tryout</h1>
          <p className="text-sm text-(--text-muted) mt-1">10 paket × 100 soal × 60 menit, meniru format CAT.</p>
        </div>
        <span className="chip chip-active">
          <Clock size={14} /> 10 paket siap
        </span>
      </div>

      {loading && <p className="text-sm text-(--text-muted)">Memuat...</p>}
      {!loading && tryouts.length === 0 && (
        <p className="text-sm text-(--text-muted)">Paket tryout belum dibuat. Jalankan Fase 5 (build_tryouts.py) terlebih dulu.</p>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {tryouts.map((t, i) => {
          const related = (attempts ?? []).filter((a) => a.tryoutId === t.id)
          const inProgress = related.find((a) => a.status === 'in_progress')
          const best = related
            .filter((a) => a.status !== 'in_progress')
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]
          const accent = tryoutAccent(t.nama)
          const Icon = accent.icon

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
              className="card card-hover relative flex flex-col gap-4 p-5 overflow-hidden"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent.bar}`} />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold leading-snug">{t.nama}</h3>
                  <p className="text-xs text-(--text-muted) flex items-center gap-1.5 mt-1.5">
                    <Clock size={13} /> {t.durasi_menit} menit · {t.soal_ids.length} soal
                  </p>
                </div>
                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${accent.badge}`}>
                  <Icon size={16} />
                </div>
              </div>

              {t.deskripsi && <p className="text-xs text-(--text-muted) -mt-2">{t.deskripsi}</p>}

              {best && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ok-green bg-ok-green-bg px-2.5 py-1.5 rounded-lg w-fit">
                  <CheckCircle2 size={14} /> Skor terbaik: {best.score}
                </div>
              )}

              <Link to={`/tryout/${t.id}`} className="btn-primary mt-auto w-full">
                <PlayCircle size={16} /> {inProgress ? 'Lanjutkan' : best ? 'Kerjakan Lagi' : 'Mulai'}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
