-- ============================================================
-- Credit Card Reward Data Overhaul — Merchant Mapping Updates
-- Run against Supabase production database
-- ============================================================

-- 1. Remove all merchants mapped to removed categories
DELETE FROM merchant_mappings WHERE category = 'travel';
DELETE FROM merchant_mappings WHERE category = 'online_shopping';

-- 2. Remap specific merchants
-- Target and Walmart are discount stores (MCC 5311), not groceries
UPDATE merchant_mappings SET category = 'general' WHERE merchant = 'target';
UPDATE merchant_mappings SET category = 'general' WHERE merchant = 'walmart';

-- Walmart Grocery specifically codes as grocery — keep/ensure it's groceries
INSERT INTO merchant_mappings (merchant, category)
VALUES ('walmart grocery', 'groceries')
ON CONFLICT (merchant) DO UPDATE SET category = 'groceries';

-- 3. Add wholesale_clubs mappings
INSERT INTO merchant_mappings (merchant, category)
VALUES
  ('costco', 'wholesale_clubs'),
  ('sam''s club', 'wholesale_clubs'),
  ('sams club', 'wholesale_clubs'),
  ('bj''s', 'wholesale_clubs'),
  ('bjs', 'wholesale_clubs')
ON CONFLICT (merchant) DO UPDATE SET category = EXCLUDED.category;

-- 4. Clean up merchant_cache entries for removed categories
-- These cached results reference categories that no longer exist
DELETE FROM merchant_cache WHERE category = 'travel';
DELETE FROM merchant_cache WHERE category = 'online_shopping';
