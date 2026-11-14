# Gym Track

React + Vite + Cloudflare Workers + D1.

## Deploy
- Build: `npm run build`
- Deploy: `npx wrangler deploy`
- D1 database binding: `DB` (configured in wrangler.jsonc)

## Recreate the remote D1 schema
The new schema is in `migrations/0001_init.sql`. Apply it to the remote database:

```bash
npx wrangler d1 execute gym-track-db --remote --file=./migrations/0001_init.sql
```

You can also paste the SQL file contents into the D1 dashboard's SQL console. This migration creates the tables `users`, `workouts`, `exercises`, and `exercise_logs`.

## Atualização: alongamentos por treino
Esta versão adiciona a tabela `stretches`. **Não execute novamente `0001_init.sql`**: o banco já existente deve receber somente a nova migração.

Aplique no banco D1 remoto antes de publicar o Worker:

```bash
npx wrangler d1 execute gym-track-db --remote --file=./migrations/0002_stretches.sql
```

Ou cole o conteúdo de `migrations/0002_stretches.sql` no SQL Console do D1. A migração cria a tabela de alongamentos vinculada ao treino.

Os checkboxes são apenas controles visuais da sessão atual: marcar um alongamento não cria registro de execução nem aparece no histórico. Ao recarregar a página, os checks voltam a ficar desmarcados; a lista de alongamentos cadastrados permanece salva no D1.
