# PS Proteção · Supervisão de Limpeza

> App desenvolvido para **HANIER Ind. Química** por **PS PROTEÇÃO**.

PWA de supervisão de limpeza com checklist por área, evidências fotográficas,
assinatura digital do supervisor e painel administrativo com indicadores.
Funciona offline em campo e sincroniza automaticamente quando a conexão volta.

---

## Índice

- [Instalação](#instalação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Configuração do Supabase](#configuração-do-supabase)
- [Execução local](#execução-local)
- [Banco de dados](#banco-de-dados)
- [Storage](#storage)
- [Usuário administrativo](#usuário-administrativo)
- [PWA](#pwa)
- [Deploy na Vercel](#deploy-na-vercel)
- [Estrutura do sistema](#estrutura-do-sistema)

---

## Instalação

Pré-requisitos: **Node.js 20+** e **npm**.

```bash
npm install
```

---

## Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env.local
```

| Variável | Onde encontrar | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | URL do projeto. Pública. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → chave `anon`/`publishable` | Pública. O acesso real é controlado por RLS (Row Level Security), não pela chave. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → chave `service_role` | **Nunca exposta no frontend.** Usada apenas em Server Actions/Route Handlers para tarefas administrativas. |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string → URI (modo *Session*) | Usada **apenas localmente** pelos scripts `npm run db:migrate` / `db:seed`. Nunca é lida pela aplicação em produção. |
| `NEXT_PUBLIC_APP_URL` | — | URL pública do app (metadados/PWA). Em produção, a URL da Vercel. |

> ⚠️ **Regra de segurança do projeto:** a `service_role key` nunca é usada no
> frontend. Variáveis sensíveis (`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`)
> só existem no servidor/terminal local — nunca com prefixo `NEXT_PUBLIC_`.

O arquivo `scripts/db-run.mjs` (usado pelos comandos `db:migrate`/`db:seed`)
lê a variável de um arquivo **`.env`** (sem o `.local`), separado do
`.env.local` que o Next.js usa. Se for rodar esses comandos, crie também um
`.env` com pelo menos a linha `DATABASE_URL=...`.

---

## Configuração do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Copie a **URL** e a **chave anônima/publicável** para o `.env.local` (ver
   seção acima).
3. Rode o schema — duas formas possíveis:

### Opção A — SQL Editor (mais simples)

No painel do Supabase → **SQL Editor** → *New query*, cole o conteúdo de
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) e
depois de [`supabase/seed/seed.sql`](supabase/seed/seed.sql), e clique em
**Run** em cada um.

> 💡 O editor do Supabase (Monaco) pode corromper colagens muito grandes com
> parênteses aninhados em várias linhas. Se aparecer um erro de sintaxe perto
> de um `;`, limpe o editor e cole novamente — os arquivos deste projeto já
> foram simplificados para evitar esse problema.

### Opção B — linha de comando (mais robusta)

Preencha `DATABASE_URL` no arquivo `.env` (ver seção anterior) e rode:

```bash
npm run db:setup
```

Isso executa `db:migrate` (schema, RLS e buckets de Storage) seguido de
`db:seed` (cliente Hanier, supervisores e checklist completo), direto contra
o Postgres — sem depender do navegador.

Migrations e seed são **idempotentes** (`on conflict do nothing`): rodar mais
de uma vez não duplica dados.

---

## Execução local

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000):

- `/` — fluxo de campo do supervisor (sem login, seleciona o próprio nome).
- `/admin` — painel administrativo (exige login).

Outros comandos úteis:

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run build        # build de produção (Next.js)
```

---

## Banco de dados

Schema definido em [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

**Tabelas principais:**

- `profiles` — supervisores (sem login) e administradores (com login).
- `locations` — clientes/postos atendidos (Hanier é o primeiro).
- `audit_areas` / `audit_items` — estrutura do checklist (setores e itens,
  com suporte a subitens via `parent_item_id`).
- `audits` — cada visita/auditoria realizada.
- `audit_responses` — resposta (conforme/não conforme) de cada item.
- `audit_photos` — evidências fotográficas por resposta.
- `audit_signatures` — assinatura digital do supervisor ao finalizar.
- `audit_events` — trilha de eventos para auditoria interna.

**Modelo de acesso (RLS):**

- Supervisores em campo não fazem login com e-mail/senha — o app abre uma
  sessão anônima do Supabase Auth no primeiro acesso do dispositivo
  (`auth.signInAnonymously()`), gerando um `auth.uid()` estável.
- Administradores fazem login normal e têm uma linha em `profiles` com
  `role = 'admin'`.
- Toda leitura/escrita de auditorias exige um usuário autenticado (anônimo
  ou admin) — a chave pública sozinha não lê nem escreve nada em tabelas
  transacionais.
- Cada auditoria guarda `created_by = auth.uid()`: um dispositivo só enxerga
  as auditorias que ele mesmo criou; administradores enxergam tudo.

Como fallback offline-first, a estrutura do checklist Hanier também está
espelhada em [`lib/constants/checklist.ts`](lib/constants/checklist.ts) —
se o app não conseguir buscar dados do Supabase (primeiro uso sem conexão),
ele funciona com esses dados fixos.

---

## Storage

Dois buckets **privados**, criados pela migration:

- `audit-photos` — evidências fotográficas. Caminho:
  `audit-photos/{auditId}/{itemId}/{arquivo}`.
- `audit-signatures` — assinatura digital. Caminho:
  `audit-signatures/{auditId}/signature.png`.

O acesso é controlado por políticas de RLS em `storage.objects`: um
dispositivo só lê/grava objetos das auditorias que criou; administradores
têm acesso a tudo. Nenhum bucket é público — arquivos são servidos via URLs
assinadas geradas pelo backend.

---

## Usuário administrativo

O seed não cria nenhum administrador (por segurança). Para criar o primeiro:

1. No Supabase → **Authentication → Users → Add user**, crie um usuário com
   e-mail e senha (marque *Auto Confirm User*).
2. Copie o **UID** desse usuário.
3. No **SQL Editor**, rode:

```sql
insert into profiles (user_id, name, role, active)
values ('COLE-O-UID-AQUI', 'Nome do Administrador', 'admin', true);
```

4. Acesse `/admin`, faça login com o e-mail e a senha criados.

---

## PWA

- Manifest gerado em [`app/manifest.ts`](app/manifest.ts) (`display: standalone`,
  cor de tema `#0C1566`, ícones normais e *maskable*).
- Service Worker em [`public/sw.js`](public/sw.js), registrado por
  [`components/shared/service-worker-registration.tsx`](components/shared/service-worker-registration.tsx).
- Fluxo de campo funciona **offline**: respostas, fotos e assinatura ficam
  em IndexedDB ([`lib/offline`](lib/offline)) e sincronizam automaticamente
  quando a conexão volta, com indicador visual de status
  ([`components/shared/save-indicator.tsx`](components/shared/save-indicator.tsx),
  [`components/shared/offline-banner.tsx`](components/shared/offline-banner.tsx)).
- Ícones gerados por `npm run icons` (script em
  [`scripts/generate-icons.mjs`](scripts/generate-icons.mjs)).

Em um celular, use "Adicionar à tela inicial" (Android/Chrome) ou "Adicionar
à Tela de Início" (iOS/Safari) para instalar o app.

---

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Na Vercel: **New Project** → importe o repositório.
3. Em **Environment Variables**, adicione as mesmas variáveis do
   `.env.local` (exceto `DATABASE_URL`, que é só para uso local):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → a URL final do projeto na Vercel
4. Deploy. O build roda `next build` automaticamente.

---

## Estrutura do sistema

```
app/
  (field)/            fluxo do supervisor em campo (sem login)
  admin/               painel administrativo (login + dashboard)
  layout.tsx            layout raiz — fontes, PWA, botão "LIVE", toasts
components/
  audit/                UI do fluxo de auditoria (checklist, assinatura, fotos)
  admin/                UI do painel administrativo
  shared/                offline banner, indicador de salvamento, botão LIVE
  ui/                    componentes base (Dialog, Button, Input, ...)
lib/
  supabase/              clientes Supabase (browser, server, middleware, admin)
  constants/              fixtures locais (checklist Hanier, escalas da equipe)
  offline/                fila de sincronização via IndexedDB
  validation/             schemas Zod
  utils/                   formatação, timezone, cálculo de escala em tempo real
supabase/
  migrations/             schema SQL (0001_init.sql)
  seed/                    dados iniciais (seed.sql)
types/
  database.ts             tipos que espelham o schema do Supabase
```

### Botão "LIVE"

Botão flutuante presente em todas as telas (ver
[`components/shared/live-status-button.tsx`](components/shared/live-status-button.tsx)).
Ao clicar, abre um pop-up mostrando, em tempo real, qual tarefa cada
colaboradora da equipe de limpeza está executando naquele exato momento —
calculado a partir das escalas semanais em
[`lib/constants/staff-schedules.ts`](lib/constants/staff-schedules.ts) e do
horário atual em `America/Sao_Paulo`
([`lib/utils/staff-schedule.ts`](lib/utils/staff-schedule.ts)). É um dado
local (fixture), não depende do banco — atualiza automaticamente a cada 30s
enquanto o pop-up estiver aberto.
