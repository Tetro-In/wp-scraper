## WA Catalog DB Setup (Phase 1 – Prisma + Postgres)

This guide explains how to bring up the Phase 1 data model for the WhatsApp catalog pipeline in the `gpt` project.

---

### 1. Prerequisites

- Node.js v18+ recommended.
- PostgreSQL running locally or in the cloud.
  - You should know:
    - Host (for example, `localhost`)
    - Port (default `5432`)
    - Database name (for example, `wp_connect`)
    - User and password
- Install NPM dependencies:

```bash
cd gpt
npm install
```

---

### 2. Configure `DATABASE_URL`

1. In the `gpt` folder, copy the example env file:

```bash
cp .env.example .env
```

2. Edit `.env` and set a real Postgres URL, for example:

```ini
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/wp_connect?schema=public"
```

3. Ensure the `wp_connect` database exists. For local Postgres, you can create it with:

```bash
createdb wp_connect
```

---

### 3. Generate Prisma Client

From the `gpt` directory, run:

```bash
npm run prisma:generate
```

This reads `prisma/schema.prisma` and generates a type-safe Prisma Client based on the models:

- `Seller` → `sellers` table
- `Product` → `products` table
- `ProductHistory` → `product_history` table
- `ScanLog` → `scan_logs` table

---

### 4. Apply the Initial Schema (Migration)

To create the tables in Postgres, run:

```bash
npm run prisma:migrate
```

Prisma will:

- Compare `schema.prisma` to the current DB.
- Create a new migration under `prisma/migrations`.
- Execute SQL to create the `sellers`, `products`, `product_history`, and `scan_logs` tables.

You can re-run migrations safely as you evolve the schema in later phases.

---

### 5. Optional: Inspect the DB with Prisma Studio

```bash
npm run prisma:studio
```

This opens a browser UI where you can explore and edit:

- Sellers
- Products
- Product history entries
- Scan logs

---

### 6. Seller Metrics View (`seller_metrics_view`)

The Prisma migrations now create a read-only view named `seller_metrics_view` that surfaces the per-seller analytics described in `plan.md` (total listings, active listings, catalog quality score, recent scan averages, etc.). No manual SQL is required anymore—running `npm run prisma:migrate` (or `prisma migrate deploy` in CI) will create or update the view automatically.

To inspect the results:

```bash
psql "$DATABASE_URL" -c "select * from seller_metrics_view limit 10;"
```

Use the view in dashboards or BI tools just like any other table; it refreshes automatically as you insert new products, histories, and scan logs.

---

### 7. Next Phases

With the schema ready you can now run the full scrape → enrich → process pipeline:

```bash
# 1) Scrape WhatsApp catalogs into products.json
npm start

# 2) Enrich every product via OpenAI (writes products.enriched.json)
npm run enrich

# 3) Write enriched products + history/logs into Postgres
npm run processor
```

- `products.json` is the raw scraper output (Phase 2).
- `products.enriched.json` contains the same records plus `modelName`, `storageGb`, `color`, and `warranty` (Phase 3 enrichment).
- `npm run processor` now reads `products.enriched.json` only. If the file is missing, run `npm run enrich` first.


