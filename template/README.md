# {{PROJECT_NAME}}

Aplicacao Vue 3 + PrimeVue gerada com **create-vue-prime-starter**, pronta para sistema
de temas, layouts, camada HTTP, stores Pinia e tratamento centralizado de
erros.

## Stack

- Vue 3 (Composition API + `<script setup>`)
- PrimeVue 4 + `@primeuix/themes` (preset Aura)
- Pinia + `pinia-plugin-persistedstate`
- Vue Router
- Axios (via `HttpClient`)
- Tailwind CSS 4 + `tailwindcss-primeui`
- TypeScript (strict) + Vite

## Como rodar

```bash
npm install
cp .env.example .env   # no Windows: copy .env.example .env
npm run dev
```

Scripts:

| Script             | Descricao                          |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Servidor de desenvolvimento (Vite) |
| `npm run build`    | Type-check + build de producao     |
| `npm run preview`  | Pre-visualiza o build              |
| `npm run type-check` | Checagem de tipos (vue-tsc)      |
| `npm run lint`     | ESLint com correcao automatica     |
| `npm run format`   | Prettier                           |

## Estrutura

```
src/
  api/                 # Camada de dados
    HttpClient.ts      # Cliente Axios base + metodos tipados
    errors/            # Normalizacao de erros (AxiosError -> ErrorDisplay)
    interceptors/      # auth (request) e error (response)
    services/          # Services de dominio (estendem HttpClient)
    types/             # Tipos da camada de API (error.d.ts)
  components/
    ErrorDialog.vue    # Dialog global de erros (consome error.store)
    ThemeSwitcher.vue  # Paleta, fonte e modo escuro
  composables/
    useTheme.ts        # Fachada do tema para a UI
  layouts/
    AuthLayout.vue     # Area autenticada
    PublicLayout.vue   # Area publica (login)
  primevue/            # Configuracao centralizada do PrimeVue
    config.ts          # locale + tema
    theme.ts           # Presets (paletas)
    locale.ts          # pt-BR
    components/         # Registro global de componentes
    directives/        # Registro global de diretivas
    utils/themeUtils   # Persistencia de preferencias (localStorage)
  router/              # Rotas + guard de autenticacao
  stores/              # auth, error, theme, example
  types/               # Tipos de dominio globais
  views/               # HomeView (hello world) + LoginView
```

## Conceitos demonstrados

- **Sistema de temas**: 4 paletas, modo claro/escuro e 3 tamanhos de fonte,
  persistidos em `localStorage` e aplicados antes do mount (sem flash).
- **Camada HTTP**: `HttpClient` centraliza Axios e interceptors; services de
  dominio o estendem (`ExampleService`).
- **Tratamento de erros**: o `error.interceptor` normaliza qualquer erro e o
  empilha em `error.store`, exibido pelo `ErrorDialog`. O botao "Simular erro"
  na Home demonstra o fluxo sem backend.
- **Autenticacao e guard**: login simulado, `route guard` global e expiracao de
  sessao automatica em respostas `401`.
- **Stores Pinia**: padrao com `loadingState`, getters e actions assincronas.

## Proximos passos

1. Configure `VITE_API_BASE_URL` no `.env` para apontar para sua API.
2. Substitua o login simulado (`auth.store.ts`) pela autenticacao real.
3. Troque `ExampleService` por seus services de dominio e remova o mock.
