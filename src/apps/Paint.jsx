import { useRef, useState, useEffect, useCallback } from 'react'

const PALETTE = [
  '#000000','#1a1a1a','#404040','#808080','#c0c0c0','#ffffff',
  '#800000','#ff0000','#ff6060','#ff8000','#ffb347','#ffff00',
  '#008000','#00ff00','#80ff80','#008080','#00ffff','#80ffff',
  '#000080','#0000ff','#6060ff','#800080','#ff00ff','#ff80ff',
  '#4a0000','#804000','#806000','#006040','#004080','#400080',
]

const TOOLS = [
  { id: 'pencil',  icon: '✏️',  label: 'Pencil (P)' },
  { id: 'eraser',  icon: '⬜',  label: 'Eraser (E)' },
  { id: 'fill',    icon: '🪣',  label: 'Fill (F)' },
  { id: 'line',    icon: '╱',   label: 'Line (L)' },
  { id: 'rect',    icon: '▭',   label: 'Rectangle (R)' },
  { id: 'ellipse', icon: '⭕',  label: 'Ellipse (O)' },
  { id: 'text',    icon: 'T',   label: 'Text (T)' },
  { id: 'picker',  icon: '🎯',  label: 'Color Picker (K)' },
]

const MAX_HISTORY = 20

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return [r, g, b]
}

function floodFill(ctx, sx, sy, fillHex) {
  const canvas = ctx.canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const W = canvas.width
  const H = canvas.height
  const idx = (sy * W + sx) * 4
  const [tr, tg, tb, ta] = [data[idx], data[idx+1], data[idx+2], data[idx+3]]
  const [fr, fg, fb] = hexToRgb(fillHex)
  if (tr === fr && tg === fg && tb === fb) return
  const stack = [[sx, sy]]
  const visited = new Uint8Array(W * H)
  while (stack.length) {
    const [cx, cy] = stack.pop()
    if (cx < 0 || cx >= W || cy < 0 || cy >= H) continue
    const i = cy * W + cx
    if (visited[i]) continue
    const di = i * 4
    if (data[di] !== tr || data[di+1] !== tg || data[di+2] !== tb || data[di+3] !== ta) continue
    visited[i] = 1
    data[di] = fr; data[di+1] = fg; data[di+2] = fb; data[di+3] = 255
    stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1])
  }
  ctx.putImageData(imageData, 0, 0)
}

export default function Paint() {
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const containerRef = useRef(null)
  const [tool, setTool]       = useState('pencil')
  const [color, setColor]     = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [size, setSize]       = useState(4)
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const [textInput, setTextInput] = useState(null)
  const isDrawing = useRef(false)
  const startPos  = useRef({ x: 0, y: 0 })
  const snapshot  = useRef(null)

  // Init canvas white
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    pushHistory()
  }, [])

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL()
    setHistory((prev) => {
      const next = [...prev.slice(0, histIdx + 1), url].slice(-MAX_HISTORY)
      setHistIdx(next.length - 1)
      return next
    })
  }, [histIdx])

  const undo = useCallback(() => {
    if (histIdx <= 0) return
    const newIdx = histIdx - 1
    const img = new Image()
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = history[newIdx]
    setHistIdx(newIdx)
  }, [histIdx, history])

  const redo = useCallback(() => {
    if (histIdx >= history.length - 1) return
    const newIdx = histIdx + 1
    const img = new Image()
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = history[newIdx]
    setHistIdx(newIdx)
  }, [histIdx, history])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return
      const map = { p:'pencil', e:'eraser', f:'fill', l:'line', r:'rect', o:'ellipse', t:'text', k:'picker' }
      if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()])
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    return { x: Math.round((e.clientX - rect.left) * scaleX), y: Math.round((e.clientY - rect.top) * scaleY) }
  }

  const setupCtx = (ctx, isEraser = false) => {
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = isEraser ? bgColor : color
    ctx.fillStyle = color
    ctx.globalCompositeOperation = 'source-over'
  }

  const onMouseDown = (e) => {
    if (e.button !== 0) return
    const pos = getPos(e)
    isDrawing.current = true
    startPos.current = pos
    const ctx = canvasRef.current.getContext('2d')
    setupCtx(ctx, tool === 'eraser')

    if (tool === 'fill') {
      floodFill(ctx, pos.x, pos.y, color)
      pushHistory()
      isDrawing.current = false
      return
    }
    if (tool === 'picker') {
      const [r,g,b] = ctx.getImageData(pos.x, pos.y, 1, 1).data
      setColor(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`)
      isDrawing.current = false
      return
    }
    if (tool === 'text') {
      setTextInput({ x: e.clientX, y: e.clientY, cx: pos.x, cy: pos.y })
      isDrawing.current = false
      return
    }
    if (['line','rect','ellipse'].includes(tool)) {
      snapshot.current = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    if (tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
  }

  const onMouseMove = (e) => {
    if (!isDrawing.current) return
    const pos = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    setupCtx(ctx, tool === 'eraser')
    const { x: sx, y: sy } = startPos.current

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (snapshot.current) {
      ctx.putImageData(snapshot.current, 0, 0)
      if (tool === 'line') {
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(pos.x, pos.y); ctx.stroke()
      } else if (tool === 'rect') {
        const shift = e.shiftKey
        const w = pos.x - sx
        const h = shift ? Math.sign(pos.y - sy) * Math.abs(w) : pos.y - sy
        e.altKey ? ctx.fillRect(sx, sy, w, h) : ctx.strokeRect(sx, sy, w, h)
      } else if (tool === 'ellipse') {
        const rx = Math.abs(pos.x - sx) / 2
        const ry = e.shiftKey ? rx : Math.abs(pos.y - sy) / 2
        ctx.beginPath()
        ctx.ellipse(sx + (pos.x-sx)/2, sy + (pos.y-sy)/2, rx, ry, 0, 0, Math.PI*2)
        e.altKey ? ctx.fill() : ctx.stroke()
      }
    }
  }

  const onMouseUp = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    snapshot.current = null
    if (!['fill','picker','text'].includes(tool)) pushHistory()
  }

  const commitText = (text) => {
    if (!text.trim()) { setTextInput(null); return }
    const ctx = canvasRef.current.getContext('2d')
    ctx.font = `${size * 4}px sans-serif`
    ctx.fillStyle = color
    ctx.fillText(text, textInput.cx, textInput.cy)
    pushHistory()
    setTextInput(null)
  }

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    pushHistory()
  }

  const saveImage = () => {
    const link = document.createElement('a')
    link.download = `neonos-paint-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const openImage = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const img = new Image()
        img.onload = () => {
          const ctx = canvasRef.current.getContext('2d')
          ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height)
          pushHistory()
        }
        img.src = ev.target.result
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <div className="flex h-full text-white" style={{ background: '#2d2d2d' }}>
      {/* Left toolbar */}
      <div className="flex flex-col gap-1 p-1.5 border-r border-white/10 flex-shrink-0" style={{ background: '#252526', width: 48 }}>
        {TOOLS.map((t) => (
          <button key={t.id} title={t.label} onClick={() => setTool(t.id)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all ${
              tool === t.id ? 'bg-blue-600 text-white' : 'text-white/60 hover:bg-white/10'
            }`}>
            {t.icon}
          </button>
        ))}
        <div className="flex-1" />
        <button title="Undo (Ctrl+Z)" onClick={undo} disabled={histIdx <= 0}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/10 disabled:opacity-25 text-sm">↩</button>
        <button title="Redo (Ctrl+Y)" onClick={redo} disabled={histIdx >= history.length - 1}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/10 disabled:opacity-25 text-sm">↪</button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-3 py-1.5 border-b border-white/10 flex-shrink-0" style={{ background: '#252526' }}>
          {/* Color swatches */}
          <div className="flex gap-1.5 items-center">
            <div className="relative w-7 h-7">
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded border border-white/20 cursor-pointer"
                style={{ background: bgColor }} onClick={() => { const i = document.createElement('input'); i.type='color'; i.value=bgColor; i.onchange=e=>setBgColor(e.target.value); i.click() }} />
              <div className="absolute top-0 left-0 w-5 h-5 rounded border border-white/30 cursor-pointer"
                style={{ background: color }} onClick={() => { const i = document.createElement('input'); i.type='color'; i.value=color; i.onchange=e=>setColor(e.target.value); i.click() }} />
            </div>
            <div className="flex flex-wrap gap-0.5 max-w-[180px]">
              {PALETTE.map((c) => (
                <button key={c} onClick={() => setColor(c)} title={c}
                  className={`w-4 h-4 rounded-sm border transition-transform hover:scale-125 ${color === c ? 'border-white scale-125' : 'border-transparent'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="h-8 border-l border-white/10 mx-1" />

          {/* Brush size */}
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs">Size</span>
            <input type="range" min="1" max="50" value={size} onChange={(e) => setSize(+e.target.value)}
              className="w-20 accent-blue-500" />
            <span className="text-white/60 text-xs w-5">{size}</span>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <button onClick={openImage} className="px-2.5 py-1 rounded-lg text-xs text-white/60 hover:bg-white/10 transition-colors">📂 Open</button>
          <button onClick={clearCanvas} className="px-2.5 py-1 rounded-lg text-xs text-white/60 hover:bg-white/10 transition-colors">🗑️ Clear</button>
          <button onClick={saveImage} className="px-2.5 py-1 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors">💾 Save PNG</button>
        </div>

        {/* Canvas area */}
        <div ref={containerRef} className="flex-1 overflow-auto flex items-center justify-center p-4" style={{ background: '#3c3c3c' }}>
          <div className="relative shadow-2xl">
            <canvas
              ref={canvasRef}
              width={1200} height={800}
              className="block cursor-crosshair"
              style={{ maxWidth: '100%', imageRendering: 'pixelated' }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
            {textInput && (
              <input
                autoFocus
                className="absolute bg-transparent outline-none border-b border-dashed border-blue-400 text-black"
                style={{
                  left: textInput.x - containerRef.current?.getBoundingClientRect().left - 48,
                  top: textInput.y - containerRef.current?.getBoundingClientRect().top - 32,
                  fontSize: size * 4, minWidth: 100, color,
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') commitText(e.target.value); if (e.key === 'Escape') setTextInput(null) }}
                onBlur={(e) => commitText(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="px-3 py-1 text-xs text-white/30 border-t border-white/10 flex gap-4 flex-shrink-0" style={{ background: '#252526' }}>
          <span>Tool: {TOOLS.find(t=>t.id===tool)?.label}</span>
          <span>Size: {size}px</span>
          <span>Canvas: 1200×800</span>
          <span>Ctrl+Z undo · Ctrl+Y redo · Shift=square/circle · Alt=fill shape</span>
        </div>
      </div>
    </div>
  )
}
