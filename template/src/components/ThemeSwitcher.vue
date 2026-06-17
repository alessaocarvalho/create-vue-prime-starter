<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import type { PresetKey } from '@/primevue/theme'
import type { FontSize } from '@/primevue/utils/themeUtils'

const { presetKey, setPreset, isDark, toggleDark, fontSize, setFontSize } = useTheme()

const PRESET_MAP: Record<PresetKey, { swatch: string; name: string }> = {
  skySlate: { swatch: 'bg-sky-500', name: 'Céu' },
  emeraldSlate: { swatch: 'bg-emerald-500', name: 'Esmeralda' },
  roseSlate: { swatch: 'bg-rose-500', name: 'Rosa' },
  yellowSlate: { swatch: 'bg-yellow-500', name: 'Amarelo' },
}

const FONT_SIZES: { key: FontSize; label: string; icon: string }[] = [
  { key: 'small', label: 'Menor', icon: 'pi pi-minus' },
  { key: 'medium', label: 'Padrão', icon: 'pi pi-circle-fill' },
  { key: 'large', label: 'Maior', icon: 'pi pi-plus' },
]

const menuRef = ref()
const toggle = (event: MouseEvent) => menuRef.value?.toggle(event)
</script>

<template>
  <div>
    <Button
      icon="pi pi-palette"
      rounded
      text
      severity="secondary"
      aria-label="Configurações de tema"
      v-tooltip.bottom="'Tema'"
      @click="toggle"
    />

    <Menu ref="menuRef" :popup="true" class="w-72 !p-3">
      <template #start>
        <div class="flex flex-col gap-4">
          <!-- Paleta de cores -->
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold uppercase tracking-widest text-surface-400">
              Paleta de cores
            </span>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="(item, key) in PRESET_MAP"
                :key="key"
                type="button"
                class="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                :class="presetKey === key ? 'ring-2 ring-primary' : ''"
                :aria-label="`Paleta ${item.name}`"
                @click="setPreset(key as PresetKey)"
              >
                <span class="size-6 rounded-full" :class="item.swatch" />
                <span class="text-[10px] text-surface-500">{{ item.name }}</span>
              </button>
            </div>
          </div>

          <!-- Tamanho da fonte -->
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold uppercase tracking-widest text-surface-400">
              Tamanho da fonte
            </span>
            <div class="flex gap-2">
              <Button
                v-for="size in FONT_SIZES"
                :key="size.key"
                :icon="size.icon"
                :label="size.label"
                size="small"
                :outlined="fontSize !== size.key"
                :severity="fontSize === size.key ? 'primary' : 'secondary'"
                class="flex-1"
                @click="setFontSize(size.key)"
              />
            </div>
          </div>

          <!-- Modo escuro -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-surface-700 dark:text-surface-200">
              {{ isDark ? 'Modo escuro' : 'Modo claro' }}
            </span>
            <ToggleSwitch :modelValue="isDark" @update:modelValue="toggleDark" />
          </div>
        </div>
      </template>
    </Menu>
  </div>
</template>
