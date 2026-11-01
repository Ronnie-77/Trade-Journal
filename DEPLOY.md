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

`prisma generate` runs via `postinstall` using `prisma/schema.prisma`
(regular client with Rust engine — for local SQLite). API routes use
`getDb()` which falls back to SQLite locally.

## 2. Apply schema to Cloudflare D1 (one-time)

```bash
wrangler d1 execute trade-journal --remote --file=init.sql
```

`init.sql` is included in this package (generated from the Prisma schema).
It creates the `Trade` table (and the unused User/Post scaffold tables).

## 3. Build for Cloudflare (edge client + OpenNext)

```bash
bun run build:cf
```

This runs `prisma generate --schema=prisma/schema.edge.prisma` (generates
the edge client with the TypeScript query compiler — no Rust binary, needed
for Cloudflare) then `opennextjs-cloudflare build` → output in `.open-next/`.

## 4. Deploy

```bash
bun run deploy:cf      # = build:cf && wrangler pages deploy .open-next
```

Or from the Cloudflare dashboard (Workers & Pages → Pages):
- Framework preset: Next.js
- Build command: `bun run build:cf`
- Build output directory: `.open-next`
- Environment: add D1 binding → Variable name `D1`, D1 database `trade-journal`

## 5. Preview locally on Cloudflare runtime (optional)

```bash
bun run preview:cf     # = build:cf && wrangler pages dev .open-next
```

This serves the Cloudflare build locally with the local D1 copy.

## How the D1 wiring works

- `wrangler.toml` — D1 binding `D1` → your database.
- `prisma/schema.edge.prisma` — `previewFeatures = ["queryCompiler"]`
  (edge client, no Rust engine).
- `src/lib/db.ts` — `getDb()`:
  - on Cloudflare: `getCloudflareContext()` → `PrismaD1(env.D1)` adapter
    → `new PrismaClient({ adapter })`.
  - locally: falls back to the regular SQLite `PrismaClient`.
- API routes (`/api/trades`, `/api/trades/[id]`) call `const db = await getDb()`
  so the same code works in both environments.

## Theme system
8 color themes (4 dark + 4 light) from the palette dropdown in the top nav.
Persists in `localStorage` (`goldscalp-palette`). Tokens in
`src/app/globals.css` under `[data-palette="..."]`.

## Notes
- `public/uploads/` — trade screenshot uploads at runtime (starts empty).
  On Cloudflare, file uploads to `public/` won't persist — consider
  Cloudflare R2 for screenshot storage in production.
- `db/custom.db` — local SQLite (empty; recreated by `db:push`). Not used
  on Cloudflare (D1 replaces it).
