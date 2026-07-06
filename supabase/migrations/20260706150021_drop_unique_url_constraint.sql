-- Drop the unique constraint on (clerk_user_id, source_url) since a single
-- product URL can now result in multiple variant rows.
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_unique_brand_source_url;

-- Create a new unique index that factors in the variant label to prevent
-- duplicates of the exact same variant, treating NULL variant labels as empty strings.
CREATE UNIQUE INDEX IF NOT EXISTS products_unique_brand_source_url_variant
ON products (clerk_user_id, source_url, COALESCE(variant_label, ''));
