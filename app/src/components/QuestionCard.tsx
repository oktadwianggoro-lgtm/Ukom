import { Flag, FileText } from 'lucide-react'
import type { OpsiKey, Question } from '../types'
import OptionButton from './OptionButton'

interface Props {
  question: Question
  index: number
  total: number
  selected: OpsiKey | null
  optionOrder: OpsiKey[]
  onSelect: (letter: OpsiKey) => void
  flagged?: boolean
  onToggleFlag?: () => void
  showAnswer?: boolean
  showSource?: boolean
}

const KESULITAN_LABEL: Record<string, string> = { mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit' }

export default function QuestionCard({
  question,
  index,
  total,
  selected,
  optionOrder,
  onSelect,
  flagged,
  onToggleFlag,
  showAnswer,
  showSource,
}: Props) {
  return (
    <div className="card p-5 lg:p-7">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full text-white bg-gradient-to-r from-navy-800 to-navy-600 shadow-pop">
            Soal {index + 1}/{total}
          </span>
          {question.prioritas >= 2 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-prio-red/10 text-prio-red">
              Prioritas Merah
            </span>
          )}
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-(--bg-surface-2) text-(--text-muted)">
            {KESULITAN_LABEL[question.kesulitan]}
          </span>
        </div>
        {onToggleFlag && (
          <button
            onClick={onToggleFlag}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-colors ${
              flagged
                ? 'border-warn-amber bg-warn-amber/15 text-amber-700 dark:text-amber-300'
                : 'border-(--border-subtle) text-(--text-muted) hover:bg-(--bg-surface-2)'
            }`}
          >
            <Flag size={13} /> Ragu-ragu
          </button>
        )}
      </div>

      <p
        className="font-medium text-(--text-primary) mb-5 whitespace-pre-line"
        style={{ fontSize: 'var(--question-font-size, 17px)', lineHeight: 1.6 }}
      >
        {question.pertanyaan}
      </p>

      <div className="flex flex-col gap-2.5">
        {optionOrder.map((letter) => {
          let state: 'default' | 'correct' | 'incorrect' | 'reveal-correct' = 'default'
          if (showAnswer) {
            if (letter === question.kunci) state = 'correct'
            else if (letter === selected) state = 'incorrect'
          }
          return (
            <OptionButton
              key={letter}
              letter={letter}
              text={question.opsi[letter]}
              selected={selected === letter}
              onClick={() => !showAnswer && onSelect(letter)}
              state={state}
              disabled={showAnswer}
            />
          )
        })}
      </div>

      {showAnswer && (
        <div className="mt-5 pt-5 border-t border-(--border-subtle) space-y-3">
          <p className="text-sm">
            <span className="font-semibold text-ok-green">Pembahasan: </span>
            {question.pembahasan}
          </p>
          {showSource !== false && question.sumber.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {question.sumber.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-(--bg-surface-2) text-(--text-muted)"
                  title={s.kutipan}
                >
                  <FileText size={12} /> PDF {s.pdf} hlm {s.halaman}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {question.tags?.map((t) => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 dark:bg-gold-700/20 dark:text-gold-300">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
