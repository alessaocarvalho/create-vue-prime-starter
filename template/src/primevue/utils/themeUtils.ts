const PRESET_KEY = 'primevue_preset'
const DARK_MODE_KEY = 'primevue_dark_mode'
const FONT_SIZE_KEY = 'primevue_font_size'

const VALID_PRESETS = ['sky', 'emerald', 'rose', 'yellow']
const DEFAULT_PRESET = 'sky'

export type FontSize = 'small' | 'medium' | 'large'

export const getStoredPreset = (): string => {
  const stored = localStorage.getItem(PRESET_KEY)
  if (stored && VALID_PRESETS.includes(stored)) return stored
  return DEFAULT_PRESET
}

export const setStoredPreset = (preset: string): void => {
  localStorage.setItem(PRESET_KEY, preset)
}

export const getStoredDarkMode = (): boolean => {
  const stored = localStorage.getItem(DARK_MODE_KEY)
  if (stored !== null) return stored === 'true'

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

export const setStoredDarkMode = (isDarkMode: boolean): void => {
  localStorage.setItem(DARK_MODE_KEY, isDarkMode.toString())
  applyDarkModeClass(isDarkMode)
}

export const applyDarkModeClass = (isDarkMode: boolean): void => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const getStoredFontSize = (): FontSize => {
  const stored = localStorage.getItem(FONT_SIZE_KEY)
  return (stored as FontSize) || 'medium'
}

export const setStoredFontSize = (fontSize: FontSize): void => {
  localStorage.setItem(FONT_SIZE_KEY, fontSize)
  applyFontSizeClass(fontSize)
}

export const applyFontSizeClass = (fontSize: FontSize): void => {
  document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg')
  if (fontSize === 'small') {
    document.documentElement.classList.add('text-sm')
  } else if (fontSize === 'large') {
    document.documentElement.classList.add('text-lg')
  }

  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
    })
  }
}
