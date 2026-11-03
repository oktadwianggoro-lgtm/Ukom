import Dexie, { type EntityTable } from 'dexie'
import type { Attempt, Bookmark, FlashcardState, PlanChecklistItem } from './types'

const db = new Dexie('ukom-pkn-2026') as Dexie & {
  attempts: EntityTable<Attempt, 'id'>
  bookmarks: EntityTable<Bookmark, 'id'>
  flashcards: EntityTable<FlashcardState, 'id'>
  planChecklist: EntityTable<PlanChecklistItem, 'id'>
}

db.version(1).stores({
  attempts: '++id, mode, tryoutId, status, startedAt',
  bookmarks: '++id, &questionId, createdAt',
  flashcards: '++id, &questionId, dueAt',
  planChecklist: '++id, day',
})

export { db }

export async function exportAllData() {
  const [attempts, bookmarks, flashcards, planChecklist] = await Promise.all([
    db.attempts.toArray(),
    db.bookmarks.toArray(),
    db.flashcards.toArray(),
    db.planChecklist.toArray(),
  ])
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    attempts,
    bookmarks,
    flashcards,
    planChecklist,
  }
}

export async function importAllData(payload: {
  attempts?: Attempt[]
  bookmarks?: Bookmark[]
  flashcards?: FlashcardState[]
  planChecklist?: PlanChecklistItem[]
}) {
  await db.transaction('rw', db.attempts, db.bookmarks, db.flashcards, db.planChecklist, async () => {
    if (payload.attempts) {
      await db.attempts.clear()
      await db.attempts.bulkAdd(payload.attempts.map(({ id: _id, ...rest }) => rest))
    }
    if (payload.bookmarks) {
      await db.bookmarks.clear()
      await db.bookmarks.bulkAdd(payload.bookmarks.map(({ id: _id, ...rest }) => rest))
    }
    if (payload.flashcards) {
      await db.flashcards.clear()
      await db.flashcards.bulkAdd(payload.flashcards.map(({ id: _id, ...rest }) => rest))
    }
    if (payload.planChecklist) {
      await db.planChecklist.clear()
      await db.planChecklist.bulkAdd(payload.planChecklist.map(({ id: _id, ...rest }) => rest))
    }
  })
}

export async function resetAllProgress() {
  await db.transaction('rw', db.attempts, db.bookmarks, db.flashcards, db.planChecklist, async () => {
    await db.attempts.clear()
    await db.bookmarks.clear()
    await db.flashcards.clear()
    await db.planChecklist.clear()
  })
}
