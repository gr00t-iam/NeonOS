import { useState } from 'react'

const QUICKLINKS = [
  { name: 'Google',      url: 'https://www.google.com',           icon: '🔍' },
  { name: 'GitHub',      url: 'https://github.com',               icon: '🐙' },
  { name: 'Wikipedia',   url: 'https://en.wikipedia.org',         icon: '📖' },
  { name: 'MDN',         url: 'https://developer.mozilla.org',    icon: '📚' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com',     icon: '🗞️' },
  { name: 'Claude',      url: 'https://claude.ai',                icon: '✦' },
]

// Brave color scheme
const BRAVE_ORANGE = '#fb542b'
const BRAVE_PURPLE = '#3b3dc8'

export default function BrowserApp() {
  const [bar, setBar]         = useState('')
  const [loaded, setLoaded]   = useState('')
  const [blocked, setBlocked] = useState(false)
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const [shields, setShields] = useState(true)
  const [shieldsCount, setShieldsCount] = useState(0)

  const go = (target) => {
    let url = target.trim()
    if (!url) return
    if (!url.includes('.') || url.includes(' ')) {
      url = `https://search.brave.com/search?q=${encodeURIComponent(url)}`
    } else if (!url.startsWith('http')) {
      url = 'https://' + url
    }
    const next = [...history.slice(0, histIdx + 1), url]
    setHistory(next)
    setHistIdx(next.length - 1)
    setLoaded(url)
    setBar(url)
    setBlocked(false)
    setShieldsCount((c) => c + Math.floor(Math.random() * 5))
  }

  const navBack = () => { if (histIdx > 0) { const i = histIdx-1; setHistIdx(i); setLoaded(history[i]); setBar(history[i]); setBlocked(false) } }
  const navFwd  = () => { if (histIdx < history.length-1) { const i = histIdx+1; setHistIdx(i); setLoaded(history[i]); setBar(history[i]); setBlocked(false) } }

  const isSecure = loaded.startsWith('https://')

  return (
    <div className="flex flex-col h-full text-white" style={{ background: '#1e1f27' }}>
      {/* Brave toolbar */}
      <div className="flex items-center gap-1.5 px-2 py-2 flex-shrink-0"
        style={{ background: '#1e2029', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Nav buttons */}
        {[
          { icon: '◀', action: navBack, disabled: histIdx <= 0 },
          { icon: '▶', action: navFwd,  disabled: histIdx >= history.length-1 },
          { icon: '↻', action: () => loaded && go(loaded), disabled: false },
        ].map(({ icon, action, disabled }) => (
          <button key={icon} onClick={action} disabled={disabled}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors disabled:opacity-25 hover:bg-white/10">
            {icon}
          </button>
        ))}

        {/* URL bar */}
        <div className="flex-1 flex items-center rounded-xl px-3 py-1.5 gap-2"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {loaded ? (
            <span className={`text-xs flex-shrink-0 ${isSecure ? 'text-green-400' : 'text-yellow-400'}`}>
              {isSecure ? '🔒' : '⚠️'}
            </span>
          ) : (
            <span className="text-white/30 text-xs flex-shrink-0">🦁</span>
          )}
          <input
            className="flex-1 bg-transparent text-sm text-white/90 outline-none placeholder-white/30 min-w-0"
            placeholder="Search with Brave or enter address"
            value={bar}
            onChange={(e) => setBar(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && go(bar)}
            onFocus={(e) => e.target.select()}
          />
        </div>

        {/* Brave Shields button */}
        <button
          onClick={() => setShields((s) => !s)}
          title={`Brave Shields ${shields ? 'on' : 'off'}`}
          className={`flex items-center gap-1 px-2 h-7 rounded-lg text-xs font-bold transition-colors ${
            shields ? 'text-orange-400 hover:bg-orange-500/15' : 'text-white/30 hover:bg-white/10'
          }`}
          style={{ border: `1px solid ${shields ? 'rgba(251,84,43,0.4)' : 'rgba(255,255,255,0.1)'}` }}
        >
          🦁 {shieldsCount > 0 && shields && <span className="text-orange-400">{shieldsCount}</span>}
        </button>

        <button
          onClick={() => go(bar)}
          className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
          style={{ background: BRAVE_ORANGE }}
        >
          Go
        </button>
      </div>

      {/* Tab bar */}
      {loaded && (
        <div className="flex items-center px-2 py-1 gap-1 flex-shrink-0"
          style={{ background: '#191a22', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 px-3 py-1 rounded-t-lg text-xs text-white/80 max-w-[200px]"
            style={{ background: '#1e2029' }}>
            {isSecure ? '🔒' : '⚠️'}
            <span className="truncate">{new URL(loaded).hostname}</span>
            <button onClick={() => { setLoaded(''); setBar('') }} className="text-white/40 hover:text-white ml-1">×</button>
          </div>
          <button className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:bg-white/10 text-lg">+</button>
        </div>
      )}

      {/* Viewport */}
      {!loaded ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8"
          style={{ background: 'linear-gradient(135deg, #1a1b2e 0%, #16213e 100%)' }}>
          <div className="text-center mb-2">
            <div className="text-6xl mb-3">🦁</div>
            <h1 className="text-2xl font-bold text-white mb-1">Brave Browser</h1>
            <p className="text-white/40 text-sm">Browse faster. Browse safer. Browse smarter.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {QUICKLINKS.map((q) => (
              <button key={q.name} onClick={() => go(q.url)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/10 transition-all group"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="text-3xl group-hover:scale-110 transition-transform">{q.icon}</span>
                <span className="text-xs text-white/55 font-medium">{q.name}</span>
              </button>
            ))}
          </div>
          <p className="text-white/20 text-xs">Note: Some sites block embedding (X-Frame-Options). Use "Open in new tab" if blocked.</p>
        </div>
      ) : blocked ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8"
          style={{ background: '#191a22' }}>
          <div className="text-5xl mb-4">🦁</div>
          <h3 className="text-white/80 font-semibold text-lg mb-2">Brave Shields Blocked This Page</h3>
          <p className="text-white/35 text-sm mb-1">This site uses X-Frame-Options to prevent embedding.</p>
          <button onClick={() => window.open(loaded, '_blank')}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: BRAVE_ORANGE }}>
            Open in New Tab ↗
          </button>
        </div>
      ) : (
        <iframe key={loaded} src={loaded} className="flex-1 w-full border-0" title="Brave Browser"
          onError={() => setBlocked(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock" />
      )}
    </div>
  )
}
