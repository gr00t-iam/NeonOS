import { useState, useCallback } from 'react'
import useStore, { APPS } from '../store/useStore'
import Window from './Window'
import Shelf from './Shelf'
import AppLauncher from './AppLauncher'
import ContextMenu from './ContextMenu'

import Notes        from '../apps/Notes'
import Calculator   from '../apps/Calculator'
import Files        from '../apps/Files'
import Clock        from '../apps/Clock'
import SystemMonitor from '../apps/SystemMonitor'
import Settings     from '../apps/Settings'
import BrowserApp   from '../apps/BrowserApp'
import Discord      from '../apps/Discord'
import Plexamp      from '../apps/Plexamp'
import Paint        from '../apps/Paint'
import Terminal     from '../apps/Terminal'

const APP_MAP = {
  browser: BrowserApp, files: Files, settings: Settings,
  notes: Notes, calculator: Calculator, clock: Clock,
  sysmon: SystemMonitor, discord: Discord, plexamp: Plexamp,
  paint: Paint, terminal: Terminal,
}

export default function Desktop() {
  const wallpaper = useStore((s) => s.wallpaper)
  const windows   = useStore((s) => s.windows)
  const openApp   = useStore((s) => s.openApp)

  const [ctxMenu, setCtxMenu] = useState(null)

  const handleContextMenu = useCallback((e) => {
    if (e.target.closest('[data-window]') || e.target.closest('[data-shelf]')) return
    e.preventDefault()
    setCtxMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const ctxItems = [
    { icon: '📝', label: 'New Note',         action: () => openApp('notes') },
    { icon: '🎨', label: 'Open Paint',       action: () => openApp('paint') },
    { icon: '💻', label: 'Open Terminal',    action: () => openApp('terminal') },
    { separator: true },
    { icon: '🖼️',  label: 'Change Wallpaper', action: () => openApp('settings') },
    { icon: '⚙️',  label: 'Settings',         action: () => openApp('settings') },
    { separator: true },
    { icon: '🔄', label: 'Refresh Desktop',  action: () => window.location.reload(), shortcut: 'F5' },
    { icon: 'ℹ️',  label: 'About NeonOS',     action: () => openApp('settings') },
  ]

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.5s ease',
      }}
      onContextMenu={handleContextMenu}
      onClick={() => ctxMenu && setCtxMenu(null)}
    >
      {/* Desktop icons */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 pb-14">
        {APPS.map((app) => (
          <button
            key={app.id}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/15 transition-all group w-[72px]"
            onDoubleClick={() => openApp(app.id)}
            title={`Double-click to open ${app.name}`}
          >
            <span className="text-[2.2rem] group-hover:scale-110 transition-transform drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              {app.icon}
            </span>
            <span className="text-white text-[11px] font-medium text-center leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] w-full">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      {/* Windows */}
      {windows.map((win) => {
        const Comp = APP_MAP[win.appId]
        return (
          <div key={win.id} data-window="true">
            <Window win={win}>
              {Comp ? <Comp /> : <div className="p-4 text-white/50">Unknown app</div>}
            </Window>
          </div>
        )
      })}

      <AppLauncher />
      <div data-shelf="true"><Shelf /></div>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={ctxItems}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  )
}
