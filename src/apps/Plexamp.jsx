import { useState, useRef, useEffect } from 'react'

const TRACKS = [
  { id:1, title:'Neon Horizon',      artist:'Synthwave Collective', album:'Electric Dreams',   duration:243, cover:'https://picsum.photos/seed/neon1/300/300',  color:'#7c3aed', url:'' },
  { id:2, title:'Midnight Protocol', artist:'Binary Sunset',        album:'Digital Wanderer',  duration:198, cover:'https://picsum.photos/seed/neon2/300/300',  color:'#dc2626', url:'' },
  { id:3, title:'Chrome City',       artist:'Cyber Pulse',          album:'Urban Geometry',    duration:312, cover:'https://picsum.photos/seed/neon3/300/300',  color:'#0891b2', url:'' },
  { id:4, title:'Ghost Protocol',    artist:'Data Phantom',         album:'Encrypted Echoes',  duration:267, cover:'https://picsum.photos/seed/neon4/300/300',  color:'#059669', url:'' },
  { id:5, title:'Starfield Drive',   artist:'Cosmic Array',         album:'Interstellar',      duration:334, cover:'https://picsum.photos/seed/neon5/300/300',  color:'#d97706', url:'' },
  { id:6, title:'Neural Static',     artist:'Voltage Dreams',       album:'Overclocked',       duration:221, cover:'https://picsum.photos/seed/neon6/300/300',  color:'#be185d', url:'' },
]

function fmt(s) {
  const m = Math.floor(s/60)
  const sec = Math.floor(s%60)
  return `${m}:${sec.toString().padStart(2,'0')}`
}

export default function Plexamp() {
  const [trackIdx,   setTrackIdx]   = useState(0)
  const [playing,    setPlaying]    = useState(false)
  const [progress,   setProgress]   = useState(0)
  const [volume,     setVolume]     = useState(0.8)
  const [muted,      setMuted]      = useState(false)
  const [shuffle,    setShuffle]    = useState(false)
  const [repeat,     setRepeat]     = useState('none')  // none, one, all
  const [liked,      setLiked]      = useState(new Set())
  const [queue,      setQueue]      = useState(false)
  const [urlInput,   setUrlInput]   = useState('')
  const [showUrlBox, setShowUrlBox] = useState(false)

  const audioRef    = useRef(null)
  const animRef     = useRef(null)
  const canvasRef   = useRef(null)
  const frameRef    = useRef(0)

  const track = TRACKS[trackIdx]

  // Animate fake waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let bars = Array.from({ length: 32 }, () => Math.random())

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      bars = bars.map((b, i) => {
        const target = playing ? 0.2 + Math.random() * 0.8 : 0.05 + Math.random() * 0.1
        return b + (target - b) * 0.15
      })
      const bw = canvas.width / bars.length
      bars.forEach((h, i) => {
        const x = i * bw
        const barH = h * canvas.height
        const alpha = playing ? 0.7 + h * 0.3 : 0.2
        ctx.fillStyle = `rgba(251,191,36,${alpha})`
        ctx.fillRect(x + 1, canvas.height - barH, bw - 2, barH)
      })
    }
    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [playing])

  // Progress simulation
  useEffect(() => {
    let id
    if (playing) {
      id = setInterval(() => {
        setProgress(p => {
          if (p >= track.duration) {
            // Auto-advance
            if (repeat === 'one') return 0
            const next = shuffle ? Math.floor(Math.random()*TRACKS.length) : (trackIdx+1) % TRACKS.length
            setTrackIdx(next)
            return 0
          }
          return p + 1
        })
      }, 1000)
    }
    return () => clearInterval(id)
  }, [playing, track.duration, repeat, shuffle, trackIdx])

  // Real audio if URL is set
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track.url) return
    audio.src = track.url
    audio.volume = muted ? 0 : volume
    if (playing) audio.play().catch(() => {})
    else audio.pause()
  }, [track, playing, volume, muted])

  const togglePlay  = () => setPlaying(p => !p)
  const prevTrack   = () => { setTrackIdx(i => (i-1+TRACKS.length)%TRACKS.length); setProgress(0) }
  const nextTrack   = () => {
    const next = shuffle ? Math.floor(Math.random()*TRACKS.length) : (trackIdx+1)%TRACKS.length
    setTrackIdx(next); setProgress(0)
  }
  const toggleLike  = () => setLiked(s => { const n=new Set(s); n.has(track.id)?n.delete(track.id):n.add(track.id); return n })
  const cycleRepeat = () => setRepeat(r => r==='none'?'all':r==='all'?'one':'none')

  const seekTo = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    setProgress(Math.floor(pct * track.duration))
  }

  const addUrl = () => {
    if (!urlInput.trim()) return
    TRACKS[trackIdx] = { ...TRACKS[trackIdx], url: urlInput.trim() }
    setShowUrlBox(false)
    setUrlInput('')
    const audio = audioRef.current
    if (audio) { audio.src = urlInput.trim(); if (playing) audio.play().catch(()=>{}) }
  }

  const pct = track.duration > 0 ? (progress / track.duration) * 100 : 0

  return (
    <div className="flex flex-col h-full" style={{ background: '#1f2023' }}>
      <audio ref={audioRef} />

      {/* Album art + info */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Blurred bg art */}
        <div className="absolute inset-0 opacity-20 blur-3xl scale-110"
          style={{ backgroundImage: `url(${track.cover})`, backgroundSize:'cover', backgroundPosition:'center' }} />

        {/* Art */}
        <div className={`relative w-52 h-52 rounded-2xl overflow-hidden shadow-2xl mb-5 transition-all duration-300 ${playing ? 'scale-100' : 'scale-95'}`}
          style={{ border: `2px solid ${track.color}40` }}>
          <img src={track.cover} alt={track.album} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${playing ? 'opacity-0' : 'opacity-100'}`}
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <span className="text-4xl">⏸</span>
          </div>
        </div>

        {/* Track info */}
        <div className="relative text-center z-10 w-full px-4">
          <h2 className="text-white font-bold text-lg truncate">{track.title}</h2>
          <p className="text-white/50 text-sm">{track.artist}</p>
          <p className="text-white/30 text-xs mt-0.5">{track.album}</p>
        </div>

        {/* Waveform */}
        <canvas ref={canvasRef} width={280} height={40} className="relative z-10 mt-4 rounded-lg opacity-80" />
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 px-5 pb-5" style={{ background: '#1f2023' }}>
        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-white/35 mb-1.5">
            <span>{fmt(progress)}</span>
            <span>{fmt(track.duration)}</span>
          </div>
          <div className="h-1.5 rounded-full cursor-pointer group" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={seekTo}>
            <div className="h-full rounded-full relative transition-all" style={{ width: `${pct}%`, background: '#fbbf24' }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>
        </div>

        {/* Main controls */}
        <div className="flex items-center justify-center gap-5 mb-4">
          <button onClick={() => setShuffle(s=>!s)} title="Shuffle"
            className={`text-xl transition-colors ${shuffle ? 'text-amber-400' : 'text-white/40 hover:text-white/80'}`}>🔀</button>
          <button onClick={prevTrack} className="text-2xl text-white/70 hover:text-white transition-colors" title="Previous">⏮</button>
          <button onClick={togglePlay}
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl text-black font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{ background: '#fbbf24' }}>
            {playing ? '⏸' : '▶'}
          </button>
          <button onClick={nextTrack} className="text-2xl text-white/70 hover:text-white transition-colors" title="Next">⏭</button>
          <button onClick={cycleRepeat} title={`Repeat: ${repeat}`}
            className={`text-xl transition-colors ${repeat !== 'none' ? 'text-amber-400' : 'text-white/40 hover:text-white/80'}`}>
            {repeat === 'one' ? '🔂' : '🔁'}
          </button>
        </div>

        {/* Volume + secondary */}
        <div className="flex items-center gap-3">
          <button onClick={() => setMuted(m=>!m)} className="text-white/50 hover:text-white text-base transition-colors">
            {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
          </button>
          <input type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume}
            onChange={e => { setVolume(+e.target.value); setMuted(false) }}
            className="flex-1 accent-amber-400" style={{ height: 3 }} />
          <button onClick={toggleLike} className="text-xl transition-colors" title="Like">
            {liked.has(track.id) ? '❤️' : '🤍'}
          </button>
          <button onClick={() => setQueue(q=>!q)} title="Queue"
            className={`text-base transition-colors ${queue ? 'text-amber-400' : 'text-white/40 hover:text-white/80'}`}>☰</button>
        </div>

        {/* Queue / track list */}
        {queue && (
          <div className="mt-4 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Queue</span>
              <button onClick={() => setShowUrlBox(v=>!v)} className="text-xs text-amber-400 hover:text-amber-300">+ Add URL</button>
            </div>
            {showUrlBox && (
              <div className="flex gap-2 p-2">
                <input className="flex-1 bg-white/8 rounded-lg px-2 py-1 text-xs text-white outline-none placeholder-white/30"
                  placeholder="Audio URL (mp3, ogg…)" value={urlInput} onChange={e=>setUrlInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&addUrl()} />
                <button onClick={addUrl} className="px-2 py-1 rounded-lg text-xs bg-amber-500 text-black font-semibold">Add</button>
              </div>
            )}
            <div className="max-h-36 overflow-y-auto">
              {TRACKS.map((t,i) => (
                <button key={t.id} onClick={() => { setTrackIdx(i); setProgress(0) }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/8 transition-colors ${i===trackIdx?'bg-white/10':''}`}>
                  <img src={t.cover} alt="" className="w-8 h-8 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium truncate ${i===trackIdx?'text-amber-400':'text-white/80'}`}>{t.title}</div>
                    <div className="text-[11px] text-white/35 truncate">{t.artist}</div>
                  </div>
                  <span className="text-[11px] text-white/30">{fmt(t.duration)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
