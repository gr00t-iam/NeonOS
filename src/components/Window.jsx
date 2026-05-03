import { useCallback } from 'react'
import useStore from '../store/useStore'

export default function Window({ win, children }) {
  const closeWindow    = useStore((s) => s.closeWindow)
  const minimizeWindow = useStore((s) => s.minimizeWindow)
  const bringToFront   = useStore((s) => s.bringToFront)
  const updateWindowPos = useStore((s) => s.updateWindowPos)

  const handleTitleMouseDown = useCallback(
    (e) => {
      if (e.target.closest('button')) return
      e.preventDefault()
      bringToFront(win.id)

      const startX = e.clientX - win.x
      const startY = e.clientY - win.y

      const onMove = (ev) => {
        const nx = Math.max(0, Math.min(ev.clientX - startX, window.innerWidth - win.width))
        const ny = Math.max(0, Math.min(ev.clientY - startY, window.innerHeight - win.height - 48))
        updateWindowPos(win.id, nx, ny)
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [win, bringToFront, updateWindowPos]
  )

  if (win.minimized) return null

  return (
    <div
      className="absolute flex flex-col rounded-xl overflow-hidden shadow-2xl"
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      onMouseDown={() => bringToFront(win.id)}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 select-none cursor-grab active:cursor-grabbing flex-shrink-0"
        style={{ background: 'rgba(28,29,38,0.97)', backdropFilter: 'blur(20px)' }}
        onMouseDown={handleTitleMouseDown}
      >
        {/* Traffic lights */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            className="w-3 h-3 rounded-full bg-red-500 hover:brightness-110 transition-all flex-shrink-0 focus:outline-none"
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id) }}
            title="Close"
          />
          <button
            className="w-3 h-3 rounded-full bg-yellow-400 hover:brightness-110 transition-all flex-shrink-0 focus:outline-none"
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id) }}
            title="Minimize"
          />
          <button
            className="w-3 h-3 rounded-full bg-green-500 hover:brightness-110 transition-all flex-shrink-0 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
            title="Maximize"
          />
        </div>
        <span className="text-xs flex-shrink-0">{win.icon}</span>
        <span className="text-white/80 text-sm font-medium flex-1 truncate">{win.title}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden" style={{ background: '#1a1b26' }}>
        {children}
      </div>
    </div>
  )
}
