interface Props {
  total: number
  current: number
  getState: (index: number) => 'answered' | 'flagged' | 'empty' | 'current'
  onJump: (index: number) => void
}

export default function QuestionGrid({ total, current, getState, onJump }: Props) {
  return (
    <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const state = i === current ? 'current' : getState(i)
        let classes = 'aspect-square rounded-lg text-xs font-semibold flex items-center justify-center border-2 transition-colors'
        if (state === 'current') classes += ' border-transparent bg-gradient-to-br from-navy-800 to-navy-600 text-white shadow-sm dark:from-gold-400 dark:to-gold-500 dark:text-navy-950'
        else if (state === 'answered') classes += ' border-ok-green/40 bg-ok-green-bg text-navy-900'
        else if (state === 'flagged') classes += ' border-warn-amber bg-warn-amber/20 text-navy-900'
        else classes += ' border-(--border-subtle) text-(--text-muted) hover:border-navy-300 hover:bg-(--bg-surface-2)'
        return (
          <button key={i} onClick={() => onJump(i)} className={classes} aria-label={`Soal ${i + 1}`}>
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}
