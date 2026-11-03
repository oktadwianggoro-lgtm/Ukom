import type { KompetensiTopik, Question, Tryout } from '../types'

interface Manifest {
  generatedAt: string
  questionFiles: string[]
  summaryFiles: { slug: string; title: string; kompetensi: string }[]
}

let manifestPromise: Promise<Manifest> | null = null
let questionsPromise: Promise<Question[]> | null = null
let topicsPromise: Promise<KompetensiTopik[]> | null = null
let tryoutsPromise: Promise<Tryout[]> | null = null

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url)
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

export function loadManifest(): Promise<Manifest> {
  if (!manifestPromise) {
    manifestPromise = fetchJson<Manifest>('/data/manifest.json', {
      generatedAt: '',
      questionFiles: [],
      summaryFiles: [],
    })
  }
  return manifestPromise
}

export function loadAllQuestions(): Promise<Question[]> {
  if (!questionsPromise) {
    questionsPromise = (async () => {
      const manifest = await loadManifest()
      const chunks = await Promise.all(
        manifest.questionFiles.map((f) => fetchJson<Question[]>(`/data/questions/${f}`, [])),
      )
      const all = chunks.flat()
      const seen = new Set<string>()
      const deduped: Question[] = []
      for (const q of all) {
        if (seen.has(q.id)) continue
        seen.add(q.id)
        deduped.push(q)
      }
      return deduped
    })()
  }
  return questionsPromise
}

export function loadTopics(): Promise<KompetensiTopik[]> {
  if (!topicsPromise) {
    topicsPromise = fetchJson<KompetensiTopik[]>('/data/topics.json', [])
  }
  return topicsPromise
}

export function loadTryouts(): Promise<Tryout[]> {
  if (!tryoutsPromise) {
    tryoutsPromise = fetchJson<Tryout[]>('/data/tryouts.json', [])
  }
  return tryoutsPromise
}

export async function loadSummaryText(slug: string): Promise<string> {
  try {
    const res = await fetch(`/data/summaries/${slug}.md`)
    if (!res.ok) return ''
    return await res.text()
  } catch {
    return ''
  }
}

export function invalidateDataCache() {
  manifestPromise = null
  questionsPromise = null
  topicsPromise = null
  tryoutsPromise = null
}
