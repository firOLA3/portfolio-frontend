import { useCallback, useState } from 'react'
import { useOSStore } from '../../../store/useOSStore'

const WALLPAPERS = [
  { id: 'bloom', name: 'Bloom', gradient: 'from-indigo-950 via-slate-950 to-slate-900' },
  { id: 'ocean', name: 'Ocean', gradient: 'from-blue-950 via-cyan-950 to-blue-900' },
  { id: 'forest', name: 'Forest', gradient: 'from-green-950 via-emerald-950 to-green-900' },
  { id: 'sunset', name: 'Sunset', gradient: 'from-orange-950 via-red-950 to-purple-900' },
  { id: 'midnight', name: 'Midnight', gradient: 'from-slate-950 to-slate-900' },
  { id: 'aurora', name: 'Aurora', gradient: 'from-purple-950 via-pink-950 to-red-900' },
]

const ACCENT_COLORS = [
  { name: 'Blue', value: '#0078d4' },
  { name: 'Purple', value: '#8661c5' },
  { name: 'Green', value: '#00b050' },
  { name: 'Red', value: '#e81123' },
  { name: 'Orange', value: '#ffb900' },
  { name: 'Pink', value: '#e946a5' },
  { name: 'Teal', value: '#00b7c3' },
  { name: 'Cyan', value: '#00bcd4' },
]

function Personalize() {
  const wallpaper = useOSStore((s) => s.wallpaper)
  const setWallpaper = useOSStore((s) => s.setWallpaper)
  const theme = useOSStore((s) => s.theme)
  const setTheme = useOSStore((s) => s.setTheme)
  
  const [accentColor, setAccentColor] = useState(
    localStorage.getItem('accentColor') || '#0078d4'
  )
  const [soundsEnabled, setSoundsEnabled] = useState(
    localStorage.getItem('soundsEnabled') !== 'false'
  )

  const handleWallpaperSelect = (wp) => {
    setWallpaper(wp)
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const handleAccentColorChange = (color) => {
    setAccentColor(color)
    localStorage.setItem('accentColor', color)
    document.documentElement.style.setProperty('--win-accent', color)
  }

  const handleSoundsToggle = () => {
    const newState = !soundsEnabled
    setSoundsEnabled(newState)
    localStorage.setItem('soundsEnabled', String(newState))
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950 text-slate-950 dark:text-white rounded-b-win-lg">
      <div className="border-b border-slate-200 dark:border-white/10 px-6 py-4">
        <h2 className="text-lg font-semibold">Personalize</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 p-6">
        {/* Wallpaper Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
            Wallpaper
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {WALLPAPERS.map((wp) => (
              <button
                key={wp.id}
                onClick={() => handleWallpaperSelect(wp.id)}
                className={`h-20 rounded-win border-2 transition-all bg-gradient-to-br ${wp.gradient} ${
                  wallpaper === wp.id
                    ? 'border-[var(--win-accent)] scale-105'
                    : 'border-slate-300 dark:border-white/20'
                }`}
                title={wp.name}
              />
            ))}
          </div>
        </div>

        {/* Theme Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
            Theme
          </h3>
          <div className="flex gap-3">
            {[
              { id: 'light', label: '☀️ Light', color: 'from-slate-50 to-slate-100' },
              { id: 'dark', label: '🌙 Dark', color: 'from-slate-900 to-slate-950' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={handleThemeToggle}
                className={`flex-1 py-4 rounded-win border-2 font-medium transition-all ${t.id === theme ? `border-[var(--win-accent)] bg-gradient-to-br ${t.color}` : 'border-slate-300 dark:border-white/20'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
            Accent Color
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleAccentColorChange(color.value)}
                className={`h-12 rounded-win border-2 transition-all ${
                  accentColor === color.value
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-white/20'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {accentColor === color.value && (
                  <span className="text-white font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sounds Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
            Sounds
          </h3>
          <button
            onClick={handleSoundsToggle}
            className={`w-full py-3 rounded-win border-2 font-medium transition-all ${
              soundsEnabled
                ? 'border-[var(--win-accent)] bg-[var(--win-accent)]/10'
                : 'border-slate-300 dark:border-white/20'
            }`}
          >
            {soundsEnabled ? '🔊 Sounds Enabled' : '🔇 Sounds Disabled'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Personalize
