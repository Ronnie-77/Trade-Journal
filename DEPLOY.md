# Trade Journal — Deploy Guide

## Local setup

```bash
bun install
bun run db:generate   # generate Prisma client
bun run db:push       # create/sync the SQLite database (empty, no demo data)
bun run dev           # start dev server on http://localhost:3000
```

The database is a fresh, empty SQLite file at `db/custom.db` (relative path in `.env`).
All demo trades and uploaded demo images have been removed.

## Production build

```bash
bun run build
bun run start
```

## Deploying to Cloudflare

This app currently uses **Prisma + SQLite (file-based)**. Cloudflare's
serverless runtime (Pages/Workers) does **not** support a persistent
file-based SQLite database — you must switch to a hosted database.

### Recommended: Cloudflare D1

1. Create a D1 database:
   ```bash
   wrangler d1 create trade-journal
   wrangler d1 execute trade-journal --file=./prisma/migrations/0_init/migration.sql
   ```
2. Replace the Prisma SQLite datasource with the D1 adapter:
   - `bun add @prisma/adapter-d1`
   - Update `src/lib/db.ts` to instantiate `PrismaClient` with the
     `PrismaD1` adapter bound to the D1 binding from `wrangler.toml`.
   - Set `DATABASE_URL` to the D1 connection string.
3. Add `next.config.ts` setup for Cloudflare Pages (`@cloudflare/next-on-pages`
   or the Next.js `output: 'standalone'` + workers adapter).
4. Configure `wrangler.toml` with the D1 binding and deploy:
   ```bash
   npx @cloudflare/next-on-pages
   wrangler pages deploy
   ```

### Alternative databases

If you prefer not to use D1, swap the Prisma datasource to any hosted DB
(Neon/Supabase Postgres, PlanetScale MySQL, Turso SQLite). Update
`prisma/schema.prisma` `datasource db` provider + `DATABASE_URL` accordingly.

## Theme system

The app ships with 8 color themes (4 dark + 4 light) selectable from the
palette dropdown in the top nav. The selected theme persists in
`localStorage` (key: `goldscalp-palette`). All theme tokens are CSS variables
defined in `src/app/globals.css` under `[data-palette="..."]` blocks.

## Notes

- `public/uploads/` — stores trade screenshot uploads at runtime (starts empty).
- `db/custom.db` — the SQLite file (starts empty; recreated by `db:push`).
- The Research view contains a built-in XAUUSD strategy case study (static
  content) and an embedded TradingView chart.
