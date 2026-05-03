import { useState, useEffect, useRef } from 'react'

function pad(n) { return String(n).padStart(2, '0') }

function fmtMs(ms) {
  const h  = Math.floor(ms / 3_600_000)
  const m  = Math.floor((ms % 3_600_000) / 60_000)
  const s  = Math.floor((ms % 60_000) / 1_000)
  const cs = Math.floor((ms % 1_000) / 10)
  return `${h ? `${h}:` : ''}${pad(m)}:${pad(s)}.${pad(cs)}`
}

export default function Clock() {
  const [tab, setTab] = useState('clock')

  // Clock state
  const [now, setNow] = useState(new Date())

  // Stopwatch state
  const [running, setRunning]   = useState(false)
  const [elapsed, setElapsed]   = useState(0)
  const [laps, setLaps]         = useState([])
  const startedAt = useRef(null)
  const rafId     = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const tick = () => {
    setElapsed(Date.now() - startedAt.current)
    rafId.current = requestAnimationFrame(tick)
  }

  const startStop = () => {
    if (running) {
      cancelAnimationFrame(rafId.current)
      setRunning(false)
    } else {
      startedAt.current = Date.now() - elapsed
      rafId.current = requestAnimationFrame(tick)
      setRunning(true)
    }
  }

  const reset = () => {
    cancelAnimationFrame(rafId.current)
    setRunning(false)
    setElapsed(0)
    setLaps([])
  }

  const addLap = () => setLaps((prev) => [elapsed, ...prev])

  // Analog clock angles
  const h  = now.getHours() % 12
  const m  = now.getMinutes()
  const s  = now.getSeconds()
  const hDeg = (h / 12) * 360 + (m / 60) * 30
  const mDeg = (m / 60) * 360 + (s / 60) * 6
  const sDeg = (s / 60) * 360

  const arm = (deg, len, width, color) => {
    const rad = (deg - 90) * (Math.PI / 180)
    return (
      <line
        x1="100" y1="100"
        x2={100 + len * Math.cos(rad)}
        y2={100 + len * Math.sin(rad)}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    )
  }

  return (
    <div className="flex flex-col h-full text-white">
      {/* Tabs */}
      <div className="flex border-b border-white/8 flex-shrink-0">
        {['clock', 'stopwatch'].map((t) => (
          <button
            key={t}
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/45 hover:text-white/80'
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'clock' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-4">
          {/* Analog */}
          <svg viewBox="0 0 200 200" className="w-44 h-44">
            <circle cx="100" cy="100" r="96" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * 2 * Math.PI
              return (
                <line
                  key={i}
                  x1={100 + 82 * Math.cos(a)} y1={100 + 82 * Math.sin(a)}
                  x2={100 + 92 * Math.cos(a)} y2={100 + 92 * Math.sin(a)}
                  stroke="rgba(255,255,255,0.35)" strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
                />
              )
            })}
            {arm(hDeg, 52, 5,   'white')}
            {arm(mDeg, 70, 3,   'white')}
            {arm(sDeg, 76, 1.5, '#f87171')}
            <circle cx="100" cy="100" r="4" fill="white"/>
            <circle cx="100" cy="100" r="1.5" fill="#f87171"/>
          </svg>

          {/* Digital */}
          <div className="text-center">
            <div className="text-4xl font-light tabular-nums tracking-wide">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-white/45 text-sm mt-1.5">
              {now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="text-white/30 text-xs mt-1">
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
          </div>
        </div>
      )}

      {tab === 'stopwatch' && (
        <div className="flex-1 flex flex-col">
          {/* Timer display */}
          <div className="flex-1 flex items-center justify-center">
            <span className="text-5xl font-mono tabular-nums tracking-tight">{fmtMs(elapsed)}</span>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 pb-4">
            <button
              onClick={addLap}
              disabled={!running}
              className="w-20 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              Lap
            </button>
            <button
              onClick={startStop}
              className={`w-24 py-2.5 rounded-full text-sm font-semibold transition-all ${
                running ? 'bg-red-500/80 hover:bg-red-500' : 'bg-green-500/80 hover:bg-green-500'
              }`}
            >
              {running ? 'Stop' : elapsed > 0 ? 'Resume' : 'Start'}
            </button>
            <button
              onClick={reset}
              className="w-20 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              Reset
            </button>
          </div>

          {/* Laps */}
          {laps.length > 0 && (
            <div className="max-h-32 overflow-y-auto border-t border-white/8">
              {laps.map((t, i) => (
                <div key={i} className="flex justify-between px-4 py-1.5 border-b border-white/5 text-sm">
                  <span className="text-white/40">Lap {laps.length - i}</span>
                  <span className="font-mono">{fmtMs(t)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
