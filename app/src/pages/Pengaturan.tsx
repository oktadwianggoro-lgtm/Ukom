import { useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Download, RotateCcw, Upload } from 'lucide-react'
import { useSettings, applyFontSizeToDocument } from '../store/settings'
import { exportAllData, importAllData, resetAllProgress } from '../db'
import type { AppSettings } from '../types'

export default function Pengaturan() {
  const settings = useSettings()
  const [resetConfirm, setResetConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  async function handleExport() {
    const data = await exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ukom-pkn-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await importAllData(data)
      setMessage('Progres berhasil diimpor.')
    } catch {
      setMessage('Gagal mengimpor file — pastikan file JSON hasil ekspor dari aplikasi ini.')
    }
    e.target.value = ''
  }

  async function handleReset() {
    await resetAllProgress()
    setResetConfirm(false)
    setMessage('Semua progres telah direset.')
  }

  const messageIsError = message.startsWith('Gagal')

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Pengaturan</h1>

      {message && (
        <p
          className={`flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl ${
            messageIsError ? 'bg-prio-red-bg text-prio-red' : 'bg-ok-green-bg text-ok-green'
          }`}
        >
          {messageIsError ? <AlertTriangle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
          {message}
        </p>
      )}

      <div className="card p-5 space-y-4">
        <Field label="Target Skor Kelulusan">
          <input
            type="number"
            min={0}
            max={100}
            value={settings.targetScore}
            onChange={(e) => settings.setTargetScore(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-(--border-subtle) bg-(--bg-app) text-sm"
          />
        </Field>
        <Field label="Tanggal & Waktu Ujian">
          <input
            type="datetime-local"
            value={settings.examDate}
            onChange={(e) => settings.setExamDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-(--border-subtle) bg-(--bg-app) text-sm"
          />
        </Field>
        <Field label="Ukuran Font Soal">
          <div className="flex gap-2">
            {(['sm', 'md', 'lg'] as AppSettings['fontSize'][]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  settings.setFontSize(s)
                  applyFontSizeToDocument(s)
                }}
                className={`chip flex-1 justify-center ${settings.fontSize === s ? 'chip-active' : ''}`}
              >
                {s === 'sm' ? 'Kecil' : s === 'md' ? 'Sedang' : 'Besar'}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Tema">
          <div className="flex gap-2">
            {(['auto', 'light', 'dark'] as AppSettings['theme'][]).map((t) => (
              <button
                key={t}
                onClick={() => settings.setTheme(t)}
                className={`chip flex-1 justify-center capitalize ${settings.theme === t ? 'chip-active' : ''}`}
              >
                {t === 'auto' ? 'Otomatis' : t === 'light' ? 'Terang' : 'Gelap'}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Skema Penilaian">
          <div className="flex gap-2">
            <button
              onClick={() => settings.setScoring('plus1')}
              className={`chip flex-1 justify-center text-center ${settings.scoring === 'plus1' ? 'chip-active' : ''}`}
            >
              Benar +1, salah/kosong 0
            </button>
            <button
              onClick={() => settings.setScoring('plus4min1')}
              className={`chip flex-1 justify-center text-center ${settings.scoring === 'plus4min1' ? 'chip-active' : ''}`}
            >
              Benar +4, salah -1
            </button>
          </div>
        </Field>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium">Acak urutan opsi jawaban</span>
          <input
            type="checkbox"
            checked={settings.randomizeOptions}
            onChange={(e) => settings.setRandomizeOptions(e.target.checked)}
            className="w-4 h-4 accent-navy-700"
          />
        </label>
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-sm">Data & Progres</h3>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary flex-1">
            <Download size={15} /> Ekspor
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary flex-1"
          >
            <Upload size={15} /> Impor
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
        </div>
        {!resetConfirm ? (
          <button
            onClick={() => setResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-prio-red border border-prio-red/30"
          >
            <RotateCcw size={15} /> Reset Semua Progres
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setResetConfirm(false)} className="btn-secondary flex-1">
              Batal
            </button>
            <button onClick={handleReset} className="flex-1 px-4 py-2.5 rounded-xl bg-prio-red text-white text-sm font-semibold">
              Ya, Reset
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-(--text-muted) block mb-1.5">{label}</label>
      {children}
    </div>
  )
}
