import { useState, useEffect } from 'react'

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-white/5 gap-4">
      <span className="text-white/45 text-sm flex-shrink-0">{label}</span>
      <span className="text-white/85 text-sm font-mono text-right break-all">{value ?? 'N/A'}</span>
    </div>
  )
}

function Bar({ label, value, max, color = 'bg-blue-500' }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  const colorMap = { blue: 'bg-blue-500', green: 'bg-green-500', orange: 'bg-orange-500' }
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-white/50">{label}</span>
        <span className="text-white/80 font-mono">{value.toFixed(1)} MB</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorMap[color] ?? colorMap.blue}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right text-[11px] text-white/25 mt-0.5">{pct.toFixed(1)}% of {max.toFixed(0)} MB</div>
    </div>
  )
}

export default function SystemMonitor() {
  const [tab, setTab]   = useState('overview')
  const [mem, setMem]   = useState(null)
  const [fps, setFps]   = useState(0)
  const [conn, setConn] = useState(null)

  useEffect(() => {
    // FPS counter
    let frames = 0, last = performance.now(), rafId
    const countFps = (now) => {
      frames++
      if (now - last >= 1000) { setFps(frames); frames = 0; last = now }
      rafId = requestAnimationFrame(countFps)
    }
    rafId = requestAnimationFrame(countFps)

    // Memory + connection polling
    const poll = () => {
      if (performance.memory) {
        const { usedJSHeapSize: u, totalJSHeapSize: t, jsHeapSizeLimit: l } = performance.memory
        setMem({ used: u / 1048576, total: t / 1048576, limit: l / 1048576 })
      }
      const nc = navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection
      if (nc) setConn({ type: nc.effectiveType, downlink: nc.downlink, rtt: nc.rtt, saveData: nc.saveData })
    }
    poll()
    const id = setInterval(poll, 2000)
    return () => { cancelAnimationFrame(rafId); clearInterval(id) }
  }, [])

  const nav = navigator

  return (
    <div className="flex flex-col h-full text-white">
      {/* Tabs */}
      <div className="flex border-b border-white/8 flex-shrink-0">
        {['overview', 'browser', 'network'].map((t) => (
          <button
            key={t}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/45 hover:text-white/80'
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'overview' && (
          <div>
            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
              Performance
            </p>

            {/* FPS */}
            <div className="flex items-center justify-between p-3.5 rounded-xl mb-3"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div>
                <div className="text-sm font-medium">Render FPS</div>
                <div className="text-xs text-white/35 mt-0.5">requestAnimationFrame rate</div>
              </div>
              <span className={`text-2xl font-mono font-bold ${
                fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {fps}
              </span>
            </div>

            {/* Memory bars */}
            {mem ? (
              <div className="p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Bar label="JS Heap Used"  value={mem.used}  max={mem.limit} color="blue" />
                <Bar label="JS Heap Total" value={mem.total} max={mem.limit} color="green" />
              </div>
            ) : (
              <div className="p-4 rounded-xl text-white/30 text-sm text-center"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                Memory API unavailable in this browser
              </div>
            )}

            {/* Online status */}
            <div className="flex items-center justify-between p-3.5 rounded-xl mt-3"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="text-sm text-white/60">Network Status</span>
              <span className={`text-sm font-medium ${nav.onLine ? 'text-green-400' : 'text-red-400'}`}>
                {nav.onLine ? '● Online' : '● Offline'}
              </span>
            </div>
          </div>
        )}

        {tab === 'browser' && (
          <div>
            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-3">Browser Info</p>
            <Row label="Platform"             value={nav.platform} />
            <Row label="Language"             value={nav.language} />
            <Row label="Cookies"              value={nav.cookieEnabled ? 'Enabled' : 'Disabled'} />
            <Row label="CPU Cores"            value={nav.hardwareConcurrency ? `${nav.hardwareConcurrency} logical cores` : null} />
            <Row label="Device Memory"        value={nav.deviceMemory ? `${nav.deviceMemory} GB` : null} />
            <Row label="Screen Resolution"    value={`${screen.width} × ${screen.height}`} />
            <Row label="Viewport"             value={`${window.innerWidth} × ${window.innerHeight}`} />
            <Row label="Device Pixel Ratio"   value={`${window.devicePixelRatio}×`} />
            <Row label="Color Depth"          value={`${screen.colorDepth}-bit`} />
            <Row label="Timezone"             value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
            <Row label="Do Not Track"         value={nav.doNotTrack === '1' ? 'Enabled' : 'Disabled'} />
            <Row label="User Agent"           value={nav.userAgent} />
          </div>
        )}

        {tab === 'network' && (
          <div>
            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-3">Network</p>
            <Row label="Online"               value={nav.onLine ? 'Yes' : 'No'} />
            {conn ? (
              <>
                <Row label="Effective Type"   value={conn.type} />
                <Row label="Downlink"         value={conn.downlink != null ? `${conn.downlink} Mbps` : null} />
                <Row label="Round-Trip Time"  value={conn.rtt != null ? `${conn.rtt} ms` : null} />
                <Row label="Data Saver"       value={conn.saveData ? 'On' : 'Off'} />
              </>
            ) : (
              <div className="text-white/30 text-sm mt-2 p-4 rounded-xl text-center"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                Network Information API unavailable
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
