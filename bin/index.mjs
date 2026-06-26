#!/usr/bin/env node
// @ts-check
import { cp, readFile, writeFile, rename, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, basename } from 'node:path'
import { spawnSync } from 'node:child_process'
import { stdin as input, stdout as output, argv, exit } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { checkbox, select, input as inquirerInput, confirm } from '@inquirer/prompts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = resolve(__dirname, '..', 'template')
const NPM_CMD = process.platform === 'win32' ? 'npm.cmd' : 'npm'

// Cores para o terminal (ANSI)
const C = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
}

const RENAME_MAP = {
  _gitignore: '.gitignore',
  '_env.example': '.env.example',
}

const VUE_CLI_CLEANUP_PATHS = [
  'src/style.css',
  'src/assets/base.css',
  'src/assets/vue.svg',
  'src/components/HelloWorld.vue',
  'src/components/TheWelcome.vue',
  'src/components/WelcomeItem.vue',
  'public',
]

const TEXT_EXTENSIONS = new Set(['.json', '.js', '.mjs', '.ts', '.vue', '.html', '.css', '.md', '.example', '.gitignore'])

// --- AUXILIARES DE INTERFACE ---

function printHeader() {
  console.clear()
  console.log(`\n  ${C.magenta}⚡ ${C.bright}CREATE-VUE-PRIME-STARTER${C.reset} ${C.dim}v2.0${C.reset}`)
  console.log(`  ${C.dim}Customize seu boilerplate Vue 3 + PrimeVue rapidamente${C.reset}\n`)
  console.log(`${C.dim}────────────────────────────────────────────────────────────${C.reset}\n`)
}

async function askProjectName(fallback) {
  const name = await inquirerInput({
    message: 'Nome do seu projeto:',
    default: fallback ?? 'vue-prime-app',
    validate: (value) => {
      if (!value) return 'O nome não pode ser vazio.'
      if (!/^[a-z0-9][a-z0-9-_.]*$/i.test(value)) {
        return 'Use apenas letras, números, hífens ou underscores.'
      }
      return true
    },
  })
  return name
}

async function askFeatures() {
  return checkbox({
    message: 'Quais recursos do template deseja incluir?',
    choices: [
      {
        name: 'Fluxo de login protegido - telas, layouts e guards de rota',
        value: 'auth-flow',
        checked: true,
      },
      {
        name: 'Stores Pinia prontas - auth, tema, erros e exemplo de dominio',
        value: 'pinia-stores',
        checked: true,
      },
      {
        name: 'Cliente HTTP - HttpClient, interceptors e service de exemplo',
        value: 'http-client',
        checked: true,
      },
      {
        name: 'Seletor de paleta - cores, modo escuro e tamanho da fonte',
        value: 'theme-switcher',
        checked: true,
      },
      {
        name: 'Tratamento global de erros - ErrorDialog e fila de erros',
        value: 'error-handling',
        checked: true,
      },
    ],
    instructions: `  ${C.dim}(Espaço para marcar/desmarcar, Enter para confirmar)${C.reset}`,
  })
}

async function askTheme() {
  return select({
    message: 'Escolha o tema inicial do PrimeVue:',
    choices: [
      {
        name: 'Aura  – Moderno / Clean',
        value: 'aura',
        description: 'Linhas limpas e espaçamento generoso. Ideal para dashboards e apps SaaS.',
      },
      {
        name: 'Lara  – Corporativo / Elegante',
        value: 'lara',
        description: 'Refinado e profissional. Ótimo para sistemas internos e portais empresariais.',
      },
      {
        name: 'Nora  – Compacto / Datacentric',
        value: 'nora',
        description: 'Denso e eficiente. Perfeito para tabelas, grids e interfaces de dados.',
      },
    ],
  })
}

async function askInstall() {
  return confirm({
    message: 'Instalar dependências automaticamente (npm install)?',
    default: true,
  })
}

// --- FUNÇÕES DE ARQUIVOS E COMANDOS ---

function parseArgs(args) {
  const result = { name: undefined, install: undefined, help: false }
  for (const arg of args) {
    if (arg === '--help' || arg === '-h') result.help = true
    else if (arg === '--install') result.install = true
    else if (arg === '--no-install') result.install = false
    else if (!arg.startsWith('-') && !result.name) result.name = arg
  }
  return result
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else files.push(full)
  }
  return files
}

async function replacePlaceholders(filePath, replacements) {
  const ext = filePath.slice(filePath.lastIndexOf('.'))
  const isGitignore = basename(filePath) === '.gitignore'
  if (!TEXT_EXTENSIONS.has(ext) && !isGitignore) return

  let content
  try { content = await readFile(filePath, 'utf8') } catch { return }
  let next = content
  for (const [token, value] of Object.entries(replacements)) {
    next = next.split(token).join(value)
  }
  if (next !== content) await writeFile(filePath, next, 'utf8')
}

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  })
  return result.status === 0
}

// --- LÓGICA DE CUSTOMIZAÇÃO DO TEMPLATE ---

function normalizeTemplateFeatures(features) {
  const selected = new Set(features)

  if (selected.has('auth-flow')) {
    selected.add('pinia-stores')
    selected.add('http-client')
    selected.add('error-handling')
  }

  if (selected.has('theme-switcher')) selected.add('pinia-stores')
  if (selected.has('error-handling')) selected.add('pinia-stores')
  if (selected.has('pinia-stores')) selected.add('http-client')

  return selected
}

function hasFeature(features, feature) {
  return features.has(feature)
}

async function configurePackageJson(targetDir, projectName, features) {
  const pkgPath = join(targetDir, 'package.json')
  let pkg = {}

  if (existsSync(pkgPath)) {
    pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
  } else {
    pkg = { name: projectName, version: '0.0.0', dependencies: {}, devDependencies: {} }
  }

  pkg.name = projectName
  pkg.dependencies ??= {}
  pkg.devDependencies ??= {}

  if (!hasFeature(features, 'pinia-stores')) {
    delete pkg.dependencies.pinia
    delete pkg.dependencies['pinia-plugin-persistedstate']
  }

  if (!hasFeature(features, 'auth-flow')) delete pkg.dependencies['vue-router']
  if (!hasFeature(features, 'http-client')) delete pkg.dependencies.axios

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2), 'utf8')
}

async function cleanUnusedFeatures(targetDir, features) {
  const usesPinia = hasFeature(features, 'pinia-stores')
  const usesAuth = hasFeature(features, 'auth-flow')
  const usesHttp = hasFeature(features, 'http-client')
  const usesThemeSwitcher = hasFeature(features, 'theme-switcher')
  const usesErrorHandling = hasFeature(features, 'error-handling')

  if (!usesAuth) {
    await rm(join(targetDir, 'src/router'), { force: true, recursive: true })
    await rm(join(targetDir, 'src/layouts'), { force: true, recursive: true })
    await rm(join(targetDir, 'src/views/LoginView.vue'), { force: true })
  }

  if (!usesPinia) {
    await rm(join(targetDir, 'src/stores'), { force: true, recursive: true })
    await rm(join(targetDir, 'src/composables'), { force: true, recursive: true })
    await rm(join(targetDir, 'src/types/user.d.ts'), { force: true })
  }

  if (!usesHttp) {
    await rm(join(targetDir, 'src/api/HttpClient.ts'), { force: true })
    await rm(join(targetDir, 'src/api/index.ts'), { force: true })
    await rm(join(targetDir, 'src/api/interceptors'), { force: true, recursive: true })
    await rm(join(targetDir, 'src/api/errors'), { force: true, recursive: true })
    await rm(join(targetDir, 'src/api/services'), { force: true, recursive: true })
    await rm(join(targetDir, 'src/types/example.d.ts'), { force: true })
  } else if (!usesErrorHandling) {
    await writeHttpClientWithoutErrorHandling(targetDir)
  }

  if (!usesThemeSwitcher) {
    await rm(join(targetDir, 'src/components/ThemeSwitcher.vue'), { force: true })
    await rm(join(targetDir, 'src/composables/useTheme.ts'), { force: true })
    await rm(join(targetDir, 'src/stores/theme.store.ts'), { force: true })
  }

  if (!usesErrorHandling) {
    await rm(join(targetDir, 'src/components/ErrorDialog.vue'), { force: true })
    await rm(join(targetDir, 'src/stores/error.store.ts'), { force: true })
    await rm(join(targetDir, 'src/api/interceptors/error.interceptor.ts'), { force: true })
    await rm(join(targetDir, 'src/api/errors'), { force: true, recursive: true })
    await rm(join(targetDir, 'src/api/types/error.d.ts'), { force: true })
  }

  await writeAppMain(targetDir, { usesAuth, usesPinia, usesThemeSwitcher })

  if (!usesAuth) {
    await writeStandaloneApp(targetDir, { usesErrorHandling })
  } else if (!usesThemeSwitcher) {
    await writeAuthLayoutsWithoutThemeSwitcher(targetDir)
  }

  if (!usesPinia || !usesHttp || !usesErrorHandling) {
    await writeSimpleHomeView(targetDir)
  }
}

async function writeAppMain(targetDir, { usesAuth, usesPinia, usesThemeSwitcher }) {
  const piniaImports = usesPinia
    ? "import { createPinia } from 'pinia'\nimport piniaPluginPersistedstate from 'pinia-plugin-persistedstate'\n"
    : ''
  const themeStoreImport = usesThemeSwitcher ? "import { useThemeStore } from '@/stores/theme.store'\n" : ''
  const routerImport = usesAuth ? "import router from './router'\n" : ''
  const piniaSetup = usesPinia
    ? "const pinia = createPinia()\npinia.use(piniaPluginPersistedstate)\n\napp.use(pinia)\n"
    : ''
  const routerSetup = usesAuth ? 'app.use(router)\n' : ''
  const themeSetup = usesThemeSwitcher ? '\nuseThemeStore().initializeTheme()\n' : ''

  await writeFile(
    join(targetDir, 'src/main.ts'),
    `import '@/assets/main.css'\nimport { createApp } from 'vue'\n${piniaImports}${themeStoreImport}import App from './App.vue'\n${routerImport}import { setupPrimeVue } from './primevue'\nimport {\n  applyDarkModeClass,\n  applyFontSizeClass,\n  getStoredDarkMode,\n  getStoredFontSize,\n} from '@/primevue/utils/themeUtils'\n\n// Aplica preferencias visuais antes do mount para evitar "flash" de tema.\napplyDarkModeClass(getStoredDarkMode())\napplyFontSizeClass(getStoredFontSize())\n\nconst app = createApp(App)\n${piniaSetup}${routerSetup}setupPrimeVue(app)\n${themeSetup}\napp.mount('#app')\n`,
    'utf8',
  )
}

async function writeStandaloneApp(targetDir, { usesErrorHandling }) {
  await writeFile(
    join(targetDir, 'src/App.vue'),
    `<script setup lang="ts">\nimport HomeView from '@/views/HomeView.vue'\n${usesErrorHandling ? "import ErrorDialog from '@/components/ErrorDialog.vue'\n" : ''}</script>\n\n<template>\n  <main class="min-h-screen bg-surface-50 dark:bg-surface-950">\n    <section class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">\n      <HomeView />\n    </section>\n  </main>\n${usesErrorHandling ? '  <ErrorDialog />\n  <Toast />\n' : ''}</template>\n`,
    'utf8',
  )
}

async function writeSimpleHomeView(targetDir) {
  await writeFile(
    join(targetDir, 'src/views/HomeView.vue'),
    `<template>\n  <div class="flex flex-col gap-6">\n    <div>\n      <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-50">Ola, mundo</h2>\n      <p class="text-surface-500 dark:text-surface-400">\n        Template Vue 3 + PrimeVue pronto para evoluir a sua aplicacao.\n      </p>\n    </div>\n\n    <Card>\n      <template #title>{{ '{{PROJECT_NAME}}' }}</template>\n      <template #content>\n        <p class="m-0 text-surface-600 dark:text-surface-300">\n          Adicione suas telas, services e stores conforme os recursos escolhidos para este projeto.\n        </p>\n      </template>\n    </Card>\n  </div>\n</template>\n`,
    'utf8',
  )
}

async function writeHttpClientWithoutErrorHandling(targetDir) {
  await writeFile(
    join(targetDir, 'src/api/HttpClient.ts'),
    `import type { AxiosInstance, AxiosRequestConfig } from 'axios'\nimport axios from 'axios'\nimport { setupAuthInterceptor } from '@/api/interceptors/auth.interceptor'\n\n/**\n * Cliente HTTP base da aplicacao.\n *\n * Centraliza a criacao da instancia Axios, registra o interceptor de\n * autenticacao e expoe metodos tipados que ja retornam o "data" da resposta.\n */\nexport class HttpClient {\n  protected client: AxiosInstance\n\n  constructor(baseURL: string) {\n    this.client = axios.create({\n      baseURL,\n      withCredentials: true,\n    })\n\n    setupAuthInterceptor(this.client)\n  }\n\n  get instance() {\n    return this.client\n  }\n\n  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {\n    const { data } = await this.client.get<T>(url, config)\n    return data\n  }\n\n  async post<T, P = unknown>(url: string, payload?: P, config?: AxiosRequestConfig): Promise<T> {\n    const { data } = await this.client.post<T>(url, payload, config)\n    return data\n  }\n\n  async put<T, P = unknown>(url: string, payload?: P, config?: AxiosRequestConfig): Promise<T> {\n    const { data } = await this.client.put<T>(url, payload, config)\n    return data\n  }\n\n  async patch<T, P = unknown>(url: string, payload?: P, config?: AxiosRequestConfig): Promise<T> {\n    const { data } = await this.client.patch<T>(url, payload, config)\n    return data\n  }\n\n  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {\n    const { data } = await this.client.delete<T>(url, config)\n    return data\n  }\n}\n`,
    'utf8',
  )
}

async function writeAuthLayoutsWithoutThemeSwitcher(targetDir) {
  await writeFile(
    join(targetDir, 'src/layouts/AuthLayout.vue'),
    `<script setup lang="ts">\nimport { useAuthStore } from '@/stores/auth.store'\nimport { computed } from 'vue'\nimport { useRouter } from 'vue-router'\n\nconst authStore = useAuthStore()\nconst router = useRouter()\n\nconst primeiroNome = computed(() => authStore.user?.nome?.trim().split(/\\s+/)[0] ?? 'Usuario')\n\nconst logout = async () => {\n  authStore.clearUser()\n  await router.push({ name: 'login' })\n}\n</script>\n\n<template>\n  <main class="min-h-screen bg-surface-50 dark:bg-surface-950">\n    <header class="px-6 py-3 border-b border-surface-200 dark:border-surface-800">\n      <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">\n        <div class="leading-tight">\n          <h1 class="text-lg font-semibold text-surface-900 dark:text-surface-50">\n            {{ '{{PROJECT_NAME}}' }}\n          </h1>\n          <p class="text-sm text-surface-500 dark:text-surface-400">Vue 3 + PrimeVue</p>\n        </div>\n\n        <div class="flex items-center gap-2">\n          <div class="flex items-center gap-2 pl-2">\n            <Avatar :label="primeiroNome.charAt(0).toUpperCase()" shape="circle" />\n            <span class="hidden text-sm font-semibold text-surface-900 dark:text-surface-50 sm:inline">\n              {{ primeiroNome }}\n            </span>\n          </div>\n          <Button\n            icon="pi pi-sign-out"\n            rounded\n            text\n            severity="secondary"\n            aria-label="Sair"\n            v-tooltip.bottom="'Sair'"\n            @click="logout"\n          />\n        </div>\n      </div>\n    </header>\n\n    <section class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">\n      <RouterView />\n    </section>\n  </main>\n</template>\n`,
    'utf8',
  )

  await writeFile(
    join(targetDir, 'src/layouts/PublicLayout.vue'),
    `<template>\n  <main class="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">\n    <section\n      class="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8"\n    >\n      <RouterView />\n    </section>\n  </main>\n</template>\n`,
    'utf8',
  )
}

// --- FLUXO PRINCIPAL ---

async function main() {
  const { name: cliName, install: cliInstall, help } = parseArgs(argv.slice(2))

  if (help) {
    console.log(`  ${C.bright}Uso:${C.reset} npx create-vue-prime-starter <nome-do-projeto> [opcoes]`)
    exit(0)
  }

  printHeader()

  if (!existsSync(TEMPLATE_DIR)) {
    console.error(`  ${C.red}❌ Erro:${C.reset} Diretório de template não encontrado em: ${TEMPLATE_DIR}`)
    exit(1)
  }

  // --- PROMPTS INTERATIVOS ---
  const projectName = cliName ?? await askProjectName()

  const targetDir = resolve(process.cwd(), projectName)
  if (existsSync(targetDir) && (await readdir(targetDir).catch(() => [])).length > 0) {
    console.error(`  ${C.red}❌ Erro:${C.reset} O diretório "${projectName}" já existe e não está vazio.`)
    exit(1)
  }

  console.log()
  const selectedFeatures = normalizeTemplateFeatures(await askFeatures())

  console.log()
  const selectedTheme = await askTheme()

  const shouldInstall = cliInstall ?? await askInstall()

  // --- EXECUÇÃO ---
  console.log(`\n  ${C.cyan}⚙  Construindo sua aplicação sob medida...${C.reset}\n`)

  console.log(`  ${C.dim}[1/5]${C.reset} Criando estrutura base do Vue 3...`)
  const scaffolded = runCommand(NPM_CMD, ['create', 'vue@latest', projectName, '--', '--bare', '--typescript'], process.cwd())

  if (!scaffolded) {
    console.error(`  ${C.red}❌ Falha ao executar o create-vue.${C.reset}`)
    exit(1)
  }

  console.log(`  ${C.dim}[2/5]${C.reset} Mesclando componentes e presets do PrimeVue...`)
  await cp(TEMPLATE_DIR, targetDir, { recursive: true })

  for (const [from, to] of Object.entries(RENAME_MAP)) {
    const fromPath = join(targetDir, from)
    if (existsSync(fromPath)) await rename(fromPath, join(targetDir, to))
  }

  console.log(`  ${C.dim}[3/5]${C.reset} Customizando recursos e injetando tema: ${selectedTheme}...`)
  await rm(join(targetDir, 'src/style.css'), { force: true })
  await cleanUnusedFeatures(targetDir, selectedFeatures)
  await configurePackageJson(targetDir, projectName, selectedFeatures)

  const capitalizedTheme = selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)
  const replacements = {
    '{{PROJECT_NAME}}': projectName,
    '{{THEME_NAME}}': selectedTheme,
    '{{THEME_NAME_CAPITALIZED}}': capitalizedTheme,
  }

  const files = await walk(targetDir)
  for (const file of files) {
    await replacePlaceholders(file, replacements)
  }

  if (shouldInstall) {
    console.log(`  ${C.dim}[4/5]${C.reset} Instalando dependências (via npm install)...`)
    const installOk = runCommand(NPM_CMD, ['install'], targetDir)
    if (!installOk) {
      console.log(`  ${C.yellow}⚠ Falha na instalação automática. Prossiga manualmente.${C.reset}`)
    }
  } else {
    console.log(`  ${C.dim}[4/5]${C.reset} Instalação de dependências pulada.`)
  }

  console.log(`  ${C.dim}[5/5]${C.reset} Finalizando estrutura...`)

  console.log(`\n  ${C.green}✨ Projeto criado com sucesso! Ready to code. ✨${C.reset}\n`)
  console.log(`  ${C.bright}Próximos passos:${C.reset}`)
  console.log(`    ${C.cyan}cd${C.reset} ${projectName}`)
  if (!shouldInstall) console.log(`    ${C.cyan}npm install${C.reset}`)
  console.log(`    ${C.cyan}npm run dev${C.reset}\n`)
}

main().catch((err) => {
  console.error(`\n  ${C.red}❌ Erro inesperado:${C.reset}`, err?.message ?? err)
  exit(1)
})
