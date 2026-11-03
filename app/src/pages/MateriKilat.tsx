import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Fuse from 'fuse.js'
import { motion } from 'motion/react'
import { ChevronRight, ArrowLeft, PencilLine } from 'lucide-react'
import { useEffect } from 'react'
import { useTopics } from '../data/hooks'
import { loadManifest, loadSummaryText } from '../data/loader'
import { KOMPETENSI_LIST, type Kompetensi } from '../types'

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function MateriKilat() {
  const { slug } = useParams()
  if (slug) return <MateriDetail slug={slug} />
  return <MateriList />
}

function MateriList() {
  const { topics, loading } = useTopics()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Materi Kilat</h1>
        <p className="text-sm text-(--text-muted) mt-1">Ringkasan 1 layar per topik — definisi, angka & jangka waktu, dasar hukum.</p>
      </div>
      {loading && <p className="text-sm text-(--text-muted)">Memuat...</p>}
      {!loading && topics.length === 0 && (
        <p className="text-sm text-(--text-muted)">Peta materi belum tersedia. Jalankan Fase 2 terlebih dulu.</p>
      )}
      {KOMPETENSI_LIST.map((komp) => {
        const entry = topics.find((t) => t.kompetensi === komp)
        if (!entry || entry.topik.length === 0) return null
        return (
          <section key={komp}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted) mb-2">{komp}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {entry.topik.map((topik, i) => (
                <motion.div
                  key={topik.nama}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
                >
                  <Link
                    to={`/materi/${slugify(komp)}__${slugify(topik.nama)}`}
                    className="card card-hover flex items-center justify-between gap-2 p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{topik.nama}</p>
                      <p className="text-xs text-(--text-muted)">
                        {topik.subtopik.length} subtopik ·{' '}
                        {topik.subtopik.some((s) => s.priority >= 2) ? 'ada prioritas merah' : 'materi umum'}
                      </p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-(--text-muted)" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

const KOMP_PREFIX: Record<Kompetensi, string> = {
  'Advokasi Kebijakan Perpajakan': 'adv',
  'Analisis Kepatuhan Wajib Pajak': 'kep',
  'Analisis Potensi Pajak': 'pot',
  'Ekstensifikasi Perpajakan': 'eks',
  'Pemeriksaan Pajak': 'pmr',
  'Profiling Wajib Pajak': 'prf',
}

function MateriDetail({ slug }: { slug: string }) {
  const { topics } = useTopics()
  const [komSlug, topikSlug] = slug.split('__')
  const komp = KOMPETENSI_LIST.find((k) => slugify(k) === komSlug)
  const entry = topics.find((t) => t.kompetensi === komp)
  const topik = entry?.topik.find((t) => slugify(t.nama) === topikSlug)
  const [md, setMd] = useState<string>('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!komp || !topik) return
    setMd('')
    setNotFound(false)
    const prefix = KOMP_PREFIX[komp]
    loadManifest().then(async (manifest) => {
      const candidates = manifest.summaryFiles.filter((s) => s.slug.startsWith(`${prefix}_`))
      if (candidates.length === 0) {
        setNotFound(true)
        return
      }
      const fuse = new Fuse(candidates, { keys: ['title', 'slug'], threshold: 0.4 })
      const matches = fuse.search(topik.nama)
      const best = matches[0]?.item ?? candidates[0]
      const text = await loadSummaryText(best.slug)
      if (text) setMd(text)
      else setNotFound(true)
    })
  }, [komp, topik])

  return (
    <div className="max-w-3xl space-y-4">
      <Link to="/materi" className="inline-flex items-center gap-1.5 text-sm text-(--text-muted) hover:text-(--text-primary)">
        <ArrowLeft size={15} /> Kembali ke Materi Kilat
      </Link>
      {topik && (
        <>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-gold-700 dark:text-gold-400 font-semibold">{komp}</p>
              <h1 className="text-xl font-bold">{topik.nama}</h1>
            </div>
            <Link
              to={`/latihan?topik=${encodeURIComponent(topik.nama)}`}
              className="btn-primary"
            >
              <PencilLine size={14} /> Latih topik ini
            </Link>
          </div>
          <div className="card p-5 lg:p-7 prose-ukom">
            {md ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
            ) : notFound ? (
              <p className="text-sm text-(--text-muted)">Ringkasan untuk topik ini belum dibuat.</p>
            ) : (
              <p className="text-sm text-(--text-muted)">Memuat...</p>
            )}
          </div>
        </>
      )}
      {!topik && <p className="text-sm text-(--text-muted)">Topik tidak ditemukan.</p>}
    </div>
  )
}
