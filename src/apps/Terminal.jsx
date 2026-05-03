import { useState, useRef, useEffect, useCallback } from 'react'

// Mock filesystem (mirrors Files.jsx)
const FS = {
  '': { type: 'dir', children: {
    'home': { type: 'dir', children: {
      'neon-user': { type: 'dir', children: {
        'Documents': { type: 'dir', children: {
          'Resume.pdf':            { type: 'file', size: '142 KB' },
          'Project_Proposal.docx': { type: 'file', size: '88 KB' },
          'Budget.xlsx':           { type: 'file', size: '54 KB' },
        }},
        'Pictures': { type: 'dir', children: {
          'Vacation': { type: 'dir', children: {
            'beach.jpg':  { type: 'file', size: '3.2 MB' },
            'sunset.jpg': { type: 'file', size: '2.8 MB' },
          }},
          'profile.png': { type: 'file', size: '512 KB' },
        }},
        'Downloads': { type: 'dir', children: {
          'installer.exe': { type: 'file', size: '24 MB' },
          'archive.zip':   { type: 'file', size: '156 MB' },
        }},
        '.bashrc':  { type: 'file', size: '256 B',  content: '# NeonOS bash config\nexport PATH="$HOME/bin:$PATH"\nalias ll="ls -la"\nalias gs="git status"' },
        '.profile': { type: 'file', size: '128 B',  content: '# NeonOS profile\n. ~/.bashrc' },
      }},
    }},
    'etc': { type: 'dir', children: {
      'hostname':  { type: 'file', size: '8 B',   content: 'neonos' },
      'os-release': { type: 'file', size: '256 B', content: 'NAME="NeonOS"\nVERSION="1.0.0"\nID=neonos\nPRETTY_NAME="NeonOS 1.0.0"' },
    }},
    'var': { type: 'dir', children: {
      'log': { type: 'dir', children: {
        'system.log': { type: 'file', size: '2.3 MB', content: '[INFO] NeonOS booted successfully\n[INFO] All services started\n[INFO] Desktop environment loaded' },
      }},
    }},
  }},
}

function resolvePath(cwd, input) {
  if (input === undefined || input === '') return cwd
  if (input.startsWith('/')) return input.replace(/\/+$/, '') || '/'
  const parts = cwd.split('/').filter(Boolean)
  for (const seg of input.split('/')) {
    if (seg === '..') parts.pop()
    else if (seg !== '.') parts.push(seg)
  }
  return '/' + parts.join('/')
}

function getNode(path) {
  const parts = path.replace(/^\//, '').split('/').filter(Boolean)
  let node = FS['']
  for (const part of parts) {
    if (!node || node.type !== 'dir') return null
    node = node.children[part]
  }
  return node
}

const NEOFETCH = `
\x1b[35m    ███╗   ██╗███████╗ ██████╗ ███╗   ██╗\x1b[0m  \x1b[1mUser:\x1b[0m neon-user@neonos
\x1b[35m    ████╗  ██║██╔════╝██╔═══██╗████╗  ██║\x1b[0m  \x1b[1mOS:\x1b[0m NeonOS 1.0.0
\x1b[35m    ██╔██╗ ██║█████╗  ██║   ██║██╔██╗ ██║\x1b[0m  \x1b[1mKernel:\x1b[0m Web 5.0 (Browser)
\x1b[35m    ██║╚██╗██║██╔══╝  ██║   ██║██║╚██╗██║\x1b[0m  \x1b[1mShell:\x1b[0m nsh 1.0
\x1b[35m    ██║ ╚████║███████╗╚██████╔╝██║ ╚████║\x1b[0m  \x1b[1mResolution:\x1b[0m ${screen.width}x${screen.height}
\x1b[35m    ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝\x1b[0m  \x1b[1mCPU:\x1b[0m ${navigator.hardwareConcurrency || '?'} cores
                                              \x1b[1mMemory:\x1b[0m ${navigator.deviceMemory || '?'} GB`

export default function Terminal() {
  const [lines, setLines]     = useState([
    { type: 'banner', text: 'NeonOS Terminal v1.0.0\nType \x1b[33mhelp\x1b[0m for available commands.\n' },
  ])
  const [input, setInput]     = useState('')
  const [cwd, setCwd]         = useState('/home/neon-user')
  const [cmdHistory, setCmdHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [lines])

  const prompt = `\x1b[32mneon-user\x1b[0m@\x1b[35mneonos\x1b[0m:\x1b[34m${cwd.replace('/home/neon-user','~')}\x1b[0m$`

  const pushLine = (text, type = 'output') =>
    setLines((p) => [...p, { type, text }])

  const runCommand = useCallback(async (raw) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    setCmdHistory((h) => [trimmed, ...h])
    setHistIdx(-1)
    pushLine(`${prompt} ${trimmed}`, 'cmd')

    const [cmd, ...args] = trimmed.split(/\s+/)

    switch (cmd.toLowerCase()) {
      case 'help':
        pushLine([
          '\x1b[1mAvailable commands:\x1b[0m',
          '  \x1b[33mls\x1b[0m [path]        — list directory',
          '  \x1b[33mcd\x1b[0m [path]        — change directory',
          '  \x1b[33mpwd\x1b[0m             — print working directory',
          '  \x1b[33mcat\x1b[0m <file>       — print file contents',
          '  \x1b[33mmkdir\x1b[0m <name>     — create directory (simulated)',
          '  \x1b[33mtouch\x1b[0m <name>     — create file (simulated)',
          '  \x1b[33mrm\x1b[0m <name>        — remove file (simulated)',
          '  \x1b[33mecho\x1b[0m <text>      — print text',
          '  \x1b[33mping\x1b[0m <host>      — ping a host via HTTP',
          '  \x1b[33mdate\x1b[0m             — show current date/time',
          '  \x1b[33mwhoami\x1b[0m          — show current user',
          '  \x1b[33mhostname\x1b[0m        — show hostname',
          '  \x1b[33muname\x1b[0m [-a]       — system information',
          '  \x1b[33mneofetch\x1b[0m        — system info (fancy)',
          '  \x1b[33mhistory\x1b[0m         — show command history',
          '  \x1b[33mclear\x1b[0m           — clear terminal',
          '  \x1b[33mexit\x1b[0m            — close terminal (close window)',
        ].join('\n'))
        break

      case 'clear':
        setLines([])
        break

      case 'pwd':
        pushLine(cwd)
        break

      case 'whoami':
        pushLine('neon-user')
        break

      case 'hostname':
        pushLine('neonos')
        break

      case 'date':
        pushLine(new Date().toString())
        break

      case 'echo':
        pushLine(args.join(' '))
        break

      case 'uname':
        pushLine(args.includes('-a')
          ? 'NeonOS 1.0.0 browser-kernel #1 SMP Web x86_64 NeonOS/1.0'
          : 'NeonOS')
        break

      case 'neofetch':
        pushLine(NEOFETCH)
        break

      case 'history':
        pushLine(cmdHistory.map((h, i) => `  ${cmdHistory.length - i}  ${h}`).join('\n') || 'No history')
        break

      case 'ls': {
        const path = resolvePath(cwd, args[0])
        const node = getNode(path)
        if (!node) { pushLine(`\x1b[31mls: ${args[0] || path}: No such file or directory\x1b[0m`); break }
        if (node.type === 'file') { pushLine(args[0]); break }
        const entries = Object.entries(node.children)
        if (!entries.length) { pushLine('(empty)'); break }
        const out = entries.map(([name, n]) => {
          const isDir = n.type === 'dir'
          const color = isDir ? '\x1b[34m' : ''
          const suffix = isDir ? '/' : ''
          const size = n.size ? `\x1b[2m${n.size.padStart(8)}\x1b[0m  ` : ' '.repeat(10)
          return `${size}${color}${name}${suffix}\x1b[0m`
        })
        pushLine('total ' + entries.length + '\n' + out.join('\n'))
        break
      }

      case 'cd': {
        const path = resolvePath(cwd, args[0] || '/home/neon-user')
        const node = getNode(path)
        if (!node) { pushLine(`\x1b[31mcd: ${args[0]}: No such file or directory\x1b[0m`); break }
        if (node.type !== 'dir') { pushLine(`\x1b[31mcd: ${args[0]}: Not a directory\x1b[0m`); break }
        setCwd(path)
        break
      }

      case 'cat': {
        if (!args[0]) { pushLine('\x1b[31mcat: missing operand\x1b[0m'); break }
        const path = resolvePath(cwd, args[0])
        const node = getNode(path)
        if (!node) { pushLine(`\x1b[31mcat: ${args[0]}: No such file or directory\x1b[0m`); break }
        if (node.type === 'dir') { pushLine(`\x1b[31mcat: ${args[0]}: Is a directory\x1b[0m`); break }
        pushLine(node.content || `(binary file, ${node.size})`)
        break
      }

      case 'mkdir':
        if (!args[0]) { pushLine('\x1b[31mmkdir: missing operand\x1b[0m'); break }
        pushLine(`\x1b[2mDirectory '${args[0]}' created (simulated)\x1b[0m`)
        break

      case 'touch':
        if (!args[0]) { pushLine('\x1b[31mtouch: missing operand\x1b[0m'); break }
        pushLine(`\x1b[2mFile '${args[0]}' created (simulated)\x1b[0m`)
        break

      case 'rm':
        if (!args[0]) { pushLine('\x1b[31mrm: missing operand\x1b[0m'); break }
        pushLine(`\x1b[2mRemoved '${args[0]}' (simulated)\x1b[0m`)
        break

      case 'ping': {
        const host = args[0]
        if (!host) { pushLine('\x1b[31mUsage: ping <hostname or IP>\x1b[0m'); break }
        pushLine(`PING ${host}: 56 data bytes`)
        const results = []
        for (let i = 0; i < 4; i++) {
          try {
            const t0 = performance.now()
            await fetch(`https://${host}/favicon.ico`, {
              mode: 'no-cors',
              signal: AbortSignal.timeout(4000),
              cache: 'no-store',
            })
            const rtt = (performance.now() - t0).toFixed(1)
            const line = `64 bytes from ${host}: icmp_seq=${i+1} ttl=64 time=${rtt} ms`
            results.push({ ok: true, line })
            pushLine(`\x1b[32m${line}\x1b[0m`)
          } catch (e) {
            const line = `Request timeout for icmp_seq ${i+1}`
            results.push({ ok: false, line })
            pushLine(`\x1b[31m${line}\x1b[0m`)
          }
          await new Promise(r => setTimeout(r, 200))
        }
        const rx = results.filter(r => r.ok).length
        const loss = Math.round(((4 - rx) / 4) * 100)
        pushLine(`\n--- ${host} ping statistics ---\n4 packets transmitted, ${rx} received, ${loss}% packet loss`)
        break
      }

      case 'exit':
        pushLine('\x1b[2mClose the window to exit.\x1b[0m')
        break

      default:
        pushLine(`\x1b[31m${cmd}: command not found\x1b[0m\nType \x1b[33mhelp\x1b[0m for available commands.`)
    }
  }, [cwd, prompt, cmdHistory])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      runCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIdx = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(newIdx)
      setInput(cmdHistory[newIdx] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIdx = Math.max(histIdx - 1, -1)
      setHistIdx(newIdx)
      setInput(newIdx === -1 ? '' : cmdHistory[newIdx])
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      pushLine(`${prompt} ${input}^C`, 'cmd')
      setInput('')
    }
  }

  // ANSI color rendering (simplified)
  const renderAnsi = (text) => {
    const parts = text.split(/(\x1b\[[0-9;]*m)/)
    let style = {}
    return parts.map((part, i) => {
      const m = part.match(/\x1b\[([0-9;]*)m/)
      if (m) {
        const codes = m[1].split(';').map(Number)
        const newStyle = { ...style }
        for (const code of codes) {
          if (code === 0)  { Object.assign(newStyle, { color: undefined, fontWeight: undefined, opacity: undefined }) }
          if (code === 1)  newStyle.fontWeight = 'bold'
          if (code === 2)  newStyle.opacity = '0.5'
          if (code === 31) newStyle.color = '#f87171'
          if (code === 32) newStyle.color = '#4ade80'
          if (code === 33) newStyle.color = '#facc15'
          if (code === 34) newStyle.color = '#60a5fa'
          if (code === 35) newStyle.color = '#c084fc'
          if (code === 36) newStyle.color = '#22d3ee'
          if (code === 37) newStyle.color = '#f1f5f9'
        }
        style = newStyle
        return null
      }
      return <span key={i} style={style}>{part}</span>
    })
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d1117', fontFamily: 'monospace' }}
      onClick={() => inputRef.current?.focus()}>
      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed" style={{ color: '#e2e8f0' }}>
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words mb-0.5">
            {renderAnsi(line.text)}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input line */}
      <div className="flex items-center px-4 py-2 border-t border-white/8 flex-shrink-0"
        style={{ background: '#0d1117' }}>
        <span className="text-sm whitespace-pre mr-2 flex-shrink-0" style={{ color: '#e2e8f0' }}>
          {renderAnsi(prompt + ' ')}
        </span>
        <input
          ref={inputRef}
          autoFocus
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: '#e2e8f0', caretColor: '#4ade80', fontFamily: 'monospace' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
        />
        <span className="animate-pulse ml-1 text-green-400 text-sm">█</span>
      </div>
    </div>
  )
}
