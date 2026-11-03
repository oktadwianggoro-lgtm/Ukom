import { create } from 'zustand'

interface PendingSession {
  questionIds: string[]
  mode: 'belajar' | 'kuis_cepat' | 'fokus_merah'
  label: string
  setPending: (questionIds: string[], mode: PendingSession['mode'], label: string) => void
  clear: () => void
}

export const usePendingSession = create<PendingSession>((set) => ({
  questionIds: [],
  mode: 'belajar',
  label: '',
  setPending: (questionIds, mode, label) => set({ questionIds, mode, label }),
  clear: () => set({ questionIds: [], mode: 'belajar', label: '' }),
}))
