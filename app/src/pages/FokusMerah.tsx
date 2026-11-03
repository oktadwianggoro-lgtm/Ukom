import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { useQuestions } from '../data/hooks'
import { useQuestionHistory } from '../lib/history'
import { usePendingSession } from '../store/session'

export default function FokusMerah() {
  const { questions, loading } = useQuestions()
  const history = useQuestionHistory(questions)
  const setPending = usePendingSession((s) => s.setPending)
  const navigate = useNavigate()

  const merah = useMemo(
    () => questions.filter((q) => q.prioritas >= 2).sort((a, b) => b.prioritas - a.prioritas),
    [questions],
  )
  const dikuasai = merah.filter((q) => history.get(q.id)?.everCorrect).length
  const pct = merah.length > 0 ? Math.round((dikuasai / merah.length) * 100) : 0
  const belum = merah.filter((q) => !history.get(q.id)?.everCorrect)

  function mulai(onlyRemaining: boolean) {
    const pool = onlyRemaining && belum.length > 0 ? belum : merah
    setPending(pool.map((q) => q.id), 'fokus_merah', 'Fokus Merah')
    navigate('/latihan/sesi')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-prio-red-bg flex items-center justify-center">
          <Flame size={28} className="text-prio-red" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Fokus Merah</h1>
        <p className="text-sm text-(--text-muted)">
          Seluruh soal dari materi yang ditandai/dikotak merah di slide (prioritas tertinggi untuk ujian).
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-(--text-muted)">Memuat...</p>
      ) : merah.length === 0 ? (
        <p className="text-center text-sm text-(--text-muted)">Belum ada soal prioritas merah yang digenerate.</p>
      ) : (
        <>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{dikuasai} / {merah.length} soal merah dikuasai</p>
              <p className="text-sm font-bold text-prio-red">{pct}%</p>
            </div>
            <div className="h-3 rounded-full bg-(--bg-surface-2) overflow-hidden">
              <div className="h-full bg-prio-red transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => mulai(true)}
              disabled={belum.length === 0}
              className="btn-primary bg-none bg-prio-red hover:brightness-110 flex-1"
            >
              Lanjutkan ({belum.length} belum dikuasai)
            </button>
            <button
              onClick={() => mulai(false)}
              className="btn-secondary flex-1"
            >
              Ulangi Semua ({merah.length} soal)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
