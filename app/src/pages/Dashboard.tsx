import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'motion/react'
import { Flame, Target, Trophy, Repeat, ArrowRight, CircleCheck } from 'lucide-react'
import { useQuestions } from '../data/hooks'
import { useDashboardStats } from '../lib/stats'
import { useSettings } from '../store/settings'
import { RadarKompetensi } from '../components/ResultChart'
import { db } from '../db'

const PLAN: { day: 1 | 2; label: string }[] = [
  { day: 1, label: 'Materi Kilat semua kompetensi' },
  { day: 1, label: 'Fokus Merah — kerjakan 300 soal prioritas' },
  { day: 1, label: 'Tryout 1' },
  { day: 1, label: 'Tryout 2' },
  { day: 1, label: 'Tryout 3' },
  { day: 1, label: 'Review semua soal yang salah dari TO 1-3' },
  { day: 2, label: 'Tryout 4' },
  { day: 2, label: 'Tryout 5' },
  { day: 2, label: 'Tryout 6' },
  { day: 2, label: 'Tryout 7' },
  { day: 2, label: 'Tryout 8' },
  { day: 2, label: 'Drill topik terlemah (lihat Dashboard)' },
  { day: 2, label: 'Tryout 9 — Prediksi Lingkaran Merah' },
  { day: 2, label: 'Tryout 10 — Simulasi Final' },
  { day: 2, label: 'Flashcard semua soal yang pernah salah, lalu istirahat cukup' },
]

function useCountdown(targetIso: string) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = new Date(targetIso).getTime() - now
  if (diff <= 0) return null
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

export default function Dashboard() {
  const { questions } = useQuestions()
  const stats = useDashboardStats(questions)
  const examDate = useSettings((s) => s.examDate)
  const countdown = useCountdown(examDate)
  const checklist = useLiveQuery(() => db.planChecklist.toArray(), [])

  useEffect(() => {
    async function seed() {
      const count = await db.planChecklist.count()
      if (count === 0) {
        await db.planChecklist.bulkAdd(PLAN.map((p) => ({ day: p.day, label: p.label, done: false })))
      }
    }
    seed()
  }, [])

  async function toggleItem(id?: number) {
    if (id === undefined) return
    const item = await db.planChecklist.get(id)
    if (item) await db.planChecklist.update(id, { done: !item.done })
  }

  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white rounded-card p-6 lg:p-9 relative overflow-hidden shadow-card">
        <div className="absolute -right-16 -top-24 w-80 h-80 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-20 w-64 h-64 rounded-full bg-navy-400/20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-gold-300 text-sm font-medium mb-1 tracking-wide">Hitung mundur ujian UKOM/UKT JF PKN</p>
          {countdown ? (
            <div className="flex gap-4 sm:gap-6 lg:gap-10 mt-4">
              {[
                { v: countdown.days, l: 'Hari' },
                { v: countdown.hours, l: 'Jam' },
                { v: countdown.minutes, l: 'Menit' },
                { v: countdown.seconds, l: 'Detik' },
              ].map((c) => (
                <div key={c.l} className="text-center">
                  <p className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold tabular-nums">{String(c.v).padStart(2, '0')}</p>
                  <p className="text-xs text-navy-200 mt-1">{c.l}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-2xl font-bold mt-2">Semoga sukses ujiannya! 🎉</p>
          )}
          <p className="text-navy-200 text-xs mt-4">
            Target: {new Date(examDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} — ubah di Pengaturan
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard icon={Target} label="Soal Dikerjakan" value={stats?.totalDikerjakan ?? 0} delay={0} />
        <StatCard icon={CircleCheck} label="Akurasi Keseluruhan" value={`${stats?.akurasiKeseluruhan ?? 0}%`} delay={0.05} />
        <StatCard icon={Trophy} label="Skor TO Terbaik" value={stats?.skorTryoutTerbaik ?? '-'} delay={0.1} />
        <StatCard icon={Repeat} label="Streak Belajar" value={`${stats?.streak ?? 0} hari`} delay={0.15} />
      </section>

      <section className="grid xl:grid-cols-5 gap-4">
        <div className="card xl:col-span-2 p-5">
          <h3 className="font-semibold mb-3 text-sm">Akurasi per Kompetensi</h3>
          {stats && stats.totalDikerjakan > 0 ? (
            <RadarKompetensi data={stats.perKompetensi} />
          ) : (
            <p className="text-sm text-(--text-muted) py-10 text-center">Belum ada data — mulai latihan dulu.</p>
          )}
        </div>
        <div className="card xl:col-span-3 p-5">
          <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-prio-red/10 text-prio-red flex items-center justify-center">
              <Flame size={14} />
            </span>
            Topik Terlemah
          </h3>
          {stats && stats.topikTerlemah.length > 0 ? (
            <div className="space-y-2">
              {stats.topikTerlemah.map((t) => (
                <div key={t.topik} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-(--bg-surface-2) hover:bg-(--bg-surface-2)/70 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.topik}</p>
                    <p className="text-xs text-(--text-muted)">{t.akurasi}% benar dari {t.total} soal</p>
                  </div>
                  <Link
                    to={`/latihan?topik=${encodeURIComponent(t.topik)}`}
                    className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-navy-800 to-navy-600 text-white hover:brightness-110 transition-[filter]"
                  >
                    Latih sekarang
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-(--text-muted) py-10 text-center">Kerjakan lebih banyak soal untuk melihat topik terlemah.</p>
          )}
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-semibold mb-3 text-sm">Rencana Belajar 2 Hari</h3>
        <div className="grid sm:grid-cols-2 gap-4 lg:gap-8">
          {[1, 2].map((day) => (
            <div key={day}>
              <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted) mb-2">
                Hari {day}
              </p>
              <div className="space-y-1.5">
                {(checklist ?? []).filter((c) => c.day === day).map((item) => (
                  <label key={item.id} className="flex items-center gap-2.5 text-sm cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 rounded accent-navy-700"
                    />
                    <span className={item.done ? 'line-through text-(--text-muted)' : ''}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/fokus-merah" className="btn-primary bg-none bg-prio-red hover:brightness-110">
          <Flame size={16} /> Mulai Fokus Merah <ArrowRight size={14} />
        </Link>
        <Link to="/tryout" className="btn-primary">
          Lihat Tryout <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, delay = 0 }: { icon: typeof Target; label: string; value: string | number; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="card card-hover p-4 lg:p-5"
    >
      <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center mb-3">
        <Icon size={17} />
      </div>
      <p className="text-xl lg:text-2xl font-bold">{value}</p>
      <p className="text-xs text-(--text-muted) mt-0.5">{label}</p>
    </motion.div>
  )
}
