#!/usr/bin/env node
// @ts-check
import { cp, readFile, writeFile, rename, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, basename } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout, argv, exit } from 'node:process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = resolve(__dirname, '..', 'template')
const NPM_CMD = process.platform === 'win32' ? 'npm.cmd' : 'npm'

// Arquivos prefixados com "_" no template sao renomeados ao copiar
// (evita que ferramentas do gerador interpretem dotfiles do template).
const RENAME_MAP = {
  _gitignore: '.gitignore',
  '_env.example': '.env.example',
}

const PACKAGE_JSON_PATH = resolve(TEMPLATE_DIR, 'package.json')
const VUE_CLI_CLEANUP_PATHS = [
  'src/style.css',
  'src/assets/base.css',
  'src/assets/vue.svg',
  'src/components/HelloWorld.vue',
  'src/components/TheWelcome.vue',
  'src/components/WelcomeItem.vue',
  'public',
]

// Extensoes de texto que recebem substituicao de placeholders.
const TEXT_EXTENSIONS = new Set([
  '.json',
  '.js',
  '.mjs',
  '.ts',
  '.vue',
  '.html',
  '.css',
  '.md',
  '.example',
  '.gitignore',
])

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

function printHelp() {
  console.log(`
create-vue-prime-starter — Gerador Vue 3 + PrimeVue

Uso:
  npx create-vue-prime-starter <nome-do-projeto> [opcoes]

Opcoes:
  --install       Instala as dependencias automaticamente (padrao)
  --no-install    Pula a instalacao de dependencias
  -h, --help      Mostra esta ajuda

Exemplos:
  npx create-vue-prime-starter minha-app
  npx create-vue-prime-starter minha-app --install
  npx create-vue-prime-starter minha-app --no-install
`)
}

function isValidProjectName(name) {
  return /^[a-z0-9][a-z0-9-_.]*$/i.test(name)
}

async function ask(question, fallback) {
  const rl = createInterface({ input: stdin, output: stdout })
  try {
    const answer = (await rl.question(question)).trim()
    return answer || fallback
  } finally {
    rl.close()
  }
}

async function replacePlaceholders(filePath, replacements) {
  const ext = filePath.slice(filePath.lastIndexOf('.'))
  const isGitignore = basename(filePath) === '.gitignore'
  if (!TEXT_EXTENSIONS.has(ext) && !isGitignore) return

  let content
  try {
    content = await readFile(filePath, 'utf8')
  } catch {
    return
  }
  let next = content
  for (const [token, value] of Object.entries(replacements)) {
    next = next.split(token).join(value)
  }
  if (next !== content) await writeFile(filePath, next, 'utf8')
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

function toLatestInstallArgs(packages, baseArgs) {
  return [...baseArgs, ...packages.map((pkg) => `${pkg}@latest`)]
}

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (result.error) {
    console.error(`  Falha ao iniciar "${command} ${args.join(' ')}": ${result.error.message}`)
  } else if (result.status !== 0) {
    console.error(`  "${command} ${args.join(' ')}" saiu com codigo ${result.status}${result.signal ? ` (signal ${result.signal})` : ''}`)
  }
  return result
}

async function scaffoldVueProject(projectName) {
  const result = runCommand(NPM_CMD, ['create', 'vue@latest', projectName, '--', '--bare', '--typescript'], process.cwd())
  return result.status === 0
}

async function cleanupVueScaffold(targetDir) {
  for (const relativePath of VUE_CLI_CLEANUP_PATHS) {
    await rm(join(targetDir, relativePath), { force: true, recursive: true })
  }
}

async function installLatestDependencies(targetDir) {
  const rawPackageJson = await readFile(PACKAGE_JSON_PATH, 'utf8')
  const packageJson = JSON.parse(rawPackageJson)
  const dependencies = Object.keys(packageJson.dependencies ?? {})
  const devDependencies = Object.keys(packageJson.devDependencies ?? {})

  if (dependencies.length > 0) {
    const result = runCommand(NPM_CMD, toLatestInstallArgs(dependencies, ['install']), targetDir)
    if (result.status !== 0) return false
  }

  if (devDependencies.length > 0) {
    const result = runCommand(NPM_CMD, toLatestInstallArgs(devDependencies, ['install', '--save-dev']), targetDir)
    if (result.status !== 0) return false
  }

  return true
}

async function main() {
  const { name: cliName, install: cliInstall, help } = parseArgs(argv.slice(2))

  if (help) {
    printHelp()
    return
  }

  console.log('\n  create-vue-prime-starter — Vue 3 + PrimeVue\n')

  if (!existsSync(TEMPLATE_DIR)) {
    console.error('  Erro: diretorio de template nao encontrado em', TEMPLATE_DIR)
    exit(1)
  }

  let projectName = cliName
  while (!projectName || !isValidProjectName(projectName)) {
    projectName = await ask('  Nome do projeto: ', '')
    if (!isValidProjectName(projectName)) {
      console.log('  Nome invalido. Use letras, numeros, hifen, underscore ou ponto.')
      projectName = undefined
    }
  }

  const targetDir = resolve(process.cwd(), projectName)

  if (existsSync(targetDir)) {
    const dirContents = await readdir(targetDir).catch(() => [])
    if (dirContents.length > 0) {
      console.error(`  Erro: o diretorio "${projectName}" ja existe e nao esta vazio.`)
      exit(1)
    }
  }

  console.log(`\n  Gerando projeto em: ${targetDir}`)

  // Primeiro cria a base oficial do Vue com create-vue, sem prompt interativo.
  const scaffolded = await scaffoldVueProject(projectName)
  if (!scaffolded) {
    console.error('\n  Falha ao executar o create-vue. O projeto nao foi criado.')
    exit(1)
  }

  // Depois aplica o template do projeto por cima.
  await cp(TEMPLATE_DIR, targetDir, { recursive: true })

  // Renomeia arquivos especiais
  for (const [from, to] of Object.entries(RENAME_MAP)) {
    const fromPath = join(targetDir, from)
    if (existsSync(fromPath)) {
      await rename(fromPath, join(targetDir, to))
    }
  }

  // Remove arquivos residuais do scaffold base que nao fazem parte do template.
  await cleanupVueScaffold(targetDir)

  // Substitui placeholders
  const replacements = {
    '{{PROJECT_NAME}}': projectName,
  }
  const files = await walk(targetDir)
  for (const file of files) {
    await replacePlaceholders(file, replacements)
  }

  console.log('  Arquivos criados.')

  // Instalacao de dependencias
  const shouldInstall = cliInstall ?? true

  if (shouldInstall) {
    console.log('\n  Instalando dependencias mais recentes (npm install @latest)...\n')
    const ok = await installLatestDependencies(targetDir)
    if (!ok) {
      console.error('\n  A instalacao falhou. Voce pode rodar "npm install" manualmente.')
    }
  }

  console.log(`
  Pronto! Proximos passos:

    cd ${projectName}${shouldInstall ? '' : '\n    npm install'}
    cp .env.example .env   (ou copie manualmente no Windows)
    npm run dev

  Documentacao da arquitetura: README.md do projeto gerado.
`)
}

main().catch((err) => {
  console.error('\n  Erro inesperado:', err?.message ?? err)
  exit(1)
})
