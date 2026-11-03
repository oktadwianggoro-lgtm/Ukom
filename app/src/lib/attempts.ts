import { db } from '../db'
import type { Attempt, AttemptMode, JawabanSoal, OpsiKey, Question } from '../types'

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildOptionOrder(questions: Question[], randomize: boolean): Record<string, OpsiKey[]> {
  const order: Record<string, OpsiKey[]> = {}
  for (const q of questions) {
    const base: OpsiKey[] = ['A', 'B', 'C', 'D']
    order[q.id] = randomize ? shuffle(base, hashSeed(q.id)) : base
  }
  return order
}

function hashSeed(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h || 1
}

export async function createAttempt(params: {
  mode: AttemptMode
  tryoutId?: string
  questionIds: string[]
  durationMs?: number
  optionOrder?: Record<string, OpsiKey[]>
}): Promise<number> {
  const now = Date.now()
  const answers: Record<string, JawabanSoal> = {}
  for (const qid of params.questionIds) {
    answers[qid] = { questionId: qid, selected: null, flagged: false, timeSpentMs: 0, answeredAt: null }
  }
  const attempt: Attempt = {
    mode: params.mode,
    tryoutId: params.tryoutId,
    questionIds: params.questionIds,
    optionOrder: params.optionOrder,
    answers,
    startedAt: now,
    deadlineAt: params.durationMs ? now + params.durationMs : undefined,
    status: 'in_progress',
  }
  return db.attempts.add(attempt) as Promise<number>
}

export async function getActiveTryoutAttempt(tryoutId: string): Promise<Attempt | undefined> {
  return db.attempts.where({ tryoutId, status: 'in_progress' }).first()
}

export async function saveAnswer(
  attemptId: number,
  questionId: string,
  patch: Partial<JawabanSoal>,
): Promise<void> {
  const attempt = await db.attempts.get(attemptId)
  if (!attempt) return
  const prev = attempt.answers[questionId] ?? {
    questionId,
    selected: null,
    flagged: false,
    timeSpentMs: 0,
    answeredAt: null,
  }
  attempt.answers[questionId] = { ...prev, ...patch }
  await db.attempts.put(attempt)
}

export async function finishAttempt(
  attemptId: number,
  status: 'submitted' | 'auto_submitted',
  scoreData: { score: number; benar: number; salah: number; kosong: number },
): Promise<void> {
  await db.attempts.update(attemptId, {
    status,
    finishedAt: Date.now(),
    ...scoreData,
  })
}
