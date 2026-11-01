import { PrismaClient } from '@prisma/client'

/**
 * Local dev / non-Cloudflare: regular Prisma client bound to the local
 * SQLite database (generated from `prisma/schema.prisma` with the Rust
 * query engine). Used as a fallback when there is no Cloudflare context.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}
const localClient =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = localClient

/**
 * Returns a PrismaClient bound to the Cloudflare D1 database when running
 * on Cloudflare (Workers/Pages via @opennextjs/cloudflare). Falls back to
 * the local SQLite client during local dev.
 *
 * Use in API route handlers:
 *   const db = await getDb()
 *   const rows = await db.trade.findMany()
 */
export async function getDb(): Promise<PrismaClient> {
  try {
    const { getCloudflareContext } = await import(
      '@opennextjs/cloudflare'
    )
    const { PrismaD1 } = await import('@prisma/adapter-d1')
    const { env } = await getCloudflareContext()
    const adapter = new PrismaD1(env.D1)
    return new PrismaClient({ adapter })
  } catch {
    // No Cloudflare context — local dev with SQLite.
    return localClient
  }
}

/** Direct SQLite client (local dev convenience — not for Cloudflare). */
export const db = localClient
