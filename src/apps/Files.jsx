import { useState } from 'react'

const FS = {
  name: 'Home', type: 'dir', children: [
    { name: 'Documents', type: 'dir', children: [
      { name: 'Resume.pdf',             type: 'file', size: '142 KB', mod: '2025-04-20', icon: '📄' },
      { name: 'Project Proposal.docx',  type: 'file', size: '88 KB',  mod: '2025-04-18', icon: '📝' },
      { name: 'Budget.xlsx',            type: 'file', size: '54 KB',  mod: '2025-03-31', icon: '📊' },
      { name: 'Notes.txt',              type: 'file', size: '3 KB',   mod: '2025-04-01', icon: '📄' },
    ]},
    { name: 'Pictures', type: 'dir', children: [
      { name: 'Vacation', type: 'dir', children: [
        { name: 'beach.jpg',   type: 'file', size: '3.2 MB', mod: '2025-02-10', icon: '🖼️' },
        { name: 'sunset.jpg',  type: 'file', size: '2.8 MB', mod: '2025-02-11', icon: '🖼️' },
        { name: 'hotel.jpg',   type: 'file', size: '1.9 MB', mod: '2025-02-12', icon: '🖼️' },
      ]},
      { name: 'profile.png',  type: 'file', size: '512 KB', mod: '2025-01-05', icon: '🖼️' },
      { name: 'logo.svg',     type: 'file', size: '14 KB',  mod: '2025-03-22', icon: '🖼️' },
    ]},
    { name: 'Music', type: 'dir', children: [
      { name: 'Favorites', type: 'dir', children: [
        { name: 'song_1.mp3', type: 'file', size: '8.1 MB', mod: '2024-12-01', icon: '🎵' },
        { name: 'song_2.mp3', type: 'file', size: '7.4 MB', mod: '2024-12-01', icon: '🎵' },
      ]},
    ]},
    { name: 'Downloads', type: 'dir', children: [
      { name: 'installer.exe', type: 'file', size: '24 MB',  mod: '2025-04-25', icon: '⚙️' },
      { name: 'archive.zip',   type: 'file', size: '156 MB', mod: '2025-04-22', icon: '🗜️' },
      { name: 'ebook.pdf',     type: 'file', size: '4.2 MB', mod: '2025-04-10', icon: '📄' },
    ]},
    { name: 'Desktop', type: 'dir', children: [] },
  ],
}

function Node({ node, depth = 0 }) {
  const [open, setOpen]     = useState(depth < 1)
  const [selected, setSelected] = useState(false)

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1 rounded-md cursor-pointer text-sm select-none transition-colors ${
          selected ? 'bg-blue-600/30 text-white' : 'hover:bg-white/8 text-white/80'
        }`}
        style={{ paddingLeft: `${10 + depth * 18}px`, paddingRight: '8px' }}
        onClick={() => { setSelected((v) => !v); if (node.type === 'dir') setOpen((v) => !v) }}
      >
        {node.type === 'dir'
          ? <span className="text-white/35 text-[10px] w-3 flex-shrink-0">{open ? '▼' : '▶'}</span>
          : <span className="w-3 flex-shrink-0" />
        }
        <span className="flex-shrink-0">
          {node.type === 'dir' ? (open ? '📂' : '📁') : node.icon ?? '📄'}
        </span>
        <span className="flex-1 truncate">{node.name}</span>
        {node.type === 'file' && <span className="text-white/30 text-xs flex-shrink-0">{node.size}</span>}
      </div>
      {node.type === 'dir' && open && node.children?.map((child, i) => (
        <Node key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

const PLACES = ['📂 Home', '📥 Downloads', '🖥️ Desktop', '📄 Documents', '🖼️ Pictures', '🎵 Music']

export default function Files() {
  const [view, setView] = useState('list')
  const [search, setSearch] = useState('')

  return (
    <div className="flex h-full text-white">
      {/* Sidebar */}
      <div className="w-44 flex flex-col border-r border-white/8 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="px-3 py-2 border-b border-white/8">
          <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Places</span>
        </div>
        <div className="p-1.5 space-y-0.5 flex-1">
          {PLACES.map((p) => (
            <button
              key={p}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
        {/* Storage indicator */}
        <div className="px-3 py-3 border-t border-white/8">
          <div className="text-xs text-white/35 mb-1.5">Storage</div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }} />
          </div>
          <div className="text-[11px] text-white/30 mt-1">42.3 GB of 100 GB</div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8 flex-shrink-0">
          <button className="text-white/40 hover:text-white/80 text-sm transition-colors px-1">◀</button>
          <button className="text-white/40 hover:text-white/80 text-sm transition-colors px-1">▶</button>
          <button className="text-white/40 hover:text-white/80 text-sm transition-colors px-1">↑</button>
          <div className="flex-1 bg-white/8 rounded-lg px-3 py-1 text-sm text-white/50 border border-white/8">
            Home
          </div>
          <input
            className="bg-white/8 border border-white/8 rounded-lg px-2.5 py-1 text-sm text-white outline-none placeholder-white/30 w-28 focus:border-blue-500/50"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* File tree */}
        <div className="flex-1 overflow-y-auto p-2">
          <Node node={FS} depth={0} />
        </div>

        {/* Status bar */}
        <div className="px-4 py-1.5 border-t border-white/8 text-[11px] text-white/30 flex-shrink-0">
          5 items · Last modified Apr 25, 2025
        </div>
      </div>
    </div>
  )
}
