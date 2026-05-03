import { useState, useRef, useEffect } from 'react'

const ME = { id: 'me', name: 'neon_user', avatar: '🧑‍💻', color: '#5865F2', status: 'online' }

const SERVERS = [
  {
    id: 'home', icon: '🏠', name: 'Direct Messages',
    channels: [
      { id: 'dm1', name: 'ClaudeBot', type: 'dm', icon: '🤖', status: 'online' },
      { id: 'dm2', name: 'pixel_wolf', type: 'dm', icon: '🐺', status: 'idle' },
    ],
  },
  {
    id: 'neonos', icon: '💜', name: 'NeonOS Community',
    channels: [
      { id: 'info',       name: 'info',           type: 'category' },
      { id: 'rules',      name: 'rules',          type: 'text' },
      { id: 'announce',   name: 'announcements',  type: 'text' },
      { id: 'general',    name: 'general',        type: 'text' },
      { id: 'help',       name: 'help',           type: 'text' },
      { id: 'showcase',   name: 'showcase',       type: 'text' },
      { id: 'voice',      name: 'Voice Chat',     type: 'voice' },
      { id: 'music',      name: 'Music Lounge',   type: 'voice' },
    ],
  },
  {
    id: 'gaming', icon: '🎮', name: 'Game Night',
    channels: [
      { id: 'gchat',  name: 'general',      type: 'text' },
      { id: 'lfg',    name: 'looking-for-group', type: 'text' },
      { id: 'gvoice', name: 'Game Room',    type: 'voice' },
    ],
  },
]

const INITIAL_MSGS = {
  general: [
    { id:1, uid:'bot',  name:'NeonBot',    avatar:'🤖', color:'#57F287', content:'👋 Welcome to NeonOS Community! Check out #rules and #announcements.',  time:'10:00 AM', role:'bot' },
    { id:2, uid:'u1',   name:'pixel_wolf', avatar:'🐺', color:'#ED4245', content:'Anyone tried the new Paint app? It\'s actually really good!',             time:'10:14 AM' },
    { id:3, uid:'u2',   name:'synthwave_', avatar:'🎸', color:'#EB459E', content:'Yeah the flood fill tool is super fast. Canvas-based right?',              time:'10:15 AM' },
    { id:4, uid:'u1',   name:'pixel_wolf', avatar:'🐺', color:'#ED4245', content:'Yep, pure React + Canvas. No external libs.',                              time:'10:16 AM' },
    { id:5, uid:'u3',   name:'cypher99',   avatar:'⚡', color:'#FEE75C', content:'The Terminal is wild — you can actually ping IPs from it 🔥',               time:'10:32 AM' },
    { id:6, uid:'bot',  name:'NeonBot',    avatar:'🤖', color:'#57F287', content:'📢 **NeonOS v1.0.0** is now live! Try the new apps from the App Launcher.', time:'11:00 AM', role:'bot' },
  ],
  help: [
    { id:1, uid:'u2', name:'synthwave_', avatar:'🎸', color:'#EB459E', content:'How do I change the wallpaper?',                      time:'9:30 AM' },
    { id:2, uid:'bot', name:'NeonBot',   avatar:'🤖', color:'#57F287', content:'Right-click the desktop → Change Wallpaper, or open Settings app!', time:'9:30 AM', role:'bot' },
  ],
  showcase: [
    { id:1, uid:'u3', name:'cypher99', avatar:'⚡', color:'#FEE75C', content:'Made this in Paint app 🎨 [screenshot attached]', time:'Yesterday' },
  ],
  dm1: [
    { id:1, uid:'bot', name:'ClaudeBot', avatar:'🤖', color:'#57F287', content:'Hi! I\'m ClaudeBot. Ask me anything!', time:'10:00 AM', role:'bot' },
  ],
  dm2: [
    { id:1, uid:'u1', name:'pixel_wolf', avatar:'🐺', color:'#ED4245', content:'Hey! Loving NeonOS so far 🔥', time:'Yesterday' },
  ],
}

const MEMBERS = [
  { name:'NeonBot',    avatar:'🤖', color:'#57F287', status:'online',  role:'Bot' },
  { name:'neon_user',  avatar:'🧑‍💻', color:'#5865F2', status:'online',  role:'Admin' },
  { name:'pixel_wolf', avatar:'🐺', color:'#ED4245', status:'idle',    role:'Member' },
  { name:'synthwave_', avatar:'🎸', color:'#EB459E', status:'online',  role:'Member' },
  { name:'cypher99',   avatar:'⚡', color:'#FEE75C', status:'dnd',     role:'Member' },
  { name:'void_runner',avatar:'🌌', color:'#9B59B6', status:'offline', role:'Member' },
]

const STATUS_COLOR = { online:'#3BA55D', idle:'#FAA61A', dnd:'#ED4245', offline:'#747F8D' }

function Avatar({ avatar, status, size = 8 }) {
  return (
    <div className={`relative flex-shrink-0 w-${size} h-${size} rounded-full flex items-center justify-center text-base`}
      style={{ background: '#36393f' }}>
      {avatar}
      {status && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
          style={{ background: STATUS_COLOR[status], borderColor: '#2f3136' }} />
      )}
    </div>
  )
}

export default function Discord() {
  const [server,   setServer]   = useState('neonos')
  const [channel,  setChannel]  = useState('general')
  const [messages, setMessages] = useState(INITIAL_MSGS)
  const [input,    setInput]    = useState('')
  const [showMembers, setShowMembers] = useState(true)
  const bottomRef = useRef(null)

  const srv = SERVERS.find(s => s.id === server)
  const ch  = srv?.channels.find(c => c.id === channel)
  const msgs = messages[channel] || []

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = () => {
    const text = input.trim()
    if (!text) return
    const msg = { id: Date.now(), uid: 'me', name: ME.name, avatar: ME.avatar, color: ME.color, content: text, time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }
    setMessages(prev => ({ ...prev, [channel]: [...(prev[channel] || []), msg] }))
    setInput('')

    // Auto-bot reply in dm1
    if (channel === 'dm1') {
      setTimeout(() => {
        const reply = { id: Date.now()+1, uid:'bot', name:'ClaudeBot', avatar:'🤖', color:'#57F287',
          content: `You said: "${text}". I'm a demo bot — real Discord integration requires OAuth!`, time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }), role:'bot' }
        setMessages(prev => ({ ...prev, dm1: [...(prev.dm1 || []), reply] }))
      }, 800)
    }
  }

  return (
    <div className="flex h-full" style={{ background: '#313338' }}>
      {/* Server list */}
      <div className="flex flex-col items-center gap-2 py-3 px-2 flex-shrink-0"
        style={{ background: '#1e1f22', width: 72 }}>
        {SERVERS.map(s => (
          <button key={s.id} title={s.name} onClick={() => { setServer(s.id); setChannel(s.channels.find(c=>c.type!=='category'&&c.type!=='voice')?.id || '') }}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
              server === s.id ? 'rounded-2xl bg-indigo-500' : 'bg-white/10 hover:rounded-2xl hover:bg-indigo-500'
            }`}>
            {s.icon}
          </button>
        ))}
        <div className="w-8 border-t border-white/10 my-1" />
        <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-green-500 hover:rounded-2xl flex items-center justify-center text-green-400 text-2xl transition-all" title="Add Server">+</button>
      </div>

      {/* Channel list */}
      <div className="flex flex-col flex-shrink-0" style={{ background: '#2b2d31', width: 220 }}>
        <div className="px-4 py-3 font-semibold text-white border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: 'rgba(0,0,0,0.2)', fontSize: 15 }}>
          {srv?.name}
          <button className="text-white/50 hover:text-white text-lg">⚙️</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {srv?.channels.map(c => (
            c.type === 'category' ? (
              <div key={c.id} className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/35">
                {c.name}
              </div>
            ) : (
              <button key={c.id} onClick={() => c.type !== 'voice' && setChannel(c.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors mb-0.5 ${
                  channel === c.id ? 'bg-white/10 text-white' :
                  c.type === 'voice' ? 'text-white/40 hover:text-white/70 hover:bg-white/5' :
                  'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}>
                <span className="text-white/40 text-base">
                  {c.type === 'voice' ? '🔊' : c.type === 'dm' ? null : '#'}
                </span>
                {c.type === 'dm' && <Avatar avatar={c.icon} status={c.status} size={6} />}
                <span className="truncate">{c.name}</span>
              </button>
            )
          ))}
        </div>
        {/* User panel */}
        <div className="flex items-center gap-2 px-2 py-2 flex-shrink-0" style={{ background: '#232428' }}>
          <Avatar avatar={ME.avatar} status={ME.status} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{ME.name}</div>
            <div className="text-xs text-white/40">#0001</div>
          </div>
          <div className="flex gap-1">
            {['🎤','🔇','⚙️'].map(icon => (
              <button key={icon} className="text-white/50 hover:text-white text-sm w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 transition-colors">{icon}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(0,0,0,0.3)', background: '#313338' }}>
          <span className="text-white/50 font-bold">{ch?.type === 'dm' ? '' : '#'}</span>
          <span className="font-semibold text-white">{ch?.name || channel}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-white/50">
            <button onClick={() => setShowMembers(v=>!v)} className="hover:text-white transition-colors" title="Toggle members">👥</button>
            <button className="hover:text-white transition-colors" title="Search">🔍</button>
            <button className="hover:text-white transition-colors" title="Inbox">📥</button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
          {msgs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-white/30">
              <div className="text-5xl mb-3">#</div>
              <p className="font-semibold text-white/50">Welcome to #{channel}!</p>
              <p className="text-sm mt-1">This is the start of the channel.</p>
            </div>
          )}
          {msgs.map((msg, i) => {
            const prev = msgs[i-1]
            const grouped = prev && prev.uid === msg.uid
            return (
              <div key={msg.id} className={`flex gap-4 hover:bg-white/3 rounded px-2 py-0.5 group ${grouped ? '' : 'mt-4'}`}>
                {grouped ? (
                  <span className="w-10 flex-shrink-0 text-white/0 group-hover:text-white/30 text-[10px] text-right pt-0.5 select-none">{msg.time}</span>
                ) : (
                  <Avatar avatar={msg.avatar} status={null} />
                )}
                <div className="flex-1 min-w-0">
                  {!grouped && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-semibold text-sm" style={{ color: msg.color }}>{msg.name}</span>
                      {msg.role === 'bot' && <span className="text-[10px] px-1 rounded" style={{ background: '#5865F2', color: 'white' }}>BOT</span>}
                      <span className="text-white/30 text-xs">{msg.time}</span>
                    </div>
                  )}
                  <p className="text-sm text-white/85 leading-relaxed break-words"
                    dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: '#383a40' }}>
            <button className="text-white/40 hover:text-white text-lg transition-colors" title="Attach file">+</button>
            <input
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30"
              placeholder={`Message ${ch?.type === 'dm' ? '' : '#'}${ch?.name || channel}`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            />
            <div className="flex gap-2 text-white/40">
              <button className="hover:text-white transition-colors">🎁</button>
              <button className="hover:text-white transition-colors">🎞️</button>
              <button className="hover:text-white transition-colors">😊</button>
              <button onClick={send} disabled={!input.trim()}
                className="hover:text-indigo-400 disabled:opacity-25 transition-colors">➤</button>
            </div>
          </div>
        </div>
      </div>

      {/* Members list */}
      {showMembers && (
        <div className="flex-shrink-0 overflow-y-auto py-4 px-3" style={{ background: '#2b2d31', width: 200 }}>
          {['Admin','Bot','Member','Offline'].map(role => {
            const mems = MEMBERS.filter(m => (role === 'Offline' ? m.status === 'offline' : m.role === role) && (role !== 'Offline' || m.role === 'Member'))
            const online = MEMBERS.filter(m => m.role === role && m.status !== 'offline')
            if (role !== 'Offline' && online.length === 0) return null
            const displayed = role === 'Offline' ? MEMBERS.filter(m => m.status === 'offline') : online
            if (displayed.length === 0) return null
            return (
              <div key={role} className="mb-4">
                <div className="text-xs font-semibold text-white/35 uppercase tracking-wider px-2 mb-2">
                  {role === 'Offline' ? `Offline — ${displayed.length}` : `${role} — ${displayed.length}`}
                </div>
                {displayed.map(m => (
                  <div key={m.name} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/8 cursor-pointer group">
                    <Avatar avatar={m.avatar} status={m.status} />
                    <span className={`text-sm font-medium truncate ${m.status === 'offline' ? 'text-white/30' : 'text-white/80'}`}>{m.name}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
