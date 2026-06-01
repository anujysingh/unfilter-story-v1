# Database — Go-Live Guide (PostgreSQL on Neon)

This project now uses **PostgreSQL** (via Prisma). Locally it runs against the
Postgres container in `docker-compose.yml`; for production we recommend
**[Neon](https://neon.tech)** — serverless Postgres with a free tier that
scales automatically.

## Why PostgreSQL (not MongoDB) for this product
The content model is highly relational — articles link to authors, categories,
tags (many-to-many join tables), and versions, with cascade deletes. Postgres
enforces those relationships natively. When you need schema-less flexibility
later, add a `Json` (JSONB) column — you get document-style freedom *inside* a
relational database, without giving up integrity.

> **File uploads** (images, PDFs, video) do **not** go in the database. Store
> them in object storage (Cloudflare R2 or AWS S3) and keep only the URL in the
> `Media` table — which is already how the schema works.

---

## Local development
Postgres runs in Docker. From the repo root:

```bash
docker compose up -d postgres      # start the database
cd api-backend
npx prisma migrate dev             # apply migrations (first run creates tables)
npm run dev                        # start the API on PORT (default 3000)
```

`api-backend/.env` already points `DATABASE_URL` at the local container.

---

## Going live on Neon (production)

1. **Create a project** at https://neon.tech (free). Choose a region close to
   your users (e.g. AWS `ap-south-1` Mumbai for an India audience).
2. **Copy the connection string** Neon shows you. It looks like:
   ```
   postgresql://USER:PASSWORD@ep-xxxx.ap-south-1.aws.neon.tech/unfilter_story?sslmode=require
   ```
3. **Set it as `DATABASE_URL`** in your production environment (your host's
   dashboard — Render/Railway/Fly/Vercel — *not* committed to git). Locally you
   can test by pasting it into `api-backend/.env`.
4. **Create the tables** on Neon:
   ```bash
   cd api-backend
   npx prisma migrate deploy        # applies existing migrations to prod
   ```
5. **(Optional) Move your existing content** to Neon: with `DATABASE_URL`
   pointed at Neon, run:
   ```bash
   node scripts/import-data.js       # loads scripts/data-dump/*.json
   ```
   (The dump was created from the original SQLite data during migration.)

That's it — the app code is unchanged; only `DATABASE_URL` differs between
local and production.

---

## Schema changes after launch
1. Edit `prisma/schema.prisma`.
2. `npx prisma migrate dev --name describe_change` (local) — generates a
   migration file.
3. Commit the migration, then on deploy run `npx prisma migrate deploy`.

Migrations are versioned and safe — never edit the DB by hand.

---

## How the migration from SQLite was done (for reference)
1. `scripts/export-data.js` dumped every table to `scripts/data-dump/*.json`
   while still on SQLite. The old DB was backed up to `prisma/dev.db.backup-*`.
2. `schema.prisma` datasource switched `sqlite` → `postgresql` +
   `env("DATABASE_URL")`.
3. `npx prisma migrate dev --name init_postgres` created all tables in Postgres.
4. `scripts/import-data.js` reloaded the JSON dumps (FK-safe order; self-
   referencing `category`/`navigation` use a two-pass insert). Row counts were
   verified to match the source exactly.
