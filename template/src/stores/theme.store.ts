import { presets, type PresetKey } from '@/primevue/theme'
import {
  applyDarkModeClass,
  applyFontSizeClass,
  getStoredDarkMode,
  getStoredPreset,
  getStoredFontSize,
  setStoredDarkMode,
  setStoredPreset,
  setStoredFontSize,
  type FontSize,
} from '@/primevue/utils/themeUtils'
import { updatePreset } from '@primeuix/themes'
import { defineStore } from 'pinia'

/**
 * Store de tema: fonte unica da verdade para paleta, modo escuro e tamanho
 * de fonte. Persistencia e feita via localStorage (themeUtils).
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({
    presetKey: getStoredPreset() as PresetKey,
    isDarkMode: getStoredDarkMode(),
    fontSize: getStoredFontSize() as FontSize,
  }),

  getters: {
    currentPreset: (state) => presets[state.presetKey],
    availablePresets: () => Object.keys(presets) as PresetKey[],
  },

  actions: {
    setPreset(presetKey: PresetKey) {
      this.presetKey = presetKey
      setStoredPreset(presetKey)
      updatePreset(presets[presetKey])
    },

    toggleDark() {
      this.isDarkMode = !this.isDarkMode
      setStoredDarkMode(this.isDarkMode)
    },

    setDark(isDark: boolean) {
      this.isDarkMode = isDark
      setStoredDarkMode(isDark)
    },

    setFontSize(fontSize: FontSize) {
      this.fontSize = fontSize
      setStoredFontSize(fontSize)
    },

    initializeTheme() {
      applyDarkModeClass(this.isDarkMode)
      applyFontSizeClass(this.fontSize)
      updatePreset(presets[this.presetKey])
    },
  },
})
