import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  PencilLine,
  Flame,
  Timer as TimerIcon,
  Layers,
  Search,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Command,
} from 'lucide-react'
import { useSettings, applyThemeToDocument } from '../store/settings'
import CommandPalette from './CommandPalette'

const NAV_ITEMS = [
  { to: '/', label: 'Beranda', icon: LayoutDashboard, end: true },
  { to: '/materi', label: 'Materi Kilat', icon: BookOpen },
  { to: '/latihan', label: 'Latihan', icon: PencilLine },
  { to: '/fokus-merah', label: 'Fokus Merah', icon: Flame },
  { to: '/tryout', label: 'Tryout', icon: TimerIcon },
  { to: '/flashcard', label: 'Flashcard', icon: Layers },
  { to: '/bank-soal', label: 'Bank Soal', icon: Search },
  { to: '/statistik', label: 'Statistik', icon: BarChart3 },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings },
]

const BOTTOM_NAV = NAV_ITEMS.filter((i) =>
  ['/', '/latihan', '/fokus-merah', '/tryout', '/statistik'].includes(i.to),
)

export default function Layout() {
  const theme = useSettings((s) => s.theme)
  const setTheme = useSettings((s) => s.setTheme)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="min-h-svh flex flex-col lg:flex-row text-(--text-primary)">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-(--border-subtle) bg-(--bg-surface)/60 backdrop-blur-xl p-4 gap-1 sticky top-0 h-svh">
        <div className="flex items-center gap-2.5 px-2 py-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-800 to-navy-600 border border-gold-400/50 flex items-center justify-center text-gold-300 font-bold text-xs shadow-pop shrink-0">
            PKN
          </div>
          <div>
            <p className="font-semibold leading-tight text-sm">UKOM JF PKN</p>
            <p className="text-xs text-(--text-muted)">2026</p>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-navy-800 to-navy-600 text-white shadow-pop'
                    : 'text-(--text-muted) hover:bg-(--bg-surface-2) hover:text-(--text-primary)'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-gold-400" />
                  )}
                  <item.icon size={18} className={isActive ? 'text-gold-300' : ''} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-(--border-subtle) text-xs text-(--text-muted) hover:bg-(--bg-surface-2) hover:text-(--text-primary) transition-colors"
          >
            <Command size={14} /> Cari <span className="ml-auto">Ctrl K</span>
          </button>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-(--border-subtle) hover:bg-(--bg-surface-2) transition-colors"
            aria-label="Ganti tema"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-(--border-subtle) backdrop-blur-md bg-(--bg-surface)/80 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-800 to-navy-600 border border-gold-400/50 flex items-center justify-center text-gold-300 font-bold text-[10px] shadow-pop">
            PKN
          </div>
          <span className="font-semibold text-sm">UKOM JF PKN 2026</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPaletteOpen(true)} className="p-2 rounded-lg hover:bg-(--bg-surface-2)" aria-label="Cari">
            <Search size={18} />
          </button>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-(--bg-surface-2)"
            aria-label="Ganti tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <div className="max-w-[1680px] mx-auto px-4 py-5 sm:px-6 lg:px-10 lg:py-8 2xl:px-16">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-(--bg-surface)/90 backdrop-blur-md border-t border-(--border-subtle) flex items-stretch">
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium min-h-12 transition-colors ${
                isActive ? 'text-navy-600 dark:text-gold-400' : 'text-(--text-muted)'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-1 h-1 w-1 rounded-full bg-gold-500 dark:bg-gold-400" />
                )}
                <item.icon size={19} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={navigate} />
    </div>
  )
}
