import useStore from '../store/useStore'
import SystemTray from './SystemTray'

export default function Shelf() {
  const toggleLauncher = useStore((s) => s.toggleLauncher)
  const windows        = useStore((s) => s.windows)
  const openApp        = useStore((s) => s.openApp)
  const launcherOpen   = useStore((s) => s.launcherOpen)

  return (
    <div
      className="fixed bottom-0 inset-x-0 h-12 flex items-center px-3 z-[400] select-none"
      style={{
        background: 'rgba(12,13,22,0.88)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Running apps — left zone */}
      <div className="flex items-center gap-0.5 flex-1 overflow-x-auto">
        {windows.map((win) => (
          <button
            key={win.id}
            title={win.title}
            onClick={() => openApp(win.appId)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
              !win.minimized ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <span className="text-base leading-none">{win.icon}</span>
            <span className={`w-1 h-1 rounded-full ${!win.minimized ? 'bg-blue-400' : 'bg-white/20'}`} />
          </button>
        ))}
      </div>

      {/* App launcher — absolute center */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <button
          onClick={toggleLauncher}
          title="App Launcher"
          className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all border ${
            launcherOpen
              ? 'bg-white/25 border-white/30 scale-95'
              : 'bg-white/10 border-white/15 hover:bg-white/20 hover:border-white/25'
          }`}
        >
          ⊞
        </button>
      </div>

      {/* System tray — right zone (no battery) */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="flex items-center gap-2 text-white/60 text-base">
          <span title="Network">📶</span>
          <span title="Volume">🔊</span>
        </div>
        <SystemTray />
      </div>
    </div>
  )
}
