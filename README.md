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
