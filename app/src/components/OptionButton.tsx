import type { OpsiKey } from '../types'

interface Props {
  letter: OpsiKey
  text: string
  selected: boolean
  onClick: () => void
  state?: 'default' | 'correct' | 'incorrect' | 'reveal-correct'
  disabled?: boolean
}

export default function OptionButton({ letter, text, selected, onClick, state = 'default', disabled }: Props) {
  let classes =
    'w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 min-h-12 text-[15px] leading-snug'

  if (state === 'correct') {
    classes += ' border-ok-green bg-ok-green-bg text-navy-900 shadow-sm ring-1 ring-ok-green/20'
  } else if (state === 'incorrect') {
    classes += ' border-prio-red bg-prio-red-bg text-navy-900 shadow-sm ring-1 ring-prio-red/20'
  } else if (state === 'reveal-correct') {
    classes += ' border-ok-green/60 bg-ok-green-bg/50'
  } else if (selected) {
    classes += ' border-navy-600 bg-navy-50 dark:bg-navy-900/40 dark:border-navy-300 shadow-sm ring-1 ring-navy-600/15'
  } else {
    classes += ' border-(--border-subtle) hover:border-navy-400 hover:bg-(--bg-surface-2)'
  }

  let badgeClasses =
    'shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors'
  if (state === 'correct') {
    badgeClasses += ' border-ok-green text-ok-green'
  } else if (state === 'incorrect') {
    badgeClasses += ' border-prio-red text-prio-red'
  } else if (state === 'reveal-correct') {
    badgeClasses += ' border-ok-green/60 text-ok-green/80'
  } else if (selected) {
    badgeClasses += ' border-navy-600 text-navy-600 dark:border-navy-300 dark:text-navy-200'
  } else {
    badgeClasses += ' border-(--border-subtle) text-(--text-muted)'
  }

  return (
    <button onClick={onClick} disabled={disabled} className={classes}>
      <span className={badgeClasses}>{letter}</span>
      <span className="pt-0.5">{text}</span>
    </button>
  )
}
