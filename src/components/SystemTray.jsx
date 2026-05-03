import { useState, useEffect } from 'react'

export default function SystemTray() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="flex flex-col items-end leading-tight select-none">
      <span className="text-white/90 text-sm font-semibold tabular-nums">{timeStr}</span>
      <span className="text-white/50 text-xs">{dateStr}</span>
    </div>
  )
}
