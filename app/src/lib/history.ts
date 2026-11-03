import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Question } from '../types'

export interface QuestionHistory {
  attempted: boolean
  everCorrect: boolean
  everWrong: boolean
}

export function useQuestionHistory(questions: Question[]): Map<string, QuestionHistory> {
  const attempts = useLiveQuery(() => db.attempts.toArray(), [])
  const map = new Map<string, QuestionHistory>()
  if (!attempts || questions.length === 0) return map

  const kunciById = new Map(questions.map((q) => [q.id, q.kunci]))

  for (const attempt of attempts) {
    for (const [qid, ans] of Object.entries(attempt.answers)) {
      if (ans.selected === null) continue
      const kunci = kunciById.get(qid)
      if (!kunci) continue
      const prev = map.get(qid) ?? { attempted: false, everCorrect: false, everWrong: false }
      prev.attempted = true
      if (ans.selected === kunci) prev.everCorrect = true
      else prev.everWrong = true
      map.set(qid, prev)
    }
  }
  return map
}
