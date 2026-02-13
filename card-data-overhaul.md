# Credit Card Reward Data Overhaul

**Date**: February 2026
**Scope**: DATA-ONLY — No changes to `src/App.jsx`

## Summary

This overhaul corrects all 51 credit cards in the Supabase `cards` table based on actual issuer terms as of early 2026. It restructures reward categories to match how card issuers actually define bonus spending, adds merchant-specific override support, and updates merchant mappings accordingly.

## Files

| File | Purpose |
|------|---------|
| `update-cards.sql` | Schema change (adds `merchant_overrides` column) + UPDATE statements for all 51 cards |
| `update-merchants.sql` | Removes invalid categories from merchant_mappings, adds new mappings |

---

## Category Changes

### Removed Categories (2)
| Key | Reason |
|-----|--------|
| `travel` | Too broad. Replaced by `flights`, `hotels`, `car_rental`, `transit`, and portal categories |
| `online_shopping` | Not how issuers define MCC-based categories. Specific merchant bonuses handled via `merchant_overrides` |

### Added Categories (3 new)
| Key | Description |
|-----|-------------|
| `portal_flights` | Flights booked through issuer's travel portal (Chase Travel, Amex Travel, Capital One Travel, etc.) |
| `portal_hotels` | Hotels/car rental/attractions booked through issuer's travel portal |
| `wholesale_clubs` | Costco, Sam's Club, BJ's (MCC 5300). Most grocery bonuses exclude these |

### Full Category List (18 total)
| Key | Description |
|-----|-------------|
| dining | Restaurants, cafes, bars, fast food, delivery (MCC 5812/5813/5814) |
| groceries | Supermarkets, grocery stores (MCC 5411/5422). Excludes Walmart, Target, Costco |
| flights | Airlines booked directly (MCC 3000-3299, 4511) |
| hotels | Hotels/lodging booked directly (MCC 3500-3999, 7011) |
| gas | Gas stations, EV charging (MCC 5541/5542) |
| transit | Rideshare, public transit, parking, tolls (MCC 4111/4121/7523) |
| streaming | Streaming services, digital subscriptions (MCC 4899) |
| drugstores | Pharmacies (MCC 5912) |
| home_improvement | Hardware stores (MCC 5200/5211/5231/5251) |
| car_rental | Rental cars (MCC 3351-3441, 7512) |
| entertainment | Movies, concerts, sports, amusement (MCC 7832/7922/7941/7996) |
| phone_plans | Telecom (MCC 4812/4813) |
| portal_flights | Flights via issuer travel portal |
| portal_hotels | Hotels/car/attractions via issuer travel portal |
| wholesale_clubs | Costco, Sam's Club, BJ's (MCC 5300) |
| fitness | Gyms, fitness studios (MCC 7941/7911) |
| shipping | UPS, FedEx, USPS (MCC 4215) |
| general | Everything else / base earn rate |

---

## Schema Changes

### New column: `merchant_overrides`
```sql
ALTER TABLE cards ADD COLUMN IF NOT EXISTS merchant_overrides JSONB DEFAULT NULL;
```

Stores merchant-specific earn rates that override category-level rates. The recommendation engine should check `merchant_overrides` BEFORE falling back to category rates.

Example (Amazon Prime Visa):
```json
{"amazon": 5, "amazon_fresh": 5, "whole_foods": 5}
```

---

## Annual Fee Changes

| Card | Old AF | New AF | Reason |
|------|--------|--------|--------|
| Amex Gold | $250 | $325 | 2025 refresh |
| Amex Platinum | $695 | $895 | 2025 refresh |
| Chase Sapphire Reserve | $550 | $795 | Major 2025 refresh |
| CSR for Business | $550 | $795 | 2025 refresh |

---

## Cards with Merchant Overrides

| Card | Overrides |
|------|-----------|
| Amazon Prime Visa | amazon:5, amazon_fresh:5, whole_foods:5 |
| Apple Card | apple:3, ace_hardware:3, nike:3, uber:3, uber_eats:3, walgreens:3, duane_reade:3, exxon:3, mobil:3 |
| Marriott Bonvoy Boundless | marriott:6 |
| Delta SkyMiles Gold | delta:2 |
| United Explorer | united:2 |
| Southwest RR Plus | southwest:2 |
| IHG One Rewards Premier | ihg:10 |
| World of Hyatt | hyatt:4 |
| Alaska Airlines Visa | alaska_airlines:3 |
| Costco Anywhere Visa | costco_gas:5 |

---

## Merchant Mapping Changes

### Removed
- All merchants previously mapped to `travel` (kayak, google flights, tripadvisor, priceline, hopper, etc.) → remapped to `general`
- All merchants previously mapped to `online_shopping` (amazon, walmart, ebay, etsy, wayfair, best buy, apple store, nike, nordstrom, etc.) → remapped to `general`

### Added
- `wholesale_clubs`: costco, sam's club, sams club, bj's, bjs

### Remapped
- Target → `general` (MCC 5311 discount store, not groceries)
- Walmart → `general` (MCC 5311 discount store, not groceries)
- walmart grocery → `groceries` (specifically codes as grocery)

---

## Future Work (NOT included in this overhaul)

1. Update `CATEGORY_LABELS` and `CATEGORY_ICONS` in App.jsx for new categories
2. Add online/in-store toggle in the UI
3. Implement `merchant_overrides` lookup in the recommendation engine
4. Update `categorize-merchant` edge function's valid categories list
5. Clear `merchant_cache` table of entries with removed categories

---

## Verification Queries

```sql
-- Should be 51
SELECT count(*) FROM cards;

-- Should be 0
SELECT id FROM cards WHERE categories ? 'travel';

-- Should be 0
SELECT id FROM cards WHERE categories ? 'online_shopping';

-- Should be 4
SELECT id, categories->'dining' FROM cards WHERE id = 'amex-gold';

-- Should be 895
SELECT id, annual_fee FROM cards WHERE id = 'amex-platinum';

-- Should show amazon:5, whole_foods:5
SELECT id, merchant_overrides FROM cards WHERE id = 'amazon-prime-visa';

-- Should be 0 rows
SELECT * FROM merchant_mappings WHERE category = 'online_shopping';

-- Should be wholesale_clubs
SELECT * FROM merchant_mappings WHERE merchant = 'costco';
```
