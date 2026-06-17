import {
  Avatar,
  Badge,
  Button,
  Card,
  Column,
  ConfirmDialog,
  DataTable,
  Dialog,
  Divider,
  Drawer,
  IconField,
  InputIcon,
  InputText,
  Menu,
  Message,
  ProgressSpinner,
  Select,
  Skeleton,
  Tag,
  Toast,
  ToggleSwitch,
} from 'primevue'
import type { App } from 'vue'

/**
 * Registro global de componentes PrimeVue.
 * Adicione/remova componentes nesta lista conforme a necessidade do projeto.
 */
const components = [
  { name: 'Avatar', component: Avatar },
  { name: 'Badge', component: Badge },
  { name: 'Button', component: Button },
  { name: 'Card', component: Card },
  { name: 'Column', component: Column },
  { name: 'ConfirmDialog', component: ConfirmDialog },
  { name: 'DataTable', component: DataTable },
  { name: 'Dialog', component: Dialog },
  { name: 'Divider', component: Divider },
  { name: 'Drawer', component: Drawer },
  { name: 'IconField', component: IconField },
  { name: 'InputIcon', component: InputIcon },
  { name: 'InputText', component: InputText },
  { name: 'Menu', component: Menu },
  { name: 'Message', component: Message },
  { name: 'ProgressSpinner', component: ProgressSpinner },
  { name: 'Select', component: Select },
  { name: 'Skeleton', component: Skeleton },
  { name: 'Tag', component: Tag },
  { name: 'Toast', component: Toast },
  { name: 'ToggleSwitch', component: ToggleSwitch },
]

export const setupComponents = (app: App) => {
  components.forEach(({ name, component }) => {
    app.component(name, component)
  })
}
