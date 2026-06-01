// One-off migration helper: dump every table from the current database to JSON.
// Run this WHILE the Prisma datasource is still pointed at SQLite.
// Usage: node scripts/export-data.js
import { PrismaClient } from '@prisma/client'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const prisma = new PrismaClient()
const outDir = join(dirname(fileURLToPath(import.meta.url)), 'data-dump')

// Order does not matter for export; import order is handled separately.
const MODELS = [
  'cmsUser', 'category', 'tag', 'article', 'articleTag', 'articleAuthor',
  'articleVersion', 'media', 'auditLog', 'redirect', 'navigation',
  'rssSource', 'discoveryCache', 'siteSetting', 'contactMessage',
]

async function main() {
  mkdirSync(outDir, { recursive: true })
  for (const model of MODELS) {
    const rows = await prisma[model].findMany()
    writeFileSync(join(outDir, `${model}.json`), JSON.stringify(rows, null, 2))
    console.log(`exported ${String(rows.length).padStart(6)}  ${model}`)
  }
  console.log(`\nDone. JSON written to ${outDir}`)
}

main()
  .catch((err) => {
    console.error('Export failed:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
