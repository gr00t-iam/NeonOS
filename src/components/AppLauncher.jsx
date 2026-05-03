import { useEffect, useState } from 'react'
import useStore from '../store/useStore'

export default function AppLauncher() {
  const apps          = useStore((s) => s.apps)
  const openApp       = useStore((s) => s.openApp)
  const launcherOpen  = useStore((s) => s.launcherOpen)
  const toggleLauncher = useStore((s) => s.toggleLauncher)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && launcherOpen) {
        toggleLauncher()
        setQuery('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [launcherOpen, toggleLauncher])

  if (!launcherOpen) return null

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)' }}
      onClick={() => { toggleLauncher(); setQuery('') }}
    >
      <div
        className="rounded-2xl p-7 w-[480px] shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(30px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search */}
        <input
          autoFocus
          className="w-full rounded-xl px-4 py-2.5 mb-6 text-sm text-white outline-none placeholder-white/30"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          placeholder="Search apps…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* App grid */}
        <div className="grid grid-cols-4 gap-3">
          {filtered.map((app) => (
            <button
              key={app.id}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-all duration-150 group focus:outline-none"
              onClick={() => { openApp(app.id); setQuery('') }}
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-150 drop-shadow-lg">
                {app.icon}
              </span>
              <span className="text-white/75 text-xs font-medium leading-tight text-center">
                {app.name}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-4 text-center text-white/30 text-sm py-4">
              No apps found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
