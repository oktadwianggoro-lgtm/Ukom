import type { FlashcardState } from '../types'

export type SrsGrade = 'lagi' | 'sulit' | 'baik' | 'mudah'

const GRADE_QUALITY: Record<SrsGrade, number> = { lagi: 0, sulit: 3, baik: 4, mudah: 5 }

/** SM-2 sederhana. */
export function applySrsGrade(
  card: Pick<FlashcardState, 'repetitions' | 'easeFactor' | 'intervalDays'>,
  grade: SrsGrade,
): { repetitions: number; easeFactor: number; intervalDays: number } {
  const q = GRADE_QUALITY[grade]
  let { repetitions, easeFactor, intervalDays } = card

  if (q < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    repetitions += 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 6
    else intervalDays = Math.round(intervalDays * easeFactor)
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))

  return { repetitions, easeFactor, intervalDays }
}

export function newFlashcardState(questionId: string): Omit<FlashcardState, 'id'> {
  return {
    questionId,
    repetitions: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    dueAt: Date.now(),
    updatedAt: Date.now(),
  }
}
