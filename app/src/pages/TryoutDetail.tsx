import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, FileQuestion, PlayCircle } from 'lucide-react'
import { useTryouts } from '../data/hooks'
import { getActiveTryoutAttempt } from '../lib/attempts'

export default function TryoutDetail() {
  const { id } = useParams()
  const { tryouts, loading } = useTryouts()
  const navigate = useNavigate()
  const [hasActive, setHasActive] = useState(false)

  const tryout = tryouts.find((t) => t.id === id)

  useEffect(() => {
    if (!id) return
    getActiveTryoutAttempt(id).then((a) => setHasActive(!!a))
  }, [id])

  if (loading) return <p className="text-sm text-(--text-muted)">Memuat...</p>
  if (!tryout) return <p className="text-sm text-(--text-muted)">Tryout tidak ditemukan.</p>

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <Link to="/tryout" className="inline-flex items-center gap-1.5 text-sm text-(--text-muted)">
        <ArrowLeft size={15} /> Kembali
      </Link>
      <div className="card p-6 space-y-4">
        <h1 className="text-xl font-bold">{tryout.nama}</h1>
        {tryout.deskripsi && <p className="text-sm text-(--text-muted)">{tryout.deskripsi}</p>}
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1.5"><Clock size={15} /> {tryout.durasi_menit} menit</span>
          <span className="flex items-center gap-1.5"><FileQuestion size={15} /> {tryout.soal_ids.length} soal</span>
        </div>
        <ul className="text-sm text-(--text-muted) list-disc pl-5 space-y-1">
          <li>Timer berjalan sejak ujian dimulai, otomatis submit saat waktu habis.</li>
          <li>Jawaban tersimpan otomatis — aman jika refresh/tutup tab, sisa waktu tetap akurat.</li>
          <li>Pembahasan & kunci baru muncul setelah ujian diselesaikan.</li>
          <li>Pintasan: A/B/C/D atau 1-4 pilih jawaban, ←/→ navigasi, R ragu-ragu, G buka grid nomor.</li>
        </ul>
        <button
          onClick={() => navigate(`/tryout/${tryout.id}/ujian`)}
          className="btn-primary w-full"
        >
          <PlayCircle size={17} /> {hasActive ? 'Lanjutkan Ujian' : 'Mulai Ujian'}
        </button>
      </div>
    </div>
  )
}
