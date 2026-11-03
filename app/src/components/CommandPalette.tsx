import { useEffect, useMemo, useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'
import { useQuestions } from '../data/hooks'
import { useTryouts } from '../data/hooks'

interface Props {
  open: boolean
  onClose: () => void
  onNavigate: NavigateFunction
}

const STATIC_ITEMS = [
  { label: 'Beranda', to: '/' },
  { label: 'Materi Kilat', to: '/materi' },
  { label: 'Latihan', to: '/latihan' },
  { label: 'Fokus Merah', to: '/fokus-merah' },
  { label: 'Daftar Tryout', to: '/tryout' },
  { label: 'Flashcard', to: '/flashcard' },
  { label: 'Bank Soal & Cari', to: '/bank-soal' },
  { label: 'Statistik', to: '/statistik' },
  { label: 'Pengaturan', to: '/pengaturan' },
]

export default function CommandPalette({ open, onClose, onNavigate }: Props) {
  const [query, setQuery] = useState('')
  const { questions } = useQuestions()
  const { tryouts } = useTryouts()

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const fuse = useMemo(
    () => new Fuse(questions, { keys: ['pertanyaan', 'topik', 'subtopik', 'tags'], threshold: 0.35 }),
    [questions],
  )

  const tryoutItems = tryouts.map((t) => ({ label: `Tryout: ${t.nama}`, to: `/tryout/${t.id}` }))
  const navMatches = [...STATIC_ITEMS, ...tryoutItems].filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase()),
  )
  const questionMatches = query.trim().length > 1 ? fuse.search(query).slice(0, 8) : []

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-(--bg-surface) rounded-2xl shadow-card-hover border border-(--border-subtle) overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-(--border-subtle)">
          <Search size={18} className="text-(--text-muted) shrink-0" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Lompat ke halaman, tryout, atau cari soal..."
            className="flex-1 bg-transparent outline-none text-sm py-1 placeholder:text-(--text-muted)"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded-md border border-(--border-subtle) bg-(--bg-surface-2) text-(--text-muted)">
            Esc
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {navMatches.length > 0 && (
            <div className="px-2 pb-1">
              <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-(--text-muted)">Navigasi</p>
              {navMatches.map((item) => (
                <button
                  key={item.to}
                  onClick={() => {
                    onNavigate(item.to)
                    onClose()
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-navy-50 dark:hover:bg-navy-900/40"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
          {questionMatches.length > 0 && (
            <div className="px-2 pt-1 border-t border-(--border-subtle)">
              <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-(--text-muted)">Soal</p>
              {questionMatches.map((m) => (
                <button
                  key={m.item.id}
                  onClick={() => {
                    onNavigate(`/bank-soal?q=${encodeURIComponent(m.item.id)}`)
                    onClose()
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-navy-50 dark:hover:bg-navy-900/40 line-clamp-2"
                >
                  {m.item.pertanyaan}
                </button>
              ))}
            </div>
          )}
          {navMatches.length === 0 && questionMatches.length === 0 && (
            <p className="px-4 py-6 text-sm text-center text-(--text-muted)">Tidak ada hasil.</p>
          )}
        </div>
      </div>
    </div>
  )
}
