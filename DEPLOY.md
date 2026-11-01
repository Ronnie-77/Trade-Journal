# Trade Journal — Cloudflare D1 Deploy Guide

D1 database (already created):
- database_name: `trade-journal`
- database_id: `85f9c436-cb2e-41e7-9534-49f20812a3e7`
- binding: `D1` (configured in `wrangler.toml`)

## 1. Local dev (SQLite, unchanged)

```bash
bun install
bun run db:push       # create/sync local SQLite db (empty)
bun run dev           # http://localhost:3000
```

## 2. Apply schema to Cloudflare D1 (one-time)

```bash
wrangler d1 execute trade-journal --remote --file=init.sql
```

## 3. Build + deploy to Cloudflare

```bash
bun run deploy:cf     # = build:cf && wrangler pages deploy .open-next
```

Or via Cloudflare dashboard (Workers & Pages → Pages):
- Build command: `bun run build:cf`
- Build output directory: `.open-next`
- D1 binding: variable `D1` → database `trade-journal`

## How the D1 wiring works
- `wrangler.toml` — D1 binding.
- `prisma/schema.edge.prisma` — `queryCompiler` (edge client, no Rust engine).
- `src/lib/db.ts` — `getDb()`: Cloudflare → D1 adapter; local → SQLite.
- API routes call `const db = await getDb()`.

## Notes
- `public/uploads/` — screenshot uploads (consider Cloudflare R2 for prod).
- `db/custom.db` — local SQLite (empty). D1 replaces it on Cloudflare.
