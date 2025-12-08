-- Schema Updates Migration
-- 1. Add catalogue_url to sellers
-- 2. Add price_raw to products
-- 3. Rename last_price_change_at to last_modified_at
-- 4. Drop image_count from products
-- 5. Add index on last_modified_at
-- 6. Drop and recreate seller_metrics_view with updated calculations

-- Add catalogue_url to sellers (if not exists)
ALTER TABLE "sellers" ADD COLUMN IF NOT EXISTS "catalogue_url" TEXT;

-- Add price_raw column to products (if not exists)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price_raw" DECIMAL(12, 2);

-- Rename last_price_change_at to last_modified_at (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'last_price_change_at') THEN
    ALTER TABLE "products" RENAME COLUMN "last_price_change_at" TO "last_modified_at";
  END IF;
END $$;

-- Add last_modified_at if it doesn't exist (in case the rename didn't happen)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "last_modified_at" TIMESTAMP(3);

-- Drop image_count column if it exists
ALTER TABLE "products" DROP COLUMN IF EXISTS "image_count";

-- Create index on last_modified_at
CREATE INDEX IF NOT EXISTS "products_last_modified_at_idx" ON "products"("last_modified_at");

-- Drop the old view
DROP VIEW IF EXISTS "seller_metrics_view";

-- Create updated seller_metrics_view with correct calculations
CREATE VIEW "seller_metrics_view" AS
SELECT
  s.phone_number AS seller_phone,
  s.name AS seller_name,
  s.city,
  s.catalogue_url,

  -- Total phones: count of ALL products ever (not just active)
  COUNT(DISTINCT p.id) AS total_phones,

  -- Current active inventory: products modified (data changed or deleted) in last 3 days
  COUNT(DISTINCT p.id) FILTER (
    WHERE p.last_modified_at >= NOW() - INTERVAL '3 days'
  ) AS current_active_inventory,

  -- Phones per week: average new products added per week (from scan logs)
  COALESCE(
    (
      SELECT ROUND(AVG(sl.products_new)::numeric, 1)
      FROM "scan_logs" sl
      WHERE sl.seller_phone = s.phone_number
        AND sl.scan_time >= NOW() - INTERVAL '7 days'
    ),
    0
  ) AS phones_per_week,

  -- Avg listings per week: average products found per week
  COALESCE(
    (
      SELECT ROUND(AVG(sl.products_found)::numeric, 1)
      FROM "scan_logs" sl
      WHERE sl.seller_phone = s.phone_number
        AND sl.scan_time >= NOW() - INTERVAL '7 days'
    ),
    0
  ) AS avg_listings_week,

  -- Product info score: 5-point system (model_name, storage_gb, color, warranty, price_raw)
  -- Average score across all active products, scaled to 5
  COALESCE(
    ROUND(
      AVG(
        CASE WHEN p.is_active THEN
          (CASE WHEN p.model_name IS NOT NULL AND p.model_name != '' THEN 1 ELSE 0 END) +
          (CASE WHEN p.storage_gb IS NOT NULL AND p.storage_gb != '' THEN 1 ELSE 0 END) +
          (CASE WHEN p.color IS NOT NULL AND p.color != '' THEN 1 ELSE 0 END) +
          (CASE WHEN p.warranty IS NOT NULL AND p.warranty != '' THEN 1 ELSE 0 END) +
          (CASE WHEN p.price_raw IS NOT NULL THEN 1 ELSE 0 END)
        ELSE NULL END
      )::numeric,
      2
    ),
    0
  ) AS product_info_score,

  -- Is valid: seller has at least one product
  CASE WHEN COUNT(DISTINCT p.id) > 0 THEN TRUE ELSE FALSE END AS is_valid,

  -- Last scan date
  (
    SELECT MAX(sl.scan_time)
    FROM "scan_logs" sl
    WHERE sl.seller_phone = s.phone_number
  ) AS last_scan_date

FROM "sellers" s
LEFT JOIN "products" p ON p.seller_phone = s.phone_number
GROUP BY s.phone_number, s.name, s.city, s.catalogue_url;
