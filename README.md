# create-vue-prime-starter

Gerador de aplicacoes **Vue 3 + PrimeVue** com base no scaffold oficial do
Vue, pronto para temas, layouts, `HttpClient`, stores Pinia e tratamento
centralizado de erros.

Cada projeto gerado parte do scaffold oficial do Vue (`create-vue`) e depois
recebe a estrutura completa do projeto, com exemplos comentados de cada
camada.

## Uso

A partir desta pasta do projeto:

```bash
# Modo interativo
node bin/index.mjs

# Informando o nome direto
node bin/index.mjs minha-app

# Sem prompts (CI / scripts)
node bin/index.mjs minha-app --install
node bin/index.mjs minha-app --no-install
```

O projeto e criado em `./<nome-do-projeto>` relativo ao diretorio atual.
O fluxo interno e:

1. cria a base com `create-vue`;
2. aplica o template do projeto por cima;
3. instala as dependencias mais recentes disponiveis.

### Como pacote npm (opcional)

Publicado/instalado como pacote, pode ser usado via `npx`:

```bash
npx create-vue-prime-starter minha-app
```

Para testar localmente sem publicar:

```bash
cd packages/create-gpc-app
npm link
create-vue-prime-starter minha-app
```

## Opcoes

| Opcao          | Descricao                              |
| -------------- | -------------------------------------- |
| `<nome>`       | Nome/pasta do projeto a ser criado     |
| `--install`    | Roda a instalacao automaticamente       |
| `--no-install` | Pula a instalacao de dependencias      |
| `-h, --help`   | Mostra a ajuda                         |

## O que e gerado

- Vue 3 + Composition API + TypeScript (strict) + Vite
- PrimeVue 4 + `@primeuix/themes` com 4 paletas, modo escuro e tamanho de fonte
- Pinia (+ persisted state), Vue Router com guard de autenticacao
- Camada HTTP (`HttpClient`, interceptors, services) + normalizacao de erros
- `ErrorDialog` global e `ThemeSwitcher`
- Tailwind CSS 4 + `tailwindcss-primeui`

As versoes das dependencias sao resolvidas no momento da criacao para pegar as
versoes mais recentes disponiveis. O template `template/package.json` define
quais pacotes sao instalados.

## Estrutura do gerador

```
packages/create-gpc-app/
  bin/index.mjs     # CLI (cria base com create-vue, aplica o template, substitui {{PROJECT_NAME}})
  template/         # Aplicacao base que e sobreposta na base oficial do Vue
  package.json      # Metadados + bin
```

### Como o template funciona

- Arquivos `_gitignore` e `_env.example` sao renomeados para `.gitignore` e
  `.env.example` ao aplicar o template.
- O token `{{PROJECT_NAME}}` e substituido pelo nome informado em todos os
  arquivos de texto.

Para evoluir o template, basta editar os arquivos em `template/`. Se precisar
alterar a base oficial do Vue ou a limpeza de arquivos residuais, isso fica em
`bin/index.mjs`.
