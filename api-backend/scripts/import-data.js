// One-off migration helper: load the JSON dumps into the (now PostgreSQL) database.
// Run this AFTER `prisma migrate` has created the tables in Postgres.
// Usage: node scripts/import-data.js
import { PrismaClient } from '@prisma/client'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const prisma = new PrismaClient()
const dumpDir = join(dirname(fileURLToPath(import.meta.url)), 'data-dump')

// Insert order respects foreign keys: parents before children.
const IMPORT_ORDER = [
  'cmsUser', 'category', 'tag', 'article', 'articleTag', 'articleAuthor',
  'articleVersion', 'media', 'auditLog', 'redirect', 'navigation',
  'rssSource', 'discoveryCache', 'siteSetting', 'contactMessage',
]

// Self-referencing tables: insert with parent link nulled first, then patch it.
const SELF_REF = { category: 'parentId', navigation: 'parentId' }

function load(model) {
  const file = join(dumpDir, `${model}.json`)
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf8'))
}

async function main() {
  for (const model of IMPORT_ORDER) {
    const rows = load(model)
    if (rows.length === 0) {
      console.log(`skip    ${model} (no rows)`)
      continue
    }

    const selfRefField = SELF_REF[model]
    if (selfRefField) {
      // Pass 1: insert everything with the self-reference removed.
      const flattened = rows.map((r) => ({ ...r, [selfRefField]: null }))
      await prisma[model].createMany({ data: flattened })
      // Pass 2: restore parent links for rows that had one.
      const withParent = rows.filter((r) => r[selfRefField])
      for (const r of withParent) {
        await prisma[model].update({
          where: { id: r.id },
          data: { [selfRefField]: r[selfRefField] },
        })
      }
    } else {
      await prisma[model].createMany({ data: rows })
    }
    console.log(`import  ${String(rows.length).padStart(6)}  ${model}`)
  }

  console.log('\n--- verification ---')
  for (const model of IMPORT_ORDER) {
    console.log(`${model.padEnd(16)} ${await prisma[model].count()}`)
  }
}

main()
  .catch((err) => {
    console.error('Import failed:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
