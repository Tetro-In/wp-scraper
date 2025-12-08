## WA Catalog Pipeline – 3 Phase Implementation Plan

### Context

This plan applies to the `gemini` project only.

- **Current state**:
  - `src/index.ts`:
    - Uses WPPConnect nightly.
    - Handles session persistence and lock cleanup.
    - Fetches catalog (`getProducts` + `getCollections`).
    - Deduplicates products via `Map`.
    - Applies iPhone fuzzy search (already implemented).
    - Writes a single `products.json` with fields like:
      - `id`, `name`, `description`, `availability`, `priceRaw`, `priceFormatted`, `currency`, `productUrl`.
- **Data layer**:
  - Use **Postgres** as the source of truth for sellers/products/history.
  - Use **Prisma ORM** as the data-access layer:
    - Prisma schema (`schema.prisma`) defines `Seller`, `Product`, `ProductHistory`, and `ScanLog` models.
    - Prisma migrations manage the underlying Postgres schema.
    - Application code (Processor, seller sync) uses `PrismaClient`; the WhatsApp scraper (`index.ts`) stays DB‑agnostic and only writes `products.json`.
- **Decisions**:
  - Keep **one aggregated `products.json` per run**.
  - Use **WhatsApp product `id`** as the **primary key**.
  - Use **snapshot-style `product_history`** (full product state per change).
  - Keep **`scan_logs` indefinitely** for now.
  - LLM: use a cheap model (e.g. `gpt-5-nano` class) to enrich product data, cost ~\$0.04 per 1K products per run (est.).

---

## Phase 1 – Data Model & DB Layer

### Goals

- Define and create the Postgres schema to support:
  - Sellers registry.
  - Product canonical state.
  - Product history (snapshot-based).
  - Scan logs (per-run stats).
  - Seller metrics via views.
- No changes to the scraper behaviour yet, just planning schemas and how they map to current `products.json`.

### 1.1 Tables

#### `sellers`

- **Purpose**: One row per seller / WhatsApp business.
- **Columns (planned)**:
  - `phone_number` (PK, `VARCHAR(20)`): seller’s WA phone (extracted from URL).
  - `name` (`TEXT`): seller name (from Sheet or config).
  - `city` (`TEXT`): seller city.
  - `is_active` (`BOOLEAN`, default `TRUE`): whether to include this seller in runs.
  - `created_at` (`TIMESTAMP`, default `NOW()`).
  - `updated_at` (`TIMESTAMP`, default `NOW()`).

#### `products`

- **Purpose**: Current canonical state for each product.
- **Columns (planned)**:
  - `id` (`TEXT`, PK): WhatsApp product ID from `products.json`.
  - `seller_phone` (`VARCHAR(20)` FK → `sellers.phone_number`).
  - **Raw data (from scraper)**:
    - `raw_name` (`TEXT`).
    - `raw_description` (`TEXT`).
    - `raw_price` (`NUMERIC`) – parsed from `priceRaw`.
    - `currency` (`VARCHAR(10)`).
    - `availability` (`TEXT`).
    - `image_count` (`INTEGER`) – number of media images (when available).
  - **LLM-enriched data**:
    - `model_name` (`TEXT`).
    - `storage_gb` (`TEXT`).
    - `color` (`TEXT`).
    - `warranty` (`TEXT`).
  - **State / tracking**:
    - `data_hash` (`TEXT`): hash of canonical raw fields to detect any change.
    - `is_active` (`BOOLEAN`, default `TRUE`).
    - `first_seen_at` (`TIMESTAMP`, default `NOW()`).
    - `last_seen_at` (`TIMESTAMP`, default `NOW()`).
    - `last_price_change_at` (`TIMESTAMP`, nullable).

#### `product_history`

- **Purpose**: Track full-history snapshots per product (not only price).
- **Columns (planned)**:
  - `history_id` (`SERIAL` PK).
  - `product_id` (`TEXT` FK → `products.id`).
  - `recorded_at` (`TIMESTAMP`, default `NOW()`).
  - `change_type` (`VARCHAR(20)`):
    - `'CREATED'`, `'UPDATED'`, `'DEACTIVATED'`, `'REACTIVATED'`.
  - `snapshot` (`JSONB`):
    - Full snapshot of the product at that point (raw + enriched fields).

- **Behaviours**:
  - On first insertion → `CREATED` + full snapshot.
  - On `data_hash` change → `UPDATED` + new full snapshot.
  - On product disappearance from run → `DEACTIVATED` + snapshot.
  - On reappearance after inactive → `REACTIVATED` + snapshot.

#### `scan_logs`

- **Purpose**: Log each scraper run per seller.
- **Columns (planned)**:
  - `id` (`SERIAL` PK).
  - `seller_phone` (`VARCHAR(20)` FK → `sellers.phone_number`).
  - `scan_time` (`TIMESTAMP`, default `NOW()`).
  - `products_found` (`INTEGER`).
  - `products_new` (`INTEGER`).
  - `products_updated` (`INTEGER`).

- **Usage**:
  - For “frequency of update”, “avg listings by week”, “last scan date” metrics.
  - For debugging / monitoring over time.

### 1.2 Views

#### `seller_metrics_view`

- **Purpose**: A read-only view that aggregates metrics per seller from `sellers`, `products`, and `scan_logs`.
- **Example columns (planned)**:
  - `seller_name`, `seller_phone`, `city`.
  - `total_listings_history` – count of all products ever for that seller.
  - `current_active_listings` – count of products with `is_active = TRUE`.
  - `catalog_quality_score` – % of active products with non-null `model_name`, `storage_gb`, `color`.
  - `avg_listings_recent` – average `products_found` over last N days.
  - `last_scan_date` – `MAX(scan_time)` for that seller.

---

## Phase 2 – Scraper Consolidation (Using Existing `index.ts`)

### Goals

- Keep the **existing WhatsApp scraping and fuzzy search logic** intact.
- Adjust it minimally to:
  - Handle multiple sellers (eventually).
  - Produce a single aggregated `products.json` with the right shape for Phase 3.
- No DB or LLM work in this phase.

### 2.1 Normalizing Scraper Output

- **Current**: `src/index.ts` writes a single `products.json` at project root, containing an array of products for a single hard-coded `TARGET_PHONE_NUMBER`.
- **Target**:
  - Still write a **single `products.json` per run**.
  - Each product object should include:
    - `id` (WA ID).
    - `name`.
    - `description`.
    - `availability`.
    - `priceRaw`.
    - `priceFormatted`.
    - `currency`.
    - `productUrl`.
    - `sellerPhone` (critical for DB linkage).
    - (Optionally) `sellerName` if known at scrape time.
  - Fuzzy search for iPhone stays **exactly as currently implemented**.

### 2.2 Multi-Seller Awareness (Conceptual for later)

- Introduce a layer on top of the existing scraper function:
  - A small orchestrator script can:
    - Read sellers from DB (`sellers` where `is_active = TRUE`) or a pre-synced structure.
    - For each seller:
      - Call a refactored function (e.g. `scrapeCatalogForSeller(phoneNumber)`).
      - Collect the results and append them to a single in-memory array.
  - After all sellers:
    - Write the combined array to `products.json`.

- For now, `index.ts` can be thought of as the **core scraper** that we’ll later wrap, not rewrite.

---

## Phase 3 – Processor (LLM + DB + History & Metrics)

### Goals

- Implement a separate processing step that:
  - Reads the single `products.json`.
  - Performs change detection and history logging.
  - Calls the LLM **only** for new or changed products.
  - Persists everything into Postgres tables defined in Phase 1.
- This phase turns raw scrape data into a structured, queryable dataset.

### 3.1 Input Handling

- **Source**: `products.json` produced by Phase 2.
- **Assumptions**:
  - JSON structure is an array of product objects, each with:
    - `id`, `name`, `description`, `availability`, `priceRaw`, `priceFormatted`, `currency`, `productUrl`, `sellerPhone` (and optionally `sellerName`).
- **Processor flow** (per run):
  1. Parse the JSON array.
  2. Group products by `sellerPhone` if needed for logging.
  3. For each product:
     - Ensure its seller exists in `sellers` (insert or update basic info if available).
     - Continue into change detection.

### 3.2 Change Detection & History

- For each product from `products.json`:

  1. **Compute `data_hash`**:
     - Hash of key raw fields (e.g. `id + name + description + priceRaw + availability + currency`).
  2. **Look up existing product** in `products` by `id`.
  3. **Branch**:
     - **Not found**:
       - Insert into `products` with `is_active = TRUE`, timestamps set.
       - Insert into `product_history` with `change_type = 'CREATED'` and `snapshot` = full product state (raw only at this point).
       - Mark as `needs_llm = true`.
     - **Found & same `data_hash`**:
       - Update `last_seen_at`.
       - No `product_history` insert.
       - Mark as `needs_llm = false` (skip LLM to save cost).
     - **Found & different `data_hash`**:
       - Update `products` row with new raw fields.
       - Set `last_seen_at`.
       - If price changed, update `last_price_change_at`.
       - Insert into `product_history` with `change_type = 'UPDATED'` and `snapshot` = new state.
       - Mark as `needs_llm = true`.

- After processing all products for a given seller:

  - **Deactivate missing products**:
    - For that `seller_phone`, mark products as `is_active = FALSE` if they were not seen in this run (`last_seen_at < current_scan_time`).
    - Insert `product_history` entries with `change_type = 'DEACTIVATED'` and appropriate snapshots.

### 3.3 LLM Enrichment (gpt‑5‑nano class)

- Only run for products where `needs_llm = true`.
- **Input per product**:
  - Product fields (id, name, description, price, currency, availability).
  - A concise, stable instruction to:
    - Extract:
      - `modelName` (e.g. “iPhone 14 Pro Max”).
      - `storageGb` (e.g. “128 GB”).
      - `color`.
      - `warranty`.
    - Normalize price formatting if needed.
    - Return strict JSON with known keys.

- **Estimated cost**:
  - ~150 input tokens + ~80 output tokens per product.
  - For 1,000 products:
    - ~150k input + ~80k output tokens ≈ \$0.04 per session.
  - Twice a day ≈ \$0.08/day ≈ \$2.4/month (order of magnitude).

- **Writeback**:
  - Update the corresponding `products` row with:
    - `model_name`, `storage_gb`, `color`, `warranty`.
  - Optionally:
    - Update `product_history` snapshots for `CREATED` / `UPDATED` events to include enriched fields as they become available (or rely on future updates to capture them).

### 3.4 Scan Logs & Metrics

- For each run and seller, after all products are processed:

  - Insert a row into `scan_logs`:
    - `seller_phone`.
    - `scan_time` (run timestamp).
    - `products_found` (count from this run).
    - `products_new` (count of `CREATED` this run).
    - `products_updated` (count of `UPDATED` this run).

- The `seller_metrics_view` (Phase 1) can then use this data to provide:

  - Total listings history.
  - Current active listings.
  - Average listings over a period (e.g. 7/30 days).
  - Frequency/recency of updates.
  - Catalog quality score based on enriched fields.

---

## Summary

- **Phase 1**: Design and create DB schema (`sellers`, `products`, `product_history`, `scan_logs`, `seller_metrics_view`).
- **Phase 2**: Keep current WPPConnect scraper and iPhone fuzzy search logic, but normalize its output into a single, well-structured `products.json` that includes seller information.
- **Phase 3**: Implement a separate processor that:
  - Reads `products.json`,
  - Performs change detection + history logging,
  - Uses a cheap GPT-class model for enrichment,
  - Writes all state into Postgres and scan logs for analytics.

This keeps your existing `index.ts` logic central while layering on a robust data and analytics pipeline around it.