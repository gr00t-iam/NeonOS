import { useState } from 'react'
import useStore from '../store/useStore'

const PRESETS = [
  { name: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
  { name: 'Forest',    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80' },
  { name: 'Ocean',     url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80' },
  { name: 'Desert',    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80' },
  { name: 'City',      url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80' },
  { name: 'Galaxy',    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80' },
  { name: 'Aurora',    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80' },
  { name: 'Autumn',    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80' },
]

const SECTIONS = [
  { id: 'wallpaper', label: '🖼️  Wallpaper' },
  { id: 'display',   label: '🖥️  Display' },
  { id: 'about',     label: 'ℹ️  About' },
]

export default function Settings() {
  const wallpaper    = useStore((s) => s.wallpaper)
  const setWallpaper = useStore((s) => s.setWallpaper)
  const [section, setSection] = useState('wallpaper')
  const [customUrl, setCustomUrl] = useState('')
  const [error, setError] = useState('')

  const applyCustom = () => {
    const url = customUrl.trim()
    if (!url) return
    if (!url.startsWith('http')) { setError('URL must start with http:// or https://'); return }
    setWallpaper(url)
    setError('')
  }

  return (
    <div className="flex h-full text-white">
      {/* Sidebar */}
      <div className="w-44 flex-shrink-0 border-r border-white/8" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="px-3 py-2.5 border-b border-white/8">
          <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Settings</span>
        </div>
        <div className="p-1.5 space-y-0.5">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                section === s.id ? 'bg-blue-600/35 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {section === 'wallpaper' && (
          <div>
            <h2 className="text-base font-semibold mb-5">Wallpaper</h2>

            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-3">Gallery</p>
            <div className="grid grid-cols-4 gap-2.5 mb-6">
              {PRESETS.map((p) => (
                <button
                  key={p.url}
                  onClick={() => setWallpaper(p.url)}
                  title={p.name}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all focus:outline-none ${
                    wallpaper === p.url
                      ? 'border-blue-500 ring-2 ring-blue-500/40'
                      : 'border-transparent hover:border-white/25'
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  {wallpaper === p.url && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.25)' }}>
                      <span className="text-white text-lg">✓</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 py-0.5 px-1 text-center text-[10px] text-white/70"
                    style={{ background: 'rgba(0,0,0,0.55)' }}>
                    {p.name}
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-3">Custom URL</p>
            <div className="flex gap-2 mb-1">
              <input
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none placeholder-white/30 focus:ring-1 focus:ring-blue-500"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="https://example.com/wallpaper.jpg"
                value={customUrl}
                onChange={(e) => { setCustomUrl(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
              />
              <button
                onClick={applyCustom}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors"
              >
                Apply
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mt-5 mb-3">Preview</p>
            <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
              <img src={wallpaper} alt="Current wallpaper" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {section === 'display' && (
          <div>
            <h2 className="text-base font-semibold mb-5">Display</h2>
            <div className="space-y-2">
              {[
                ['Resolution',    `${screen.width} × ${screen.height}`],
                ['Viewport',      `${window.innerWidth} × ${window.innerHeight}`],
                ['Color Depth',   `${screen.colorDepth}-bit`],
                ['Pixel Ratio',   `${window.devicePixelRatio}×`],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-sm text-white/60">{label}</span>
                  <span className="text-sm font-mono text-white/85">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'about' && (
          <div>
            <h2 className="text-base font-semibold mb-5">About Claude OS</h2>
            <div className="flex items-center gap-4 p-5 rounded-2xl mb-5"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="text-5xl">🖥️</span>
              <div>
                <div className="text-xl font-semibold">Claude OS</div>
                <div className="text-white/45 text-sm">Version 1.0.0</div>
                <div className="text-white/30 text-xs mt-1">Built with React + Zustand + Tailwind CSS</div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-white/50 leading-relaxed">
              <p>A modular, web-based desktop environment inspired by Chrome OS.</p>
              <p>Runs entirely in the browser — no server, no install.</p>
              <p className="text-white/25 text-xs mt-4">© 2025 Claude OS. Powered by Anthropic.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
