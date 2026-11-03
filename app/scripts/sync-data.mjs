// Menyalin data/ (root proyek) -> app/public/data/ dan membangun manifest.json.
// Dijalankan otomatis sebelum `npm run dev` / `npm run build` (lihat package.json).
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const SRC = join(ROOT, 'data')
const DEST = join(__dirname, '..', 'public', 'data')

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

function main() {
  if (!existsSync(SRC)) {
    console.warn(`[sync-data] ${SRC} tidak ditemukan, lewati.`)
    return
  }
  if (existsSync(DEST)) rmSync(DEST, { recursive: true, force: true })
  copyDir(SRC, DEST)

  const questionsDir = join(DEST, 'questions')
  const questionFiles = existsSync(questionsDir)
    ? readdirSync(questionsDir).filter((f) => f.endsWith('.json')).sort()
    : []

  const summariesDir = join(DEST, 'summaries')
  const summaryFiles = []
  if (existsSync(summariesDir)) {
    for (const f of readdirSync(summariesDir)) {
      if (!f.endsWith('.md')) continue
      const slug = f.replace(/\.md$/, '')
      let title = slug
      try {
        const content = readFileSync(join(summariesDir, f), 'utf-8')
        const h1 = content.match(/^#\s+(.+)$/m)
        if (h1) title = h1[1].trim()
      } catch {
        // ignore
      }
      summaryFiles.push({ slug, title, kompetensi: '' })
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    questionFiles,
    summaryFiles,
  }
  writeFileSync(join(DEST, 'manifest.json'), JSON.stringify(manifest, null, 2))

  let totalQuestions = 0
  for (const f of questionFiles) {
    try {
      const arr = JSON.parse(readFileSync(join(questionsDir, f), 'utf-8'))
      if (Array.isArray(arr)) totalQuestions += arr.length
    } catch (e) {
      console.warn(`[sync-data] gagal parse ${f}:`, e.message)
    }
  }

  console.log(
    `[sync-data] disalin ke public/data/ — ${questionFiles.length} file soal (${totalQuestions} soal), ${summaryFiles.length} ringkasan.`,
  )
}

main()
