import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function useBookmarkSet(): Set<string> {
  const rows = useLiveQuery(() => db.bookmarks.toArray(), [])
  return new Set((rows ?? []).map((r) => r.questionId))
}

export async function toggleBookmark(questionId: string) {
  const existing = await db.bookmarks.where({ questionId }).first()
  if (existing?.id !== undefined) {
    await db.bookmarks.delete(existing.id)
  } else {
    await db.bookmarks.add({ questionId, createdAt: Date.now() })
  }
}
