import { Ripple, StyleClass, Tooltip } from 'primevue'
import type { App } from 'vue'

const directives = [
  { name: 'tooltip', directive: Tooltip },
  { name: 'ripple', directive: Ripple },
  { name: 'styleclass', directive: StyleClass },
]

export const setupDirectives = (app: App) => {
  directives.forEach(({ name, directive }) => {
    app.directive(name, directive)
  })
}
