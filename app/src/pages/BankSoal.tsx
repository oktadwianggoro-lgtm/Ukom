import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Fuse from 'fuse.js'
import { Bookmark, BookmarkCheck, Search } from 'lucide-react'
import { useQuestions } from '../data/hooks'
import { useBookmarkSet, toggleBookmark } from '../lib/bookmarks'
import { KOMPETENSI_LIST, type OpsiKey, type Kompetensi } from '../types'
import OptionButton from '../components/OptionButton'

export default function BankSoal() {
  const { questions, loading } = useQuestions()
  const bookmarks = useBookmarkSet()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [kompetensi, setKompetensi] = useState<Kompetensi | 'semua'>('semua')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    const qid = params.get('q')
    if (qid) setExpanded(new Set([qid]))
  }, [params])

  const fuse = useMemo(
    () => new Fuse(questions, { keys: ['pertanyaan', 'topik', 'subtopik', 'tags', 'id'], threshold: 0.3 }),
    [questions],
  )

  const results = useMemo(() => {
    let base = query.trim() ? fuse.search(query).map((r) => r.item) : questions
    if (kompetensi !== 'semua') base = base.filter((q) => q.kompetensi === kompetensi)
    return base.slice(0, 100)
  }, [query, kompetensi, fuse, questions])

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Bank Soal & Cari</h1>
        <p className="text-sm text-(--text-muted) mt-1">{loading ? 'Memuat...' : `${questions.length} soal total`}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-(--border-subtle) bg-(--bg-surface) shadow-card focus-within:border-navy-400 transition-colors">
          <Search size={16} className="text-(--text-muted) shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pertanyaan, topik, atau tag..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <select
          value={kompetensi}
          onChange={(e) => setKompetensi(e.target.value as Kompetensi | 'semua')}
          className="px-4 py-3 rounded-2xl border border-(--border-subtle) bg-(--bg-surface) text-sm font-medium shadow-card"
        >
          <option value="semua">Semua Kompetensi</option>
          {KOMPETENSI_LIST.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2.5">
        {results.map((q) => {
          const isOpen = expanded.has(q.id)
          return (
            <div key={q.id} className="card card-hover p-4">
              <button onClick={() => toggleExpand(q.id)} className="w-full text-left flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-(--bg-surface-2) text-(--text-muted)">
                      {q.id}
                    </span>
                    {q.prioritas >= 2 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-prio-red-bg text-prio-red">Merah</span>
                    )}
                    <span className="text-[10px] text-(--text-muted)">{q.topik}</span>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{q.pertanyaan}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleBookmark(q.id)
                  }}
                  className="shrink-0 p-1.5"
                  aria-label="Tandai"
                >
                  {bookmarks.has(q.id) ? <BookmarkCheck size={16} className="text-gold-600" /> : <Bookmark size={16} className="text-(--text-muted)" />}
                </button>
              </button>

              {isOpen && (
                <div className="mt-3 pt-3 border-t border-(--border-subtle) space-y-2">
                  {(['A', 'B', 'C', 'D'] as OpsiKey[]).map((letter) => (
                    <OptionButton
                      key={letter}
                      letter={letter}
                      text={q.opsi[letter]}
                      selected={false}
                      onClick={() => {}}
                      disabled
                      state={letter === q.kunci ? 'correct' : 'default'}
                    />
                  ))}
                  <p className="text-sm pt-2">
                    <span className="font-semibold text-ok-green">Pembahasan: </span>
                    {q.pembahasan}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {q.sumber.map((s, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-(--bg-surface-2) text-(--text-muted)">
                        PDF {s.pdf} hlm {s.halaman}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {!loading && results.length === 0 && <p className="text-sm text-(--text-muted) text-center py-10">Tidak ada soal ditemukan.</p>}
      </div>
    </div>
  )
}
