import { useState, useEffect, useRef } from 'react'

const KEY       = 'neonos-notes'
const AI_KEY    = 'neonos-ai-key'

const defaultNotes = [
  { id: 1, title: 'Welcome to NeonOS Notes', content: 'Your AI-powered note-taking app.\n\nSelect text and use the AI toolbar to:\n• Summarize your notes\n• Check spelling\n• Improve writing\n• Translate content\n\nClick the ✦ AI button to get started.' },
  { id: 2, title: 'Shopping List', content: '• Apples\n• Bred (this is mispelled)\n• Coffe\n• Butter\n• Milk' },
]

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || defaultNotes } catch { return defaultNotes }
}

function AiPanel({ content, apiKey, onResult, onClose }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState('')
  const [error, setError]     = useState('')

  const call = async (prompt) => {
    if (!apiKey) { setError('No API key — add it in ✦ AI Settings'); return }
    setLoading(true); setResult(''); setError('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
      const data = await res.json()
      setResult(data.content[0].text)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const actions = [
    { label: '📋 Summarize',       prompt: `Summarize the following notes concisely in 2-3 sentences:\n\n${content}` },
    { label: '✏️ Spell Check',     prompt: `Spell-check the following text. List corrections in format "wrong → correct", then show the corrected text:\n\n${content}` },
    { label: '✨ Improve Writing', prompt: `Improve the writing clarity and style of the following text. Return only the improved version:\n\n${content}` },
    { label: '🌐 Translate to ES', prompt: `Translate the following to Spanish:\n\n${content}` },
    { label: '📌 Key Points',      prompt: `Extract the key points from the following as a bullet list:\n\n${content}` },
  ]

  return (
    <div className="absolute inset-0 z-10 flex flex-col" style={{ background: 'rgba(15,16,28,0.97)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
        <span className="text-purple-400 text-lg">✦</span>
        <span className="text-white font-semibold text-sm">AI Assistant</span>
        <button onClick={onClose} className="ml-auto text-white/40 hover:text-white text-lg">×</button>
      </div>

      <div className="flex flex-wrap gap-2 p-4 border-b border-white/8">
        {actions.map((a) => (
          <button key={a.label} onClick={() => call(a.prompt)} disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
            style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' }}>
            {a.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center gap-2 text-purple-400 text-sm">
            <span className="animate-spin">⏳</span> Thinking…
          </div>
        )}
        {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">{error}</p>}
        {result && (
          <div>
            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { onResult(result); onClose() }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors">
                Replace Note Content
              </button>
              <button onClick={() => { onResult(content + '\n\n---\n' + result); onClose() }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-purple-300 transition-colors"
                style={{ background: 'rgba(139,92,246,0.15)' }}>
                Append to Note
              </button>
            </div>
          </div>
        )}
        {!loading && !error && !result && (
          <p className="text-white/30 text-sm text-center mt-8">Select an AI action above to get started</p>
        )}
      </div>
    </div>
  )
}

export default function Notes() {
  const [notes, setNotes]       = useState(load)
  const [activeId, setActiveId] = useState(notes[0]?.id ?? null)
  const [showAi, setShowAi]     = useState(false)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [apiKey, setApiKey]     = useState(() => localStorage.getItem(AI_KEY) || '')
  const [keyInput, setKeyInput] = useState(apiKey)

  const active = notes.find((n) => n.id === activeId) ?? null

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(notes)) }, [notes])

  const addNote = () => {
    const id = Date.now()
    setNotes((p) => [...p, { id, title: 'Untitled', content: '' }])
    setActiveId(id)
  }

  const deleteNote = (id) => {
    const next = notes.filter((n) => n.id !== id)
    setNotes(next); setActiveId(next[0]?.id ?? null)
  }

  const update = (field, value) =>
    setNotes((p) => p.map((n) => (n.id === activeId ? { ...n, [field]: value } : n)))

  const saveKey = () => {
    localStorage.setItem(AI_KEY, keyInput)
    setApiKey(keyInput)
    setShowKeyModal(false)
  }

  const wordCount = active ? active.content.trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <div className="flex h-full text-white relative">
      {showAi && active && (
        <AiPanel
          content={active.content}
          apiKey={apiKey}
          onResult={(text) => update('content', text)}
          onClose={() => setShowAi(false)}
        />
      )}

      {showKeyModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl p-6 w-96" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-white font-semibold mb-1">✦ AI API Key</h3>
            <p className="text-white/40 text-xs mb-4">Enter your Anthropic API key. Stored locally in your browser.</p>
            <input className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-3 font-mono"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
              type="password" placeholder="sk-ant-..." value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={saveKey}
                className="flex-1 py-2 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 transition-colors">
                Save Key
              </button>
              <button onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-sm text-white/50 hover:bg-white/10 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-48 flex flex-col border-r border-white/8 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/8">
          <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Notes</span>
          <button onClick={addNote} className="text-blue-400 hover:text-blue-300 text-xl leading-none transition-colors" title="New note">+</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notes.map((n) => (
            <div key={n.id} onClick={() => setActiveId(n.id)}
              className={`group flex items-start gap-1 px-3 py-2 cursor-pointer border-b border-white/5 transition-colors ${n.id === activeId ? 'bg-blue-600/25' : 'hover:bg-white/5'}`}>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate font-medium text-white/85">{n.title || 'Untitled'}</div>
                <div className="text-[11px] text-white/35 truncate mt-0.5">{n.content.slice(0, 38) || 'Empty'}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteNote(n.id) }}
                className="opacity-0 group-hover:opacity-100 text-red-400 text-xs mt-0.5 transition-opacity">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/8 flex-shrink-0"
            style={{ background: 'rgba(0,0,0,0.15)' }}>
            <button onClick={() => setShowAi(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' }}>
              ✦ AI
            </button>
            <button onClick={() => setShowKeyModal(true)}
              className="px-2 py-1 rounded text-xs text-white/30 hover:text-white/60 hover:bg-white/8 transition-colors"
              title="Set API key">
              {apiKey ? '🔑' : '🔑 Add Key'}
            </button>
          </div>
          <input
            className="bg-transparent border-b border-white/8 px-4 py-2.5 text-base font-semibold text-white outline-none placeholder-white/25 flex-shrink-0"
            value={active.title} onChange={(e) => update('title', e.target.value)} placeholder="Note title" />
          <textarea
            className="flex-1 bg-transparent px-4 py-3 text-sm text-white/80 outline-none resize-none placeholder-white/25 leading-relaxed"
            value={active.content} onChange={(e) => update('content', e.target.value)} placeholder="Start writing…" />
          <div className="px-4 py-1.5 border-t border-white/8 flex gap-3 text-white/25 text-xs flex-shrink-0">
            <span>{active.content.length} chars</span>·<span>{wordCount} words</span>·<span>Auto-saved</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-white/25">
          <div className="text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-sm mb-3">No notes yet</p>
            <button onClick={addNote} className="text-blue-400 hover:text-blue-300 text-sm">Create your first note</button>
          </div>
        </div>
      )}
    </div>
  )
}
