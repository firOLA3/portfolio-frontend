// Utility for managing UI sounds
// Sounds are gated by user gesture and respect the sounds toggle

const SOUNDS = {
  startup: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
  popopen: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
  windowclose:
    'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
  hover: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
}

let soundsEnabled = localStorage.getItem('soundsEnabled') !== 'false'
let hasUserGesture = false

// Detect user gesture
document.addEventListener(
  'click',
  () => {
    hasUserGesture = true
  },
  { once: true }
)

document.addEventListener(
  'keydown',
  () => {
    hasUserGesture = true
  },
  { once: true }
)

document.addEventListener(
  'touchstart',
  () => {
    hasUserGesture = true
  },
  { once: true }
)

export const soundService = {
  setSoundsEnabled: (enabled) => {
    soundsEnabled = enabled
    localStorage.setItem('soundsEnabled', String(enabled))
  },

  isSoundsEnabled: () => soundsEnabled && hasUserGesture,

  play: (soundKey) => {
    if (!soundService.isSoundsEnabled()) return

    try {
      const audio = new Audio(SOUNDS[soundKey])
      audio.volume = 0.3
      audio.play().catch(() => {
        // Silently fail if audio can't play
      })
    } catch (err) {
      // Silently fail
    }
  },

  // Pre-load sounds
  preload: () => {
    Object.values(SOUNDS).forEach((sound) => {
      try {
        const audio = new Audio(sound)
        audio.volume = 0
        audio.play().catch(() => {})
      } catch (err) {
        // Silently fail
      }
    })
  },
}

export default soundService
