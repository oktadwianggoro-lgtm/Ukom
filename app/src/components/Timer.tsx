import { useEffect, useState } from 'react'
import { formatCountdown } from '../lib/scoring'

interface Props {
  deadlineAt: number
  onExpire: () => void
}

export default function Timer({ deadlineAt, onExpire }: Props) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = deadlineAt - now

  useEffect(() => {
    if (remaining <= 0) onExpire()
  }, [remaining, onExpire])

  const minutesLeft = remaining / 60000
  let colorClass = 'bg-gradient-to-r from-navy-800 to-navy-600 text-white shadow-pop'
  if (minutesLeft <= 5) colorClass = 'bg-prio-red text-white shadow-pop animate-pulse'
  else if (minutesLeft <= 10) colorClass = 'bg-gradient-to-r from-gold-400 to-warn-amber text-navy-950 shadow-pop'

  return (
    <div
      className={`sticky top-0 z-20 tabular-nums font-mono font-bold text-lg px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-colors duration-300 ${colorClass}`}
    >
      {formatCountdown(Math.max(0, remaining))}
    </div>
  )
}
