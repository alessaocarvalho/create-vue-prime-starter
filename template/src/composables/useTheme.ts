import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme.store'
import type { PresetKey } from '@/primevue/theme'
import type { FontSize } from '@/primevue/utils/themeUtils'

/**
 * Fachada de leitura/escrita do tema para a UI.
 * Componentes consomem este composable em vez de acessar a store diretamente.
 */
export function useTheme() {
  const themeStore = useThemeStore()

  return {
    isDark: computed(() => themeStore.isDarkMode),
    presetKey: computed(() => themeStore.presetKey),
    fontSize: computed(() => themeStore.fontSize),
    availablePresets: computed(() => themeStore.availablePresets),
    setPreset: (preset: PresetKey) => themeStore.setPreset(preset),
    toggleDark: () => themeStore.toggleDark(),
    setDark: (isDark: boolean) => themeStore.setDark(isDark),
    setFontSize: (fontSize: FontSize) => themeStore.setFontSize(fontSize),
  }
}
