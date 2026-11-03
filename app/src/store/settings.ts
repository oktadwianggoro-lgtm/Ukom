import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '../types'

interface SettingsStore extends AppSettings {
  setTargetScore: (v: number) => void
  setExamDate: (v: string) => void
  setFontSize: (v: AppSettings['fontSize']) => void
  setTheme: (v: AppSettings['theme']) => void
  setRandomizeOptions: (v: boolean) => void
  setScoring: (v: AppSettings['scoring']) => void
}

const DEFAULT_SETTINGS: AppSettings = {
  targetScore: 70,
  examDate: '2026-11-04T07:30:00',
  fontSize: 'md',
  theme: 'auto',
  randomizeOptions: true,
  scoring: 'plus1',
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTargetScore: (v) => set({ targetScore: v }),
      setExamDate: (v) => set({ examDate: v }),
      setFontSize: (v) => set({ fontSize: v }),
      setTheme: (v) => set({ theme: v }),
      setRandomizeOptions: (v) => set({ randomizeOptions: v }),
      setScoring: (v) => set({ scoring: v }),
    }),
    { name: 'ukom-settings' },
  ),
)

export function applyThemeToDocument(theme: AppSettings['theme']) {
  const root = document.documentElement
  if (theme === 'light') root.setAttribute('data-theme', 'light')
  else if (theme === 'dark') root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')
}

export function applyFontSizeToDocument(size: AppSettings['fontSize']) {
  const map: Record<AppSettings['fontSize'], string> = { sm: '15px', md: '17px', lg: '19px' }
  document.documentElement.style.setProperty('--question-font-size', map[size])
}
