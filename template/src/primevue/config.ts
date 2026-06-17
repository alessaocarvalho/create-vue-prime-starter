import { getStoredPreset } from '@/primevue/utils/themeUtils'
import { presets, type PresetKey } from '@/primevue/theme'
import { ptBR } from '@/primevue/locale'

const presetKey = getStoredPreset() as PresetKey
const preset = presets[presetKey]

export const primeVueConfig = {
  locale: ptBR,
  theme: {
    preset,
    options: {
      darkModeSelector: '.dark',
    },
  },
}
