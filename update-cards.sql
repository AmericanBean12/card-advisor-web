-- ============================================================
-- Credit Card Reward Data Overhaul — Card Updates
-- Run against Supabase production database
-- ============================================================

-- 1. Schema change: add merchant_overrides column
ALTER TABLE cards ADD COLUMN IF NOT EXISTS merchant_overrides JSONB DEFAULT NULL;

-- ============================================================
-- 2. Card-by-card updates (51 cards)
-- ============================================================

-- ==================== AMERICAN EXPRESS ====================

-- Amex Gold (AF: $250 → $325)
UPDATE cards SET
  annual_fee = 325,
  categories = '{"dining": 4, "groceries": 4, "flights": 3, "portal_hotels": 2, "general": 1}',
  note = '4x dining (up to $50K/yr). 4x US supermarkets (up to $25K/yr). 3x flights direct or Amex Travel. 2x prepaid hotels on Amex Travel.',
  merchant_overrides = NULL
WHERE id = 'amex-gold';

-- Amex Platinum (AF: $695 → $895)
UPDATE cards SET
  annual_fee = 895,
  categories = '{"flights": 5, "portal_flights": 5, "portal_hotels": 5, "general": 1}',
  note = '5x flights booked directly with airlines or on Amex Travel. 5x prepaid hotels booked on Amex Travel only. 1x all other purchases.',
  merchant_overrides = NULL
WHERE id = 'amex-platinum';

-- Blue Cash Preferred (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"groceries": 6, "streaming": 6, "transit": 3, "general": 1}',
  note = '6x US supermarkets (up to $6K/yr, then 1x). 6x select US streaming. 3x US transit incl rideshare, parking, tolls.',
  merchant_overrides = NULL
WHERE id = 'amex-blue-cash-preferred';

-- Blue Cash Everyday (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"groceries": 3, "gas": 3, "general": 1}',
  note = '3x US supermarkets, 3x US gas stations, 3x US online retail purchases (each up to $6K/yr, then 1x). Online retail bonus not reflected in categories.',
  merchant_overrides = NULL
WHERE id = 'amex-blue-cash-everyday';

-- Amex Green (AF: $150)
UPDATE cards SET
  annual_fee = 150,
  categories = '{"dining": 3, "flights": 3, "hotels": 3, "car_rental": 3, "transit": 3, "general": 1}',
  note = '3x restaurants worldwide, 3x travel (airlines, hotels, car rental, cruises, etc.), 3x transit (trains, rideshare, tolls, parking, buses).',
  merchant_overrides = NULL
WHERE id = 'amex-green';

-- Amex Business Gold (AF: $375)
UPDATE cards SET
  annual_fee = 375,
  categories = '{"dining": 4, "flights": 4, "gas": 4, "transit": 4, "shipping": 4, "phone_plans": 4, "portal_flights": 3, "portal_hotels": 3, "general": 1}',
  note = '4x on your top 2 spend categories each month from: airfare, advertising, gas, restaurants, shipping, transit, wireless (up to $150K/yr combined). 3x flights + prepaid hotels on Amex Travel.',
  merchant_overrides = NULL
WHERE id = 'amex-business-gold';

-- Amex EveryDay Preferred (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"groceries": 3, "gas": 2, "general": 1}',
  note = '3x US supermarkets (up to $6K/yr). 2x US gas stations. 50% point bonus when you make 30+ purchases/month.',
  merchant_overrides = NULL
WHERE id = 'amex-everyday-preferred';

-- ==================== CHASE ====================

-- Chase Sapphire Reserve (AF: $550 → $795)
UPDATE cards SET
  annual_fee = 795,
  categories = '{"portal_flights": 8, "portal_hotels": 8, "flights": 4, "hotels": 4, "dining": 3, "general": 1}',
  note = '8x all travel through Chase Travel. 4x flights and hotels booked directly. 3x dining worldwide. 1x everything else. Major 2025 refresh.',
  merchant_overrides = NULL
WHERE id = 'chase-sapphire-reserve';

-- Chase Sapphire Preferred (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"portal_flights": 5, "portal_hotels": 5, "dining": 3, "streaming": 3, "flights": 2, "hotels": 2, "car_rental": 2, "transit": 2, "general": 1}',
  note = '5x travel through Chase Travel. 3x dining and select streaming. 3x online grocery (not reflected in categories). 2x other travel.',
  merchant_overrides = NULL
WHERE id = 'chase-sapphire-preferred';

-- Chase Freedom Unlimited (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"portal_flights": 5, "portal_hotels": 5, "dining": 3, "drugstores": 3, "general": 1.5}',
  note = '5x travel through Chase Travel only. 3x dining and drugstores. 1.5% on everything else.',
  merchant_overrides = NULL
WHERE id = 'chase-freedom-unlimited';

-- Chase Freedom Flex (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"portal_flights": 5, "portal_hotels": 5, "dining": 3, "drugstores": 3, "general": 1}',
  note = '5x rotating quarterly categories (up to $1,500/qtr, activate required). 5x travel through Chase Travel. 3x dining and drugstores. 1x everything else.',
  merchant_overrides = NULL
WHERE id = 'chase-freedom-flex';

-- CSR for Business (AF: $550 → $795)
UPDATE cards SET
  annual_fee = 795,
  categories = '{"portal_flights": 8, "portal_hotels": 8, "flights": 4, "hotels": 4, "general": 1}',
  note = '8x all travel through Chase Travel. 4x flights and hotels booked directly. 3x social media and search engine advertising. 5x Lyft (through 9/2027). 1x all other.',
  merchant_overrides = NULL
WHERE id = 'chase-sapphire-reserve-biz';

-- Chase Ink Business Preferred (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"flights": 3, "hotels": 3, "car_rental": 3, "transit": 3, "shipping": 3, "phone_plans": 3, "streaming": 3, "general": 1}',
  note = '3x on first $150K/yr in combined travel, shipping, internet/cable/phone, social media/search advertising. 1x everything else.',
  merchant_overrides = NULL
WHERE id = 'chase-ink-preferred';

-- ==================== CAPITAL ONE ====================

-- Venture X (AF: $395)
UPDATE cards SET
  annual_fee = 395,
  categories = '{"portal_hotels": 10, "portal_flights": 5, "entertainment": 5, "general": 2}',
  note = '10x hotels and rental cars through Capital One Travel. 5x flights and vacation rentals through Capital One Travel. 5x Capital One Entertainment. 2x everything else.',
  merchant_overrides = NULL
WHERE id = 'cap1-venture-x';

-- Venture (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"portal_hotels": 5, "portal_flights": 5, "entertainment": 5, "general": 2}',
  note = '5x hotels, vacation rentals, and rental cars through Capital One Travel. 5x Capital One Entertainment. 2x all other purchases.',
  merchant_overrides = NULL
WHERE id = 'cap1-venture';

-- Savor (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"dining": 3, "groceries": 3, "streaming": 3, "entertainment": 3, "portal_hotels": 5, "general": 1}',
  note = '3x dining, groceries, streaming, entertainment. 5x hotels/rental cars via Capital One Travel. 8x Capital One Entertainment. 1x everything else.',
  merchant_overrides = NULL
WHERE id = 'cap1-savor';

-- SavorOne (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"dining": 3, "groceries": 3, "streaming": 3, "entertainment": 3, "portal_hotels": 5, "general": 1}',
  note = 'Same earn structure as Savor. 3x dining, groceries, streaming, entertainment. 5x hotels/rental cars via Capital One Travel.',
  merchant_overrides = NULL
WHERE id = 'cap1-savor-one';

-- Quicksilver (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"portal_hotels": 5, "portal_flights": 5, "general": 1.5}',
  note = '5x hotels, vacation rentals, rental cars through Capital One Travel. 1.5% cash back on everything else.',
  merchant_overrides = NULL
WHERE id = 'cap1-quicksilver';

-- ==================== CITI ====================

-- Citi Double Cash (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"portal_hotels": 5, "general": 2}',
  note = '2% on everything (1% when you buy, 1% when you pay). 5x hotels/car rentals/attractions via Citi Travel.',
  merchant_overrides = NULL
WHERE id = 'citi-double-cash';

-- Citi Custom Cash (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"dining": 5, "groceries": 5, "gas": 5, "flights": 5, "hotels": 5, "transit": 5, "streaming": 5, "drugstores": 5, "home_improvement": 5, "fitness": 5, "entertainment": 5, "portal_hotels": 4, "general": 1}',
  note = '5x on your TOP eligible spend category each billing cycle (up to $500/cycle, then 1x). Auto-selects highest. Only one category earns 5x at a time. 4x hotels/car/attractions via Citi Travel (through 6/30/2026).',
  merchant_overrides = NULL
WHERE id = 'citi-custom-cash';

-- Citi Strata Premier (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"portal_hotels": 10, "flights": 3, "hotels": 3, "dining": 3, "groceries": 3, "gas": 3, "general": 1}',
  note = '10x hotels/car rentals/attractions via Citi Travel. 3x air travel, other hotel purchases, restaurants, supermarkets, gas/EV. 1x everything else.',
  merchant_overrides = NULL
WHERE id = 'citi-strata-premier';

-- Citi Strata Elite (AF: $595)
UPDATE cards SET
  annual_fee = 595,
  categories = '{"portal_hotels": 12, "portal_flights": 6, "dining": 3, "general": 1.5}',
  note = '12x hotels/car/attractions via Citi Travel. 6x air travel via Citi Travel. 6x restaurants on Citi Nights (Fri/Sat 6PM-6AM). 3x restaurants other times. 1.5x everything else.',
  merchant_overrides = NULL
WHERE id = 'citi-strata-elite';

-- Citi Strata (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"portal_hotels": 5, "groceries": 3, "gas": 3, "transit": 3, "dining": 2, "general": 1}',
  note = '5x hotels/car/attractions via Citi Travel. 3x supermarkets, gas/EV, transit. 3x one self-select category (streaming, fitness, entertainment, cosmetic/salon, or pet supplies). 2x restaurants. 1x everything else.',
  merchant_overrides = NULL
WHERE id = 'citi-strata';

-- ==================== WELLS FARGO ====================

-- Autograph (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"dining": 3, "gas": 3, "flights": 3, "hotels": 3, "car_rental": 3, "transit": 3, "streaming": 3, "phone_plans": 3, "general": 1}',
  note = '3x restaurants, gas/EV, travel (airlines, hotels, car rental, cruises), transit, streaming, phone plans. 1x everything else.',
  merchant_overrides = NULL
WHERE id = 'wf-autograph';

-- Active Cash (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"general": 2}',
  note = 'Flat 2% cash back on all purchases.',
  merchant_overrides = NULL
WHERE id = 'wf-active-cash';

-- Autograph Journey (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"hotels": 5, "flights": 4, "dining": 3, "car_rental": 3, "transit": 3, "general": 1}',
  note = '5x hotels, 4x airlines, 3x restaurants and other travel. 1x everything else.',
  merchant_overrides = NULL
WHERE id = 'wf-autograph-journey';

-- ==================== DISCOVER ====================

-- Discover It Cash Back (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"general": 1}',
  note = '5x rotating quarterly categories (up to $1,500/qtr, activate required). Base rate 1x on everything. Cashback Match doubles all cash back earned in first year.',
  merchant_overrides = NULL
WHERE id = 'discover-it';

-- Discover It Chrome (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"dining": 2, "gas": 2, "general": 1}',
  note = '2% at gas stations and restaurants (up to $1,000/qtr combined, then 1%). 1% everything else. Cashback Match first year.',
  merchant_overrides = NULL
WHERE id = 'discover-it-chrome';

-- ==================== BANK OF AMERICA ====================

-- BofA Customized Cash (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"gas": 3, "dining": 3, "drugstores": 3, "home_improvement": 3, "groceries": 2, "wholesale_clubs": 2, "general": 1}',
  note = '3% in ONE choice category (gas, online shopping, dining, travel, drugstores, or home improvement — change monthly). 2% grocery stores and wholesale clubs. Combined $2,500/qtr cap on 3%+2%, then 1%. Rates shown assume best choice category.',
  merchant_overrides = NULL
WHERE id = 'bofa-customized-cash';

-- BofA Unlimited Cash (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"general": 1.5}',
  note = 'Flat 1.5% cash back on all purchases. Up to 75% bonus for Preferred Rewards members.',
  merchant_overrides = NULL
WHERE id = 'bofa-unlimited-cash';

-- ==================== U.S. BANK ====================

-- Cash+ (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"streaming": 5, "home_improvement": 5, "fitness": 5, "phone_plans": 5, "entertainment": 5, "gas": 2, "groceries": 2, "dining": 2, "general": 1}',
  note = '5% on TWO chosen categories (from: TV/streaming/internet, utilities, cell phone, gym, fast food, dept stores, movie theaters, furniture, electronics, more). 2% on ONE everyday category (gas, groceries, restaurants, EV). Up to $2K/qtr combined on 5% categories.',
  merchant_overrides = NULL
WHERE id = 'usbank-cash-plus';

-- Altitude Go (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"dining": 4, "groceries": 2, "gas": 2, "streaming": 2, "general": 1}',
  note = '4x dining (first $2K/qtr, then 1x). 2x groceries (excl wholesale/supercenters), gas/EV, streaming. 1x everything else.',
  merchant_overrides = NULL
WHERE id = 'usbank-altitude-go';

-- Altitude Connect (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"portal_hotels": 5, "flights": 4, "hotels": 4, "car_rental": 4, "transit": 4, "gas": 4, "groceries": 2, "dining": 2, "streaming": 2, "general": 1}',
  note = '5x prepaid hotels/car rentals in Travel Center. 4x travel (airlines, hotels, car rental, taxi, train, cruise). 4x gas/EV (first $1K/qtr). 2x groceries, dining, streaming. 1x everything else.',
  merchant_overrides = NULL
WHERE id = 'usbank-altitude-connect';

-- Altitude Reserve (AF: $400)
UPDATE cards SET
  annual_fee = 400,
  categories = '{"portal_hotels": 10, "portal_flights": 5, "flights": 3, "hotels": 3, "dining": 3, "general": 1}',
  note = '10x prepaid hotels/car, 5x flights in Travel Center. 3x travel and mobile wallet purchases (up to $5K/billing cycle). $325 annual travel credit. 1x everything else.',
  merchant_overrides = NULL
WHERE id = 'usbank-altitude-reserve';

-- ==================== AMAZON / APPLE ====================

-- Amazon Prime Visa (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"portal_flights": 5, "portal_hotels": 5, "dining": 2, "gas": 2, "transit": 2, "general": 1}',
  note = '5x at Amazon.com, Amazon Fresh, Whole Foods only (NOT general online shopping). 5x Chase Travel. 2x restaurants, gas, transit. Requires Prime membership ($139/yr).',
  merchant_overrides = '{"amazon": 5, "amazon_fresh": 5, "whole_foods": 5}'
WHERE id = 'amazon-prime-visa';

-- Apple Card (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"general": 2}',
  note = '3% at Apple and select merchants via Apple Pay. 2% everywhere else with Apple Pay. 1% with physical card. Rates assume Apple Pay usage.',
  merchant_overrides = '{"apple": 3, "ace_hardware": 3, "nike": 3, "uber": 3, "uber_eats": 3, "walgreens": 3, "duane_reade": 3, "exxon": 3, "mobil": 3}'
WHERE id = 'apple-card';

-- ==================== HOTEL & AIRLINE CO-BRANDS ====================

-- Marriott Bonvoy Boundless (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"hotels": 3, "groceries": 3, "gas": 3, "dining": 3, "general": 1}',
  note = '6x at Marriott (up to 17x total with Bonvoy member status). 3x groceries, gas, dining (first $6K combined/yr, then 1x). 1x everything else.',
  merchant_overrides = '{"marriott": 6}'
WHERE id = 'marriott-bonvoy-boundless';

-- Hilton Honors Surpass (AF: $150)
UPDATE cards SET
  annual_fee = 150,
  categories = '{"hotels": 12, "dining": 6, "groceries": 6, "gas": 6, "general": 3}',
  note = '12x at Hilton properties. 6x US restaurants, supermarkets, gas. 4x US online retail (not reflected in categories). 3x all other purchases.',
  merchant_overrides = NULL
WHERE id = 'hilton-honors-surpass';

-- Hilton Honors No-Fee (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"hotels": 7, "dining": 5, "groceries": 5, "gas": 5, "general": 3}',
  note = '7x at Hilton properties. 5x US restaurants, supermarkets, gas. 3x all other purchases.',
  merchant_overrides = NULL
WHERE id = 'hilton-honors-no-fee';

-- Delta SkyMiles Gold (AF: $150)
UPDATE cards SET
  annual_fee = 150,
  categories = '{"flights": 2, "dining": 2, "groceries": 2, "general": 1}',
  note = '2x Delta purchases, restaurants worldwide, US supermarkets. 1x everything else. Free first checked bag on Delta.',
  merchant_overrides = '{"delta": 2}'
WHERE id = 'delta-skymiles-gold';

-- United Explorer (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"flights": 2, "dining": 2, "hotels": 2, "general": 1}',
  note = '2x United purchases, restaurants, hotels booked directly. 1x everything else. Free first checked bag on United.',
  merchant_overrides = '{"united": 2}'
WHERE id = 'united-explorer';

-- Southwest RR Plus (AF: $69)
UPDATE cards SET
  annual_fee = 69,
  categories = '{"flights": 2, "hotels": 2, "car_rental": 2, "gas": 2, "groceries": 2, "general": 1}',
  note = '2x Southwest, RR hotel/car partners. 2x gas and groceries (first $5K combined/yr). 1x everything else. Transit/streaming bonus expired 12/2025.',
  merchant_overrides = '{"southwest": 2}'
WHERE id = 'southwest-rapid-rewards-plus';

-- IHG One Rewards Premier (AF: $99)
UPDATE cards SET
  annual_fee = 99,
  categories = '{"hotels": 10, "flights": 5, "dining": 5, "gas": 5, "general": 3}',
  note = '10x at IHG properties (up to 26x with member status). 5x travel, restaurants, gas. 3x all other purchases.',
  merchant_overrides = '{"ihg": 10}'
WHERE id = 'ihg-one-rewards-premier';

-- World of Hyatt (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"hotels": 4, "dining": 2, "flights": 2, "fitness": 2, "transit": 2, "general": 1}',
  note = '4x at Hyatt. 2x dining, airlines, gyms, transit. Also 2x on your auto-selected top 3 spending categories each quarter (uncapped). 1x everything else.',
  merchant_overrides = '{"hyatt": 4}'
WHERE id = 'world-of-hyatt';

-- Alaska Airlines Visa (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"flights": 3, "hotels": 2, "dining": 2, "general": 1}',
  note = '3x Alaska purchases. 2x hotels booked directly, dining. 1x everything else. Companion Fare from $99.',
  merchant_overrides = '{"alaska_airlines": 3}'
WHERE id = 'alaska-airlines-visa';

-- Capital One VentureOne (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"portal_hotels": 5, "portal_flights": 5, "general": 1.25}',
  note = '5x hotels, vacation rentals, rental cars through Capital One Travel. 1.25x all other purchases.',
  merchant_overrides = NULL
WHERE id = 'venture-one';

-- ==================== BILT REWARDS (Bilt 2.0) ====================

-- Bilt Blue (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"dining": 1, "groceries": 1, "flights": 1, "hotels": 1, "general": 1}',
  note = '1x all purchases. Earn points on rent/mortgage with no transaction fee. 4% Bilt Cash on everyday spend. Bilt 2.0 card.',
  merchant_overrides = NULL
WHERE id = 'bilt-blue';

-- Bilt Obsidian (AF: $95)
UPDATE cards SET
  annual_fee = 95,
  categories = '{"dining": 3, "groceries": 3, "flights": 2, "hotels": 2, "general": 1}',
  note = '3x dining OR groceries (choose annually, grocery up to $25K/yr). 2x travel. 1x everything else. Points on rent/mortgage. Bilt 2.0 card.',
  merchant_overrides = NULL
WHERE id = 'bilt-obsidian';

-- Bilt Palladium (AF: $495)
UPDATE cards SET
  annual_fee = 495,
  categories = '{"general": 2}',
  note = '2x on all purchases. Points on rent/mortgage. Priority Pass, $300 Bilt Travel Hotel credits. Bilt 2.0 card.',
  merchant_overrides = NULL
WHERE id = 'bilt-palladium';

-- ==================== ADDITIONAL ====================

-- Costco Anywhere Visa (AF: $0)
UPDATE cards SET
  annual_fee = 0,
  categories = '{"gas": 4, "dining": 3, "flights": 3, "hotels": 3, "car_rental": 3, "wholesale_clubs": 2, "general": 1}',
  note = '5% Costco gas, 4% other gas/EV (combined $7K/yr cap). 3% restaurants and travel. 2% Costco/Costco.com. 1% everything else. Requires Costco membership.',
  merchant_overrides = '{"costco_gas": 5}'
WHERE id = 'costco-anywhere-visa';
