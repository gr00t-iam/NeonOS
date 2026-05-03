import { useEffect, useRef } from 'react'

export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Keep menu in viewport
  const menuW = 210
  const menuH = items.length * 34 + 12
  const left = Math.min(x, window.innerWidth - menuW - 8)
  const top  = Math.min(y, window.innerHeight - menuH - 56)

  return (
    <div
      ref={ref}
      className="fixed rounded-xl py-1.5 shadow-2xl overflow-hidden select-none"
      style={{
        left, top,
        width: menuW,
        zIndex: 9000,
        background: 'rgba(28,29,40,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(24px)',
        animation: 'ctxIn 0.1s ease',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{`@keyframes ctxIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="my-1 mx-3 border-t border-white/8" />
        ) : (
          <button
            key={i}
            className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm text-left transition-colors ${
              item.danger ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-white/80'
            }`}
            onClick={() => { item.action(); onClose() }}
          >
            <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.shortcut && <span className="text-white/25 text-xs">{item.shortcut}</span>}
          </button>
        )
      )}
    </div>
  )
}
