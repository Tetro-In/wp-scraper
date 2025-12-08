-- CreateTable
CREATE TABLE "sellers" (
    "phone_number" VARCHAR(20) NOT NULL,
    "name" TEXT,
    "city" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("phone_number")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "seller_phone" VARCHAR(20) NOT NULL,
    "raw_name" TEXT,
    "raw_description" TEXT,
    "raw_price" DECIMAL(65,30),
    "currency" VARCHAR(10),
    "availability" TEXT,
    "image_count" INTEGER,
    "model_name" TEXT,
    "storage_gb" TEXT,
    "color" TEXT,
    "warranty" TEXT,
    "data_hash" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_price_change_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_history" (
    "history_id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "change_type" VARCHAR(20) NOT NULL,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "product_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "scan_logs" (
    "id" SERIAL NOT NULL,
    "seller_phone" VARCHAR(20) NOT NULL,
    "scan_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "products_found" INTEGER NOT NULL,
    "products_new" INTEGER NOT NULL,
    "products_updated" INTEGER NOT NULL,

    CONSTRAINT "scan_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_seller_phone_idx" ON "products"("seller_phone");

-- CreateIndex
CREATE INDEX "products_seller_phone_is_active_idx" ON "products"("seller_phone", "is_active");

-- CreateIndex
CREATE INDEX "product_history_product_id_idx" ON "product_history"("product_id");

-- CreateIndex
CREATE INDEX "scan_logs_seller_phone_scan_time_idx" ON "scan_logs"("seller_phone", "scan_time");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_seller_phone_fkey" FOREIGN KEY ("seller_phone") REFERENCES "sellers"("phone_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_logs" ADD CONSTRAINT "scan_logs_seller_phone_fkey" FOREIGN KEY ("seller_phone") REFERENCES "sellers"("phone_number") ON DELETE RESTRICT ON UPDATE CASCADE;
