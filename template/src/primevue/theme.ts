import { definePreset } from '@primeuix/themes'
import type { Preset } from '@primeuix/themes/types'
import {{THEME_NAME_CAPITALIZED}} from '@primeuix/themes/{{THEME_NAME}}'

/**
 * Define presets de tema reutilizando o preset {{THEME_NAME_CAPITALIZED}} do PrimeVue.
 * Cada preset altera apenas a cor primaria, mantendo a superficie (surface)
 * compartilhada.
 */
const createScale = (color: string) => ({
  50: `{${color}.50}`,
  100: `{${color}.100}`,
  200: `{${color}.200}`,
  300: `{${color}.300}`,
  400: `{${color}.400}`,
  500: `{${color}.500}`,
  600: `{${color}.600}`,
  700: `{${color}.700}`,
  800: `{${color}.800}`,
  900: `{${color}.900}`,
  950: `{${color}.950}`,
})

const sharedSurface = {
  semantic: {
    colorScheme: {
      light: { surface: createScale('zinc') },
      dark: { surface: createScale('zinc') },
    },
  },
}

const createPrimaryPreset = (base: Preset, primaryColor: string): Preset =>
  definePreset(base, sharedSurface, {
    semantic: {
      primary: createScale(primaryColor),
    },
  })

export const presets = {
  sky: createPrimaryPreset({{THEME_NAME_CAPITALIZED}}, 'sky'),
  emerald: createPrimaryPreset({{THEME_NAME_CAPITALIZED}}, 'emerald'),
  rose: createPrimaryPreset({{THEME_NAME_CAPITALIZED}}, 'rose'),
  yellow: createPrimaryPreset({{THEME_NAME_CAPITALIZED}}, 'yellow'),
} satisfies Record<string, Preset>

export type PresetKey = keyof typeof presets