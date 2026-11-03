import { useEffect, useState } from 'react'
import { loadAllQuestions, loadTopics, loadTryouts } from './loader'
import type { KompetensiTopik, Question, Tryout } from '../types'

export function useQuestions() {
  const [data, setData] = useState<Question[] | null>(null)
  useEffect(() => {
    let active = true
    loadAllQuestions().then((q) => {
      if (active) setData(q)
    })
    return () => {
      active = false
    }
  }, [])
  return { questions: data ?? [], loading: data === null }
}

export function useTopics() {
  const [data, setData] = useState<KompetensiTopik[] | null>(null)
  useEffect(() => {
    let active = true
    loadTopics().then((t) => {
      if (active) setData(t)
    })
    return () => {
      active = false
    }
  }, [])
  return { topics: data ?? [], loading: data === null }
}

export function useTryouts() {
  const [data, setData] = useState<Tryout[] | null>(null)
  useEffect(() => {
    let active = true
    loadTryouts().then((t) => {
      if (active) setData(t)
    })
    return () => {
      active = false
    }
  }, [])
  return { tryouts: data ?? [], loading: data === null }
}
