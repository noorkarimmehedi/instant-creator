-- Product groups: variants of the same product share a product_group_id.
-- One coupon per group per influencer instead of one per product.

-- 1. Add product_group_id to products
ALTER TABLE products
  ADD COLUMN product_group_id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN variant_label TEXT;

-- Backfill: every existing product becomes its own group
UPDATE products SET product_group_id = gen_random_uuid() WHERE product_group_id IS NULL;

-- Make non-nullable going forward
ALTER TABLE products ALTER COLUMN product_group_id SET NOT NULL;

-- Fast lookup by group
CREATE INDEX idx_products_product_group_id ON products(product_group_id);

-- 2. Add product_group_id to product_coupons
ALTER TABLE product_coupons
  ADD COLUMN product_group_id UUID;

-- Backfill from linked product
UPDATE product_coupons
SET product_group_id = p.product_group_id
FROM products p
WHERE p.id = product_coupons.product_id;

-- One coupon per group per influencer
CREATE UNIQUE INDEX idx_product_coupons_group_influencer
  ON product_coupons(product_group_id, influencer_clerk_user_id);
