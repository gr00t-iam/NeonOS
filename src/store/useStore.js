import { create } from 'zustand'

export const APPS = [
  { id: 'browser',    name: 'Brave',          icon: '🦁',  defaultSize: { w: 900,  h: 580 } },
  { id: 'files',      name: 'Files',          icon: '📁',  defaultSize: { w: 720,  h: 520 } },
  { id: 'settings',   name: 'Settings',       icon: '⚙️',   defaultSize: { w: 640,  h: 520 } },
  { id: 'notes',      name: 'Notes',          icon: '📝',  defaultSize: { w: 720,  h: 540 } },
  { id: 'calculator', name: 'Calculator',     icon: '🧮',  defaultSize: { w: 320,  h: 500 } },
  { id: 'clock',      name: 'Clock',          icon: '🕐',  defaultSize: { w: 420,  h: 420 } },
  { id: 'sysmon',     name: 'System Monitor', icon: '📊',  defaultSize: { w: 640,  h: 520 } },
  { id: 'discord',    name: 'Discord',        icon: '💜',  defaultSize: { w: 960,  h: 640 } },
  { id: 'plexamp',    name: 'Plexamp',        icon: '🎵',  defaultSize: { w: 360,  h: 660 } },
  { id: 'paint',      name: 'Paint',          icon: '🎨',  defaultSize: { w: 960,  h: 660 } },
  { id: 'terminal',   name: 'Terminal',       icon: '💻',  defaultSize: { w: 740,  h: 480 } },
]

let winCounter = 0

const useStore = create((set, get) => ({
  wallpaper: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  apps: APPS,
  windows: [],
  maxZ: 100,
  launcherOpen: false,

  setWallpaper: (url) => set({ wallpaper: url }),
  toggleLauncher: () => set((s) => ({ launcherOpen: !s.launcherOpen })),

  openApp: (appId) => {
    const { windows, maxZ, apps } = get()
    const app = apps.find((a) => a.id === appId)
    if (!app) return

    const open = windows.find((w) => w.appId === appId && !w.minimized)
    if (open) {
      const z = maxZ + 1
      set((s) => ({ maxZ: z, windows: s.windows.map((w) => (w.id === open.id ? { ...w, zIndex: z } : w)), launcherOpen: false }))
      return
    }

    const min = windows.find((w) => w.appId === appId && w.minimized)
    if (min) {
      const z = maxZ + 1
      set((s) => ({ maxZ: z, windows: s.windows.map((w) => (w.id === min.id ? { ...w, minimized: false, zIndex: z } : w)), launcherOpen: false }))
      return
    }

    const offset = (winCounter % 8) * 30
    winCounter++
    const z = maxZ + 1
    set((s) => ({
      maxZ: z,
      launcherOpen: false,
      windows: [...s.windows, {
        id: `w-${Date.now()}-${winCounter}`,
        appId, title: app.name, icon: app.icon,
        x: 120 + offset, y: 60 + offset,
        width: app.defaultSize.w, height: app.defaultSize.h,
        zIndex: z, minimized: false,
      }],
    }))
  },

  closeWindow:    (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),
  minimizeWindow: (id) => set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)) })),
  bringToFront:   (id) => { const z = get().maxZ + 1; set((s) => ({ maxZ: z, windows: s.windows.map((w) => (w.id === id ? { ...w, zIndex: z } : w)) })) },
  updateWindowPos:(id, x, y) => set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)) })),
}))

export default useStore
