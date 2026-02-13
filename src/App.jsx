import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ============================================
// Last updated: Feb 2026 — 50+ cards
// REWARDS DATABASE
// ============================================
const CARDS_DATABASE = [
  // ---- AMERICAN EXPRESS ----
  {
    id: "amex-gold", name: "American Express Gold Card", issuer: "American Express", shortName: "Amex Gold",
    annualFee: 250, currency: "Membership Rewards",
    color: "#D4A843", gradient: "linear-gradient(135deg, #D4A843 0%, #A67C2E 100%)",
    categories: { dining: 4, groceries: 4, flights: 3, transit: 1, gas: 1, streaming: 1, travel: 1, online_shopping: 1, drugstores: 1, home_improvement: 1, general: 1 },
  },
  {
    id: "amex-platinum", name: "American Express Platinum", issuer: "American Express", shortName: "Amex Platinum",
    annualFee: 695, currency: "Membership Rewards",
    color: "#A0A0A0", gradient: "linear-gradient(135deg, #C0C0C0 0%, #888 50%, #A8A8A8 100%)",
    categories: { flights: 5, hotels: 5, dining: 1, groceries: 1, gas: 1, travel: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  {
    id: "amex-blue-cash-preferred", name: "Blue Cash Preferred", issuer: "American Express", shortName: "Blue Cash Pref.",
    annualFee: 95, currency: "Cash Back",
    color: "#0077C8", gradient: "linear-gradient(135deg, #0077C8 0%, #004E82 100%)",
    categories: { groceries: 6, streaming: 6, gas: 3, transit: 3, dining: 1, flights: 1, travel: 1, online_shopping: 1, general: 1 },
  },
  {
    id: "amex-blue-cash-everyday", name: "Blue Cash Everyday", issuer: "American Express", shortName: "Blue Cash Every.",
    annualFee: 0, currency: "Cash Back",
    color: "#00A4E4", gradient: "linear-gradient(135deg, #00A4E4 0%, #0077B5 100%)",
    categories: { groceries: 3, online_shopping: 3, gas: 3, dining: 1, streaming: 1, transit: 1, travel: 1, general: 1 },
  },
  {
    id: "amex-green", name: "American Express Green Card", issuer: "American Express", shortName: "Amex Green",
    annualFee: 150, currency: "Membership Rewards",
    color: "#2E8B57", gradient: "linear-gradient(135deg, #2E8B57 0%, #1B5E3A 100%)",
    categories: { travel: 3, transit: 3, dining: 3, flights: 1, hotels: 1, groceries: 1, gas: 1, streaming: 1, online_shopping: 1, general: 1 },
    note: "3x on travel, transit, and restaurants worldwide.",
  },
  {
    id: "amex-business-gold", name: "American Express Business Gold", issuer: "American Express", shortName: "Amex Biz Gold",
    annualFee: 375, currency: "Membership Rewards",
    color: "#B8860B", gradient: "linear-gradient(135deg, #B8860B 0%, #8B6914 100%)",
    categories: { flights: 4, online_shopping: 4, gas: 4, dining: 4, shipping: 4, groceries: 1, streaming: 1, transit: 1, travel: 1, general: 1 },
    note: "4x on your top 2 categories each month from: airfare, advertising, gas, shipping, IT purchases, dining (up to $150K/yr).",
  },
  // ---- CHASE ----
  {
    id: "chase-sapphire-reserve", name: "Chase Sapphire Reserve", issuer: "Chase", shortName: "Sapphire Reserve",
    annualFee: 550, currency: "Ultimate Rewards",
    color: "#1A2744", gradient: "linear-gradient(135deg, #1A2744 0%, #2D4A7A 100%)",
    categories: { dining: 3, travel: 3, flights: 3, hotels: 3, car_rental: 3, transit: 3, gas: 1, groceries: 1, streaming: 1, online_shopping: 1, general: 1 },
  },
  {
    id: "chase-sapphire-preferred", name: "Chase Sapphire Preferred", issuer: "Chase", shortName: "Sapphire Preferred",
    annualFee: 95, currency: "Ultimate Rewards",
    color: "#2255A0", gradient: "linear-gradient(135deg, #2255A0 0%, #1A3D75 100%)",
    categories: { dining: 3, travel: 2, flights: 2, hotels: 2, streaming: 3, online_shopping: 3, groceries: 1, gas: 1, transit: 1, general: 1 },
  },
  {
    id: "chase-freedom-unlimited", name: "Chase Freedom Unlimited", issuer: "Chase", shortName: "Freedom Unlimited",
    annualFee: 0, currency: "Ultimate Rewards",
    color: "#0F6BB5", gradient: "linear-gradient(135deg, #0F6BB5 0%, #0A4D85 100%)",
    categories: { dining: 3, drugstores: 3, travel: 5, groceries: 1.5, gas: 1.5, streaming: 1.5, online_shopping: 1.5, transit: 1.5, general: 1.5 },
  },
  {
    id: "chase-freedom-flex", name: "Chase Freedom Flex", issuer: "Chase", shortName: "Freedom Flex",
    annualFee: 0, currency: "Ultimate Rewards",
    color: "#3A7FCA", gradient: "linear-gradient(135deg, #3A7FCA 0%, #2260A0 100%)",
    categories: { dining: 3, drugstores: 3, travel: 5, groceries: 1, gas: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  {
    id: "chase-sapphire-reserve-biz", name: "Chase Sapphire Reserve for Business", issuer: "Chase", shortName: "CSR Business",
    annualFee: 550, currency: "Ultimate Rewards",
    color: "#1A1F71", gradient: "linear-gradient(135deg, #1A1F71 0%, #0D1038 100%)",
    categories: { hotels: 10, flights: 5, dining: 3, travel: 3, groceries: 1, gas: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
    note: "10x on hotels via Chase Travel, 5x on flights via Chase Travel, 3x on dining and other travel.",
  },
  {
    id: "chase-ink-preferred", name: "Chase Ink Business Preferred", issuer: "Chase", shortName: "Ink Preferred",
    annualFee: 95, currency: "Ultimate Rewards",
    color: "#1A1F71", gradient: "linear-gradient(135deg, #2C3E8C 0%, #1A1F71 100%)",
    categories: { travel: 3, shipping: 3, online_shopping: 3, streaming: 3, phone_plans: 3, groceries: 1, gas: 1, dining: 1, transit: 1, general: 1 },
    note: "3x on first $150K/yr in travel, shipping, internet/cable/phone, online ads. Business card.",
  },
  // ---- CAPITAL ONE ----
  {
    id: "cap1-venture-x", name: "Capital One Venture X", issuer: "Capital One", shortName: "Venture X",
    annualFee: 395, currency: "Capital One Miles",
    color: "#333333", gradient: "linear-gradient(135deg, #333 0%, #555 50%, #333 100%)",
    categories: { flights: 5, hotels: 10, car_rental: 5, dining: 2, groceries: 2, gas: 2, travel: 2, streaming: 2, online_shopping: 2, transit: 2, general: 2 },
  },
  {
    id: "cap1-venture", name: "Capital One Venture", issuer: "Capital One", shortName: "Venture",
    annualFee: 95, currency: "Capital One Miles",
    color: "#444", gradient: "linear-gradient(135deg, #444 0%, #666 100%)",
    categories: { flights: 5, hotels: 5, car_rental: 5, dining: 2, groceries: 2, gas: 2, travel: 2, streaming: 2, online_shopping: 2, transit: 2, general: 2 },
  },
  {
    id: "cap1-savor", name: "Capital One Savor", issuer: "Capital One", shortName: "Savor",
    annualFee: 0, currency: "Cash Back",
    color: "#2B6E44", gradient: "linear-gradient(135deg, #2B6E44 0%, #1E5233 100%)",
    categories: { dining: 3, groceries: 3, streaming: 3, entertainment: 3, gas: 1, transit: 1, travel: 1, online_shopping: 1, general: 1 },
  },
  {
    id: "cap1-quicksilver", name: "Capital One Quicksilver", issuer: "Capital One", shortName: "Quicksilver",
    annualFee: 0, currency: "Cash Back",
    color: "#5A5A5A", gradient: "linear-gradient(135deg, #6A6A6A 0%, #4A4A4A 100%)",
    categories: { flights: 5, hotels: 5, car_rental: 5, dining: 1.5, groceries: 1.5, gas: 1.5, travel: 1.5, streaming: 1.5, online_shopping: 1.5, transit: 1.5, drugstores: 1.5, home_improvement: 1.5, general: 1.5 },
  },
  {
    id: "cap1-savor-one", name: "Capital One SavorOne", issuer: "Capital One", shortName: "SavorOne",
    annualFee: 0, currency: "Cash Back",
    color: "#004977", gradient: "linear-gradient(135deg, #004977 0%, #002A4A 100%)",
    categories: { dining: 3, groceries: 3, streaming: 3, entertainment: 3, gas: 1, transit: 1, travel: 1, online_shopping: 1, general: 1 },
    note: "3% on dining, groceries, streaming, entertainment. No annual fee.",
  },
  // ---- CITI ----
  {
    id: "citi-double-cash", name: "Citi Double Cash", issuer: "Citi", shortName: "Double Cash",
    annualFee: 0, currency: "ThankYou Points",
    color: "#004B87", gradient: "linear-gradient(135deg, #004B87 0%, #003560 100%)",
    categories: { dining: 2, groceries: 2, gas: 2, travel: 2, flights: 2, hotels: 2, streaming: 2, online_shopping: 2, transit: 2, drugstores: 2, home_improvement: 2, general: 2 },
  },
  {
    id: "citi-custom-cash", name: "Citi Custom Cash", issuer: "Citi", shortName: "Custom Cash",
    annualFee: 0, currency: "ThankYou Points",
    color: "#0066A1", gradient: "linear-gradient(135deg, #0066A1 0%, #004775 100%)",
    categories: { dining: 5, groceries: 5, gas: 5, travel: 5, streaming: 5, drugstores: 5, home_improvement: 5, online_shopping: 1, transit: 1, general: 1 },
  },
  {
    id: "citi-strata-premier", name: "Citi Strata Premier", issuer: "Citi", shortName: "Strata Premier",
    annualFee: 95, currency: "ThankYou Points",
    color: "#1A1A4E", gradient: "linear-gradient(135deg, #1A1A4E 0%, #2D2D7A 100%)",
    categories: { flights: 3, hotels: 3, dining: 3, groceries: 3, gas: 3, travel: 3, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  {
    id: "citi-strata-elite", name: "Citi Strata Elite", issuer: "Citi", shortName: "Strata Elite",
    annualFee: 595, currency: "ThankYou Points",
    color: "#003B70", gradient: "linear-gradient(135deg, #1A1A2E 0%, #003B70 100%)",
    categories: { hotels: 12, flights: 6, dining: 3, groceries: 1.5, gas: 1.5, travel: 1.5, streaming: 1.5, online_shopping: 1.5, transit: 1.5, general: 1.5 },
    note: "12x hotels via Citi Travel, 6x flights via Citi Travel, 3x restaurants, 1.5x everything else.",
  },
  // ---- WELLS FARGO ----
  {
    id: "wf-autograph", name: "Wells Fargo Autograph", issuer: "Wells Fargo", shortName: "Autograph",
    annualFee: 0, currency: "WF Rewards",
    color: "#D71E28", gradient: "linear-gradient(135deg, #D71E28 0%, #A3161E 100%)",
    categories: { dining: 3, travel: 3, flights: 3, hotels: 3, gas: 3, transit: 3, streaming: 3, groceries: 1, online_shopping: 1, general: 1 },
  },
  {
    id: "wf-active-cash", name: "Wells Fargo Active Cash", issuer: "Wells Fargo", shortName: "Active Cash",
    annualFee: 0, currency: "Cash Back",
    color: "#E03C31", gradient: "linear-gradient(135deg, #E03C31 0%, #B52D24 100%)",
    categories: { dining: 2, groceries: 2, gas: 2, travel: 2, flights: 2, hotels: 2, streaming: 2, online_shopping: 2, transit: 2, drugstores: 2, home_improvement: 2, general: 2 },
  },
  {
    id: "wf-autograph-journey", name: "Wells Fargo Autograph Journey", issuer: "Wells Fargo", shortName: "Autograph Journey",
    annualFee: 95, currency: "WF Rewards",
    color: "#8B1A1A", gradient: "linear-gradient(135deg, #8B1A1A 0%, #5C1111 100%)",
    categories: { hotels: 5, flights: 4, dining: 3, travel: 3, gas: 1, groceries: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  // ---- DISCOVER ----
  {
    id: "discover-it", name: "Discover It Cash Back", issuer: "Discover", shortName: "Discover It",
    annualFee: 0, currency: "Cash Back",
    color: "#FF6B00", gradient: "linear-gradient(135deg, #FF6B00 0%, #CC5500 100%)",
    categories: { dining: 1, groceries: 1, gas: 1, travel: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  {
    id: "discover-it-chrome", name: "Discover it Chrome", issuer: "Discover", shortName: "Discover Chrome",
    annualFee: 0, currency: "Cash Back",
    color: "#FF6000", gradient: "linear-gradient(135deg, #FF6000 0%, #CC4D00 100%)",
    categories: { dining: 2, gas: 2, groceries: 1, travel: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
    note: "2% at gas stations and restaurants (on up to $1,000/qtr), 1% everything else. Cashback Match first year.",
  },
  // ---- BANK OF AMERICA ----
  {
    id: "bofa-customized-cash", name: "Bank of America Customized Cash", issuer: "Bank of America", shortName: "BofA Custom Cash",
    annualFee: 0, currency: "Cash Back",
    color: "#DC1431", gradient: "linear-gradient(135deg, #DC1431 0%, #A00E24 100%)",
    categories: { dining: 2, groceries: 2, gas: 3, travel: 1, online_shopping: 3, streaming: 1, transit: 1, drugstores: 1, home_improvement: 1, general: 1 },
  },
  {
    id: "bofa-unlimited-cash", name: "Bank of America Unlimited Cash", issuer: "Bank of America", shortName: "BofA Unlimited",
    annualFee: 0, currency: "Cash Back",
    color: "#C41230", gradient: "linear-gradient(135deg, #C41230 0%, #8C0D22 100%)",
    categories: { dining: 1.5, groceries: 1.5, gas: 1.5, travel: 1.5, flights: 1.5, hotels: 1.5, streaming: 1.5, online_shopping: 1.5, transit: 1.5, drugstores: 1.5, home_improvement: 1.5, general: 1.5 },
  },
  // ---- US BANK ----
  {
    id: "usbank-cash-plus", name: "U.S. Bank Cash+", issuer: "U.S. Bank", shortName: "Cash+",
    annualFee: 0, currency: "Cash Back",
    color: "#1D2951", gradient: "linear-gradient(135deg, #1D2951 0%, #0F1730 100%)",
    categories: { streaming: 5, home_improvement: 5, gas: 2, groceries: 2, dining: 1, travel: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  {
    id: "usbank-altitude-go", name: "U.S. Bank Altitude Go", issuer: "U.S. Bank", shortName: "Altitude Go",
    annualFee: 0, currency: "Points",
    color: "#0C2340", gradient: "linear-gradient(135deg, #0C2340 0%, #061224 100%)",
    categories: { dining: 4, groceries: 2, gas: 2, streaming: 2, travel: 1, online_shopping: 1, transit: 1, general: 1 },
    note: "4x on dining, 2x on groceries, gas stations, streaming, EV charging. No annual fee.",
  },
  {
    id: "usbank-altitude-connect", name: "U.S. Bank Altitude Connect", issuer: "U.S. Bank", shortName: "Altitude Connect",
    annualFee: 95, currency: "Points",
    color: "#0C2340", gradient: "linear-gradient(135deg, #1A3D6B 0%, #0C2340 100%)",
    categories: { travel: 5, gas: 4, groceries: 2, streaming: 2, dining: 2, online_shopping: 1, transit: 1, general: 1 },
    note: "5x travel (via Real-Time Rewards), 4x gas/EV, 2x groceries, streaming, dining.",
  },
  // ---- AMAZON ----
  {
    id: "amazon-prime-visa", name: "Amazon Prime Visa", issuer: "Chase", shortName: "Amazon Prime Visa",
    annualFee: 0, currency: "Cash Back",
    color: "#232F3E", gradient: "linear-gradient(135deg, #232F3E 0%, #131921 100%)",
    categories: { online_shopping: 5, groceries: 2, dining: 2, gas: 2, transit: 2, drugstores: 2, travel: 1, streaming: 1, general: 1 },
  },
  // ---- APPLE ----
  {
    id: "apple-card", name: "Apple Card", issuer: "Goldman Sachs", shortName: "Apple Card",
    annualFee: 0, currency: "Daily Cash",
    color: "#F5F5F7", gradient: "linear-gradient(135deg, #F5F5F7 0%, #D2D2D7 100%)",
    categories: { online_shopping: 2, dining: 2, groceries: 2, gas: 2, transit: 2, streaming: 2, travel: 2, drugstores: 2, home_improvement: 2, general: 1 },
  },
  // ---- HOTEL & AIRLINE CO-BRANDS ----
  {
    id: "marriott-bonvoy-boundless", name: "Marriott Bonvoy Boundless", issuer: "Chase", shortName: "Bonvoy Boundless",
    annualFee: 95, currency: "Marriott Bonvoy Points",
    color: "#8B1A1A", gradient: "linear-gradient(135deg, #8B1A1A 0%, #5C0000 100%)",
    categories: { hotels: 6, groceries: 3, gas: 3, dining: 2, travel: 2, flights: 2, streaming: 2, online_shopping: 2, transit: 2, general: 2 },
    note: "6x at Marriott properties, 3x groceries & gas, 2x dining & everything else.",
  },
  {
    id: "hilton-honors-surpass", name: "Hilton Honors Surpass", issuer: "American Express", shortName: "Hilton Surpass",
    annualFee: 150, currency: "Hilton Honors Points",
    color: "#003366", gradient: "linear-gradient(135deg, #003366 0%, #001A33 100%)",
    categories: { hotels: 12, dining: 6, groceries: 6, gas: 6, flights: 3, travel: 3, streaming: 3, online_shopping: 3, transit: 3, general: 3 },
    note: "12x at Hilton, 6x at restaurants, supermarkets, gas. 3x everything else.",
  },
  {
    id: "delta-skymiles-gold", name: "Delta SkyMiles Gold", issuer: "American Express", shortName: "Delta Gold",
    annualFee: 150, currency: "Delta SkyMiles",
    color: "#003366", gradient: "linear-gradient(135deg, #C41230 0%, #003366 100%)",
    categories: { flights: 2, dining: 2, groceries: 2, gas: 1, travel: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
    note: "2x on Delta purchases, dining, and at U.S. supermarkets. Free checked bag on Delta flights.",
  },
  {
    id: "united-explorer", name: "United Explorer Card", issuer: "Chase", shortName: "United Explorer",
    annualFee: 95, currency: "United MileagePlus Miles",
    color: "#002244", gradient: "linear-gradient(135deg, #002244 0%, #004488 100%)",
    categories: { flights: 2, hotels: 2, dining: 2, gas: 1, groceries: 1, travel: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
    note: "2x on United, hotels, dining, and eligible delivery. Free checked bag on United flights.",
  },
  {
    id: "southwest-rapid-rewards-plus", name: "Southwest Rapid Rewards Plus", issuer: "Chase", shortName: "SW RR Plus",
    annualFee: 69, currency: "Southwest Points",
    color: "#304CB2", gradient: "linear-gradient(135deg, #304CB2 0%, #1A2A6C 100%)",
    categories: { flights: 2, hotels: 2, transit: 2, gas: 1, groceries: 1, dining: 1, travel: 1, streaming: 1, online_shopping: 1, general: 1 },
    note: "2x on Southwest, Rapid Rewards hotels, transit. Anniversary points bonus.",
  },
  {
    id: "ihg-one-rewards-premier", name: "IHG One Rewards Premier", issuer: "Chase", shortName: "IHG Premier",
    annualFee: 99, currency: "IHG Points",
    color: "#006633", gradient: "linear-gradient(135deg, #006633 0%, #003D1F 100%)",
    categories: { hotels: 10, gas: 5, dining: 5, groceries: 5, flights: 3, travel: 3, streaming: 3, online_shopping: 3, transit: 3, general: 3 },
    note: "Up to 26x at IHG hotels, 5x gas/dining/groceries, 3x everything else. Annual free night.",
  },
  {
    id: "world-of-hyatt", name: "World of Hyatt Credit Card", issuer: "Chase", shortName: "World of Hyatt",
    annualFee: 95, currency: "World of Hyatt Points",
    color: "#6B2D5B", gradient: "linear-gradient(135deg, #6B2D5B 0%, #3D1A35 100%)",
    categories: { hotels: 4, dining: 2, flights: 2, gas: 1, groceries: 1, travel: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
    note: "4x at Hyatt, 2x dining, 2x flights, 1x everything else. Annual free night up to Cat 4.",
  },
  {
    id: "hilton-honors-no-fee", name: "Hilton Honors Card", issuer: "American Express", shortName: "Hilton No-Fee",
    annualFee: 0, currency: "Hilton Honors Points",
    color: "#003366", gradient: "linear-gradient(135deg, #4A8CC7 0%, #003366 100%)",
    categories: { hotels: 7, dining: 5, groceries: 5, gas: 5, flights: 3, travel: 3, streaming: 3, online_shopping: 3, transit: 3, general: 3 },
    note: "7x at Hilton, 5x dining/groceries/gas, 3x everything else. No annual fee.",
  },
  {
    id: "alaska-airlines-visa", name: "Alaska Airlines Visa Signature", issuer: "Bank of America", shortName: "Alaska Airlines",
    annualFee: 95, currency: "Alaska Mileage Plan Miles",
    color: "#00274C", gradient: "linear-gradient(135deg, #00274C 0%, #004D40 100%)",
    categories: { flights: 3, hotels: 2, dining: 2, gas: 1, groceries: 1, travel: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
    note: "3x on Alaska purchases, 2x on dining, transit, eligible streaming. Companion Fare from $99.",
  },
  // ---- BILT ----
  {
    id: "bilt-blue", name: "Bilt Blue Card", issuer: "Bilt Rewards", shortName: "Bilt Blue",
    annualFee: 0, currency: "Bilt Points",
    color: "#1E3A5F", gradient: "linear-gradient(135deg, #1E3A5F 0%, #0F1F33 100%)",
    categories: { dining: 1, groceries: 1, gas: 1, travel: 1, flights: 1, hotels: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
    note: "1x on all purchases + earn points on rent/mortgage with no transaction fee. 4% Bilt Cash on everyday spend.",
  },
  {
    id: "bilt-obsidian", name: "Bilt Obsidian Card", issuer: "Bilt Rewards", shortName: "Bilt Obsidian",
    annualFee: 95, currency: "Bilt Points",
    color: "#2D2D2D", gradient: "linear-gradient(135deg, #2D2D2D 0%, #0A0A0A 100%)",
    categories: { dining: 3, groceries: 3, travel: 2, flights: 2, hotels: 2, gas: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
    note: "3x on dining OR grocery (choose annually, grocery up to $25K/yr), 2x travel, 1x everything else. Points on rent/mortgage.",
  },
  {
    id: "bilt-palladium", name: "Bilt Palladium Card", issuer: "Bilt Rewards", shortName: "Bilt Palladium",
    annualFee: 495, currency: "Bilt Points",
    color: "#4A4A4A", gradient: "linear-gradient(135deg, #8C8C8C 0%, #3D3D3D 50%, #4A4A4A 100%)",
    categories: { dining: 2, groceries: 2, gas: 2, travel: 2, flights: 2, hotels: 2, streaming: 2, online_shopping: 2, transit: 2, drugstores: 2, home_improvement: 2, general: 2 },
    note: "2x on all purchases. Points on rent/mortgage. Priority Pass, $300 Bilt Travel Hotel credits. TPG values Bilt points at 2.2cpp.",
  },
  // ---- ADDITIONAL CARDS ----
  {
    id: "costco-anywhere-visa", name: "Costco Anywhere Visa", issuer: "Citi", shortName: "Costco Visa",
    annualFee: 0, currency: "Cash Back",
    color: "#E31837", gradient: "linear-gradient(135deg, #E31837 0%, #005DAA 100%)",
    categories: { gas: 4, dining: 3, travel: 3, groceries: 2, flights: 2, hotels: 2, online_shopping: 1, streaming: 1, transit: 1, general: 1 },
    note: "4% gas (up to $7K/yr), 3% dining & travel, 2% Costco, 1% everything else. Requires Costco membership.",
  },
  {
    id: "usbank-altitude-reserve", name: "U.S. Bank Altitude Reserve", issuer: "U.S. Bank", shortName: "Altitude Reserve",
    annualFee: 400, currency: "Points",
    color: "#0C2340", gradient: "linear-gradient(135deg, #2D5F8A 0%, #0C2340 100%)",
    categories: { travel: 3, dining: 3, gas: 1, groceries: 1, streaming: 1, online_shopping: 1, transit: 1, flights: 1, hotels: 1, general: 1 },
    note: "3x on travel and dining via mobile wallet, 1x everything else. $325 annual travel credit.",
  },
  {
    id: "citi-strata", name: "Citi Strata Card", issuer: "Citi", shortName: "Citi Strata",
    annualFee: 0, currency: "ThankYou Points",
    color: "#004B87", gradient: "linear-gradient(135deg, #3A7FCA 0%, #004B87 100%)",
    categories: { hotels: 5, gas: 3, groceries: 3, transit: 3, streaming: 3, general: 1 },
    note: "5x hotels/car/attractions via Citi Travel, 3x gas, groceries, transit, self-select category. No annual fee.",
  },
  {
    id: "venture-one", name: "Capital One VentureOne", issuer: "Capital One", shortName: "VentureOne",
    annualFee: 0, currency: "Capital One Miles",
    color: "#555", gradient: "linear-gradient(135deg, #777 0%, #444 100%)",
    categories: { hotels: 5, flights: 5, car_rental: 5, dining: 1.25, groceries: 1.25, gas: 1.25, travel: 1.25, streaming: 1.25, online_shopping: 1.25, transit: 1.25, general: 1.25 },
    note: "1.25x on everything, 5x on hotels/flights via Capital One Travel. No annual fee.",
  },
  {
    id: "amex-everyday-preferred", name: "Amex EveryDay Preferred", issuer: "American Express", shortName: "EveryDay Pref.",
    annualFee: 95, currency: "Membership Rewards",
    color: "#006FCF", gradient: "linear-gradient(135deg, #006FCF 0%, #004A99 100%)",
    categories: { groceries: 3, gas: 2, dining: 1, travel: 1, flights: 1, hotels: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
    note: "3x at U.S. supermarkets (up to $6K/yr), 2x at gas stations. 50% bonus when you make 30+ purchases/mo.",
  },
];

// ============================================
// MERCHANT → CATEGORY MAP
// ============================================
const MC = {
  "whole foods":"groceries","trader joes":"groceries","trader joe's":"groceries","costco":"groceries","kroger":"groceries","safeway":"groceries","aldi":"groceries","publix":"groceries","wegmans":"groceries","heb":"groceries","h-e-b":"groceries","target":"groceries","walmart grocery":"groceries","instacart":"groceries","freshdirect":"groceries","sprouts":"groceries","stop and shop":"groceries","giant":"groceries","food lion":"groceries","piggly wiggly":"groceries","harris teeter":"groceries","meijer":"groceries","lidl":"groceries",
  "chipotle":"dining","starbucks":"dining","mcdonalds":"dining","mcdonald's":"dining","chick-fil-a":"dining","sweetgreen":"dining","doordash":"dining","uber eats":"dining","ubereats":"dining","grubhub":"dining","seamless":"dining","postmates":"dining","panera":"dining","shake shack":"dining","dominos":"dining","domino's":"dining","olive garden":"dining","cheesecake factory":"dining","restaurant":"dining","cafe":"dining","pizza":"dining","sushi":"dining","ramen":"dining","taco bell":"dining","wendys":"dining","wendy's":"dining","popeyes":"dining","five guys":"dining","in-n-out":"dining","panda express":"dining","nobu":"dining","peter luger":"dining","cava":"dining","wingstop":"dining","nandos":"dining","nando's":"dining","buffalo wild wings":"dining","applebees":"dining","applebee's":"dining","ihop":"dining","denny's":"dining","waffle house":"dining","cracker barrel":"dining","chilis":"dining","chili's":"dining","outback":"dining","red lobster":"dining","texas roadhouse":"dining","raising canes":"dining","raising cane's":"dining","jersey mikes":"dining","jersey mike's":"dining","subway restaurant":"dining","jimmy johns":"dining","jimmy john's":"dining","papa johns":"dining","papa john's":"dining","pizza hut":"dining","little caesars":"dining",
  "delta":"flights","united":"flights","american airlines":"flights","southwest":"flights","jetblue":"flights","alaska airlines":"flights","spirit":"flights","frontier":"flights","british airways":"flights","lufthansa":"flights","emirates":"flights","qatar":"flights","singapore airlines":"flights","air france":"flights",
  "marriott":"hotels","hilton":"hotels","hyatt":"hotels","ihg":"hotels","airbnb":"hotels","vrbo":"hotels","booking.com":"hotels","hotels.com":"hotels","expedia":"hotels","four seasons":"hotels","ritz carlton":"hotels",
  "shell":"gas","exxon":"gas","chevron":"gas","bp":"gas","mobil":"gas","sunoco":"gas","citgo":"gas","speedway":"gas","wawa":"gas","sheetz":"gas","buc-ees":"gas","buc-ee's":"gas",
  "uber":"transit","lyft":"transit","subway":"transit","mta":"transit","metro":"transit","amtrak":"transit",
  "netflix":"streaming","spotify":"streaming","hulu":"streaming","disney+":"streaming","disney plus":"streaming","hbo max":"streaming","max":"streaming","apple tv":"streaming","youtube premium":"streaming","peacock":"streaming","paramount+":"streaming","apple music":"streaming","tidal":"streaming","audible":"streaming",
  "amazon":"online_shopping","walmart":"online_shopping","ebay":"online_shopping","etsy":"online_shopping","wayfair":"online_shopping","best buy":"online_shopping","apple store":"online_shopping","nike":"online_shopping","adidas":"online_shopping","nordstrom":"online_shopping","zara":"online_shopping","uniqlo":"online_shopping","j crew":"online_shopping","brooks brothers":"online_shopping","ralph lauren":"online_shopping","lululemon":"online_shopping","target online":"online_shopping","macys":"online_shopping","macy's":"online_shopping","bloomingdales":"online_shopping","saks":"online_shopping","neiman marcus":"online_shopping","gap":"online_shopping","old navy":"online_shopping","banana republic":"online_shopping","h&m":"online_shopping",
  "cvs":"drugstores","walgreens":"drugstores","rite aid":"drugstores","duane reade":"drugstores",
  "home depot":"home_improvement","lowes":"home_improvement","lowe's":"home_improvement","ace hardware":"home_improvement","menards":"home_improvement",
  "hertz":"car_rental","avis":"car_rental","enterprise":"car_rental","turo":"car_rental","national":"car_rental","budget":"car_rental",
  "kayak":"travel","google flights":"travel","tripadvisor":"travel","priceline":"travel","hopper":"travel",
  // Entertainment
  "amc":"entertainment","regal":"entertainment","cinemark":"entertainment","ticketmaster":"entertainment","stubhub":"entertainment","seatgeek":"entertainment","topgolf":"entertainment","dave and busters":"entertainment","bowlero":"entertainment",
  // Phone plans
  "verizon":"phone_plans","t-mobile":"phone_plans","at&t":"phone_plans","att":"phone_plans","mint mobile":"phone_plans","google fi":"phone_plans",
  // Fitness
  "planet fitness":"fitness","equinox":"fitness","orangetheory":"fitness","peloton":"fitness","la fitness":"fitness","crunch fitness":"fitness",
  // Additional dining
  "crumbl":"dining","dunkin":"dining","dunkin donuts":"dining",
  // Additional gas
  "marathon":"gas","circle k":"gas","7-eleven":"gas","quiktrip":"gas","ev charging":"gas","chargepoint":"gas","electrify america":"gas",
  // Additional online shopping
  "shein":"online_shopping","temu":"online_shopping",
  // Shipping
  "ups":"shipping","fedex":"shipping","usps":"shipping",
  // Additional groceries
  "shoprite":"groceries","winn-dixie":"groceries","amazon fresh":"groceries",
  // Rent & mortgage
  "rent":"general","mortgage":"general",
};

const CATEGORY_LABELS = { dining:"Dining",groceries:"Groceries",flights:"Flights",hotels:"Hotels",gas:"Gas",transit:"Transit & Rideshare",streaming:"Streaming",online_shopping:"Online Shopping",drugstores:"Drugstores",home_improvement:"Home Improvement",car_rental:"Car Rental",travel:"Travel",entertainment:"Entertainment",phone_plans:"Phone Plans",fitness:"Fitness",shipping:"Shipping",general:"Everything Else" };
const CATEGORY_ICONS = { dining:"🍽️",groceries:"🛒",flights:"✈️",hotels:"🏨",gas:"⛽",transit:"🚗",streaming:"📺",online_shopping:"🛍️",drugstores:"💊",home_improvement:"🔨",car_rental:"🚙",travel:"🌍",entertainment:"🎭",phone_plans:"📱",fitness:"🏋️",shipping:"📦",general:"💳" };

// ============================================
// CONFETTI
// ============================================
function Confetti({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const c = canvasRef.current, ctx = c.getContext("2d");
    c.width = c.offsetWidth * 2; c.height = c.offsetHeight * 2; ctx.scale(2, 2);
    const colors = ["#00DC82","#00F0FF","#FFD700","#FF6B6B","#A78BFA","#FFF"];
    const ps = Array.from({ length: 80 }, () => ({
      x: Math.random() * c.offsetWidth, y: -20 - Math.random() * 200,
      w: 4 + Math.random() * 6, h: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: 1.5 + Math.random() * 3, vx: (Math.random() - 0.5) * 2,
      rot: Math.random() * 360, vr: (Math.random() - 0.5) * 8, op: 1,
    }));
    const go = () => {
      ctx.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
      let alive = false;
      ps.forEach(p => {
        if (p.op <= 0) return; alive = true;
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        if (p.y > c.offsetHeight * 0.7) p.op -= 0.02;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.op); ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (alive) animRef.current = requestAnimationFrame(go);
    };
    go();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",zIndex:50,width:"100%",height:"100%" }} />;
}

// ============================================
// ANIMATED NUMBER
// ============================================
function AnimNum({ value, suffix = "x" }) {
  const [d, setD] = useState(0);
  const s = useRef(null);
  useEffect(() => {
    s.current = performance.now();
    const go = (now) => {
      const p = Math.min((now - s.current) / 600, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setD(value * e);
      if (p < 1) requestAnimationFrame(go);
    };
    requestAnimationFrame(go);
  }, [value]);
  return <span>{d % 1 === 0 ? Math.round(d) : d.toFixed(1)}{suffix}</span>;
}

// ============================================
// CARD CHIP
// ============================================
function Chip({ card, selected, onToggle }) {
  const [h, setH] = useState(false);
  const isDark = card.id !== "apple-card";
  return (
    <button onClick={() => onToggle(card.id)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",borderRadius:"12px",
        border: selected ? "2px solid #00DC82" : "2px solid rgba(255,255,255,0.06)",
        backgroundColor: selected ? "rgba(0,220,130,0.08)" : h ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        color: selected ? "#00DC82" : "rgba(255,255,255,0.7)",cursor:"pointer",fontFamily:"'Syne',sans-serif",
        fontSize:"12.5px",fontWeight:600,transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)",whiteSpace:"nowrap",
        transform: selected ? "scale(1.02)" : h ? "scale(1.01)" : "scale(1)",
      }}>
      <div style={{ width:"36px",height:"22px",borderRadius:"4px",background:card.gradient,flexShrink:0,
        boxShadow: selected ? "0 0 12px rgba(0,220,130,0.3)" : "0 2px 4px rgba(0,0,0,0.3)",
        border: !isDark ? "1px solid rgba(0,0,0,0.15)" : "none" }} />
      <span style={{ overflow:"hidden",textOverflow:"ellipsis" }}>{card.shortName}</span>
      {selected && <span style={{ width:"16px",height:"16px",borderRadius:"50%",backgroundColor:"#00DC82",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",color:"#0A0F1A",fontWeight:800,flexShrink:0 }}>✓</span>}
    </button>
  );
}

// ============================================
// RESULT ROW
// ============================================
function ResultRow({ card, rate, rank, maxRate, isOnly }) {
  const isTop = rank === 0;
  const pct = maxRate > 0 ? (rate / maxRate) * 100 : 0;
  const isDark = card.id !== "apple-card";
  return (
    <div style={{
      display:"flex",alignItems:"center",gap:"14px",padding: isTop ? "18px 20px" : "14px 20px",borderRadius:"14px",
      backgroundColor: isTop ? "rgba(0,220,130,0.06)" : "rgba(255,255,255,0.02)",
      border: isTop ? "1.5px solid rgba(0,220,130,0.25)" : "1.5px solid rgba(255,255,255,0.04)",
      animation:`rSlide 0.4s cubic-bezier(0.16,1,0.3,1) ${rank*0.08}s both`,overflow:"hidden",
    }}>
      <div style={{ width:"28px",height:"28px",borderRadius:"8px",
        backgroundColor: isTop ? "#00DC82" : "rgba(255,255,255,0.06)",
        color: isTop ? "#0A0F1A" : "rgba(255,255,255,0.3)",
        display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",
        fontSize:"12px",fontWeight:800,flexShrink:0 }}>{rank+1}</div>
      <div style={{ width:"42px",height:"26px",borderRadius:"5px",background:card.gradient,flexShrink:0,
        boxShadow: isTop ? "0 0 16px rgba(0,220,130,0.2)" : "0 2px 6px rgba(0,0,0,0.3)",
        border: !isDark ? "1px solid rgba(0,0,0,0.15)" : "none" }} />
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize: isTop?"14px":"13px",
          color: isTop?"#FFF":"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",gap:"8px" }}>
          <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{card.shortName}</span>
          {isTop && !isOnly && <span style={{ fontSize:"9px",fontWeight:800,letterSpacing:"0.1em",
            textTransform:"uppercase",padding:"3px 8px",borderRadius:"4px",
            backgroundColor:"#00DC82",color:"#0A0F1A",flexShrink:0 }}>Best</span>}
        </div>
        <div style={{ fontFamily:"'Outfit',sans-serif",fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"2px" }}>
          {card.currency}{card.annualFee > 0 ? ` · ${card.annualFee}/yr` : " · No fee"}
        </div>
        <div style={{ marginTop:"6px",height:"3px",borderRadius:"2px",backgroundColor:"rgba(255,255,255,0.06)",overflow:"hidden",maxWidth:"140px" }}>
          <div style={{ height:"100%",width:`${pct}%`,borderRadius:"2px",
            backgroundColor: isTop?"#00DC82":"rgba(255,255,255,0.15)",
            transition:`width 0.6s cubic-bezier(0.16,1,0.3,1)`,transitionDelay:`${rank*0.08+0.3}s` }} />
        </div>
      </div>
      <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize: isTop?"26px":"20px",
        color: isTop?"#00DC82":"rgba(255,255,255,0.4)",letterSpacing:"-0.02em",flexShrink:0 }}>
        {isTop ? <AnimNum value={rate} /> : `${rate}x`}
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function CardAdvisor() {
  const [sel, setSel] = useState([]);
  const [input, setInput] = useState("");
  const [view, setView] = useState("wallet");
  const [confetti, setConfetti] = useState(false);
  const [lastTop, setLastTop] = useState(null);
  const [lookups, setLookups] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [search, setSearch] = useState("");
  const [showAllCats, setShowAllCats] = useState(false);
  const ref = useRef(null);

  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const walletLoaded = useRef(false);
  const userRef = useRef(null);
  const lookupsRef = useRef(lookups);
  const totalSavedRef = useRef(totalSaved);

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    }).catch(() => {
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Keep refs in sync so save effects can read them without depending on them
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { lookupsRef.current = lookups; }, [lookups]);
  useEffect(() => { totalSavedRef.current = totalSaved; }, [totalSaved]);

  const signIn = () => supabase.auth.signInWithOAuth({ provider: "google" });
  const signOut = () => supabase.auth.signOut();

  // Load wallet + stats: from Supabase if logged in, else localStorage
  useEffect(() => {
    console.log("[LOAD] effect fired — authLoading:", authLoading, "user:", user?.id ?? null);
    if (authLoading) { console.log("[LOAD] still loading auth, skipping"); return; }
    walletLoaded.current = false;
    if (user) {
      console.log("[LOAD] fetching wallet from Supabase for user:", user.id);
      supabase
        .from("user_wallets")
        .select("card_ids, lookups, total_saved")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          console.log("[LOAD] Supabase response — data:", data, "error:", error);
          if (error) console.error("Wallet load error:", error);
          if (data?.card_ids?.length) {
            console.log("[LOAD] setting sel to", data.card_ids);
            setSel(data.card_ids);
            setView("dashboard");
          } else {
            console.log("[LOAD] no card_ids found in Supabase (data was:", data, ")");
          }
          if (data?.lookups != null) setLookups(data.lookups);
          if (data?.total_saved != null) setTotalSaved(data.total_saved);
          walletLoaded.current = true;
          console.log("[LOAD] walletLoaded set to true");
        });
    } else {
      console.log("[LOAD] no user, loading from localStorage");
      try {
        const s = window.localStorage?.getItem?.("ca_cards");
        console.log("[LOAD] localStorage ca_cards:", s);
        if (s) {
          const parsed = JSON.parse(s);
          setSel(parsed);
          if (parsed.length) setView("dashboard");
        }
      } catch {}
      try {
        const l = window.localStorage?.getItem?.("ca_lookups");
        if (l) setLookups(parseInt(l));
        const t = window.localStorage?.getItem?.("ca_saved");
        if (t) setTotalSaved(parseFloat(t));
      } catch {}
      walletLoaded.current = true;
    }
  }, [user, authLoading]);

  // Save wallet: to Supabase if logged in, always to localStorage.
  // Only depends on [sel] — NOT on user/authLoading — so it only fires
  // when the user actually changes their card selection, never on auth changes.
  useEffect(() => {
    console.log("[SAVE] effect fired — sel:", sel, "walletLoaded:", walletLoaded.current, "userRef:", userRef.current?.id ?? null);
    if (!walletLoaded.current) { console.log("[SAVE] walletLoaded is false, skipping"); return; }
    try { window.localStorage?.setItem?.("ca_cards", JSON.stringify(sel)); } catch {}
    if (userRef.current) {
      const payload = { user_id: userRef.current.id, card_ids: sel, lookups: lookupsRef.current, total_saved: totalSavedRef.current, updated_at: new Date().toISOString() };
      console.log("[SAVE] upserting to Supabase:", payload);
      supabase
        .from("user_wallets")
        .upsert(payload, { onConflict: "user_id" })
        .then(({ data, error }) => {
          console.log("[SAVE] Supabase upsert response — data:", data, "error:", error);
        });
    } else {
      console.log("[SAVE] no user, saved to localStorage only");
    }
  }, [sel]);

  // Save stats: to Supabase if logged in (debounced), always to localStorage.
  const statsTimer = useRef(null);
  useEffect(() => {
    if (!walletLoaded.current) return;
    try { window.localStorage?.setItem?.("ca_lookups", lookups.toString()); } catch {}
    try { window.localStorage?.setItem?.("ca_saved", totalSaved.toString()); } catch {}
    if (userRef.current) {
      clearTimeout(statsTimer.current);
      statsTimer.current = setTimeout(() => {
        const payload = { user_id: userRef.current.id, lookups, total_saved: totalSaved, updated_at: new Date().toISOString() };
        console.log("[SAVE-STATS] upserting to Supabase:", payload);
        supabase
          .from("user_wallets")
          .upsert(payload, { onConflict: "user_id" })
          .then(({ data, error }) => {
            if (error) console.error("[SAVE-STATS] error:", error);
          });
      }, 2000);
    }
    return () => clearTimeout(statsTimer.current);
  }, [lookups, totalSaved]);

  const toggle = (id) => setSel(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);

  const resolveCatSync = useCallback((i) => {
    const l = i.toLowerCase().trim();
    if (!l) return null;
    if (MC[l]) return MC[l];
    for (const [m, c] of Object.entries(MC)) { if (l.includes(m) || m.includes(l)) return c; }
    for (const [k, v] of Object.entries(CATEGORY_LABELS)) { if (l === k || l === v.toLowerCase()) return k; }
    return "general";
  }, []);

  const [cat, setCat] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const sync = resolveCatSync(input);
    setCat(sync);
    setAiLoading(false);
  }, [input, resolveCatSync]);

  const handleSearch = useCallback(async () => {
    const sync = resolveCatSync(input);
    if (sync !== "general") { setCat(sync); return; }
    setAiLoading(true);
    try {
      const res = await fetch('https://fksmaxeyturvoywglvuq.supabase.co/functions/v1/categorize-merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant: input }),
      });
      const data = await res.json();
      setCat(data.category || "general");
    } catch {
      setCat("general");
    }
    setAiLoading(false);
  }, [input, resolveCatSync]);

  const ranked = useMemo(() => {
    if (!cat || sel.length === 0) return [];
    return sel.map(id => {
      const card = CARDS_DATABASE.find(c => c.id === id);
      const rate = card.categories[cat] || card.categories.general || 1;
      return { card, rate };
    }).sort((a, b) => b.rate - a.rate);
  }, [cat, sel]);

  // Track which merchant searches we've already counted
  const countedSearches = useRef(new Set());

  // Confetti + stats — only count a lookup when the resolved category changes from a real merchant match
  useEffect(() => {
    if (ranked.length === 0 || !input.trim()) return;
    const key = input.toLowerCase().trim();

    // Only count if this is an exact merchant match (not just partial typing)
    const isExactMatch = MC[key] || Object.keys(MC).some(m => m === key);
    // Or if user selected from suggestions / category buttons (input matches a label)
    const isCategoryMatch = Object.values(CATEGORY_LABELS).some(v => v.toLowerCase() === key);

    if (!isExactMatch && !isCategoryMatch) return;

    // Don't double-count the same search
    if (countedSearches.current.has(key)) {
      // Still fire confetti if top card changed
      if (ranked[0].card.id !== lastTop) {
        setLastTop(ranked[0].card.id);
        if (ranked[0].rate >= 3) {
          setConfetti(true);
          setTimeout(() => setConfetti(false), 2000);
        }
      }
      return;
    }

    countedSearches.current.add(key);
    setLastTop(ranked[0].card.id);
    setLookups(p => p + 1);
    if (ranked.length >= 2 && ranked[0].rate > ranked[ranked.length - 1].rate) {
      const diff = ranked[0].rate - ranked[ranked.length - 1].rate;
      setTotalSaved(p => p + diff * 0.5);
    }
    if (ranked[0].rate >= 3) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);
    }
  }, [ranked, lastTop, input]);

  const suggestions = useMemo(() => {
    if (!input.trim() || input.length < 2) return [];
    const l = input.toLowerCase();
    return Object.keys(MC).filter(m => m.includes(l)).slice(0, 6)
      .map(m => m.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
  }, [input]);

  const savings = useMemo(() => {
    if (ranked.length < 2) return null;
    const diff = ranked[0].rate - ranked[ranked.length-1].rate;
    if (diff <= 0) return null;
    return ((diff / ranked[ranked.length-1].rate) * 100).toFixed(0);
  }, [ranked]);

  const optScore = useMemo(() => {
    const cats = ["dining","groceries","flights","hotels","gas","transit","streaming","online_shopping","drugstores","home_improvement"];
    if (sel.length === 0) return { score: 0, label: "Needs Work", pct: "Top 80%" };
    let total = 0;
    cats.forEach(cat => {
      let best = 0;
      sel.forEach(id => {
        const card = CARDS_DATABASE.find(c => c.id === id);
        if (card) best = Math.max(best, card.categories[cat] || card.categories.general || 1);
      });
      if (best >= 5) total += 10;
      else if (best >= 3) total += 8;
      else if (best >= 2) total += 5;
    });
    let label, pct;
    if (total <= 30) { label = "Needs Work"; pct = "Top 80%"; }
    else if (total <= 50) { label = "Building"; pct = "Top 60%"; }
    else if (total <= 70) { label = "Good"; pct = "Top 35%"; }
    else if (total <= 85) { label = "Great"; pct = "Top 15%"; }
    else { label = "Excellent"; pct = "Top 5%"; }
    return { score: total, label, pct };
  }, [sel]);

  const issuers = [...new Set(CARDS_DATABASE.map(c => c.issuer))];
  const filteredCards = search.trim()
    ? CARDS_DATABASE.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.issuer.toLowerCase().includes(search.toLowerCase()))
    : CARDS_DATABASE;
  const filteredIssuers = search.trim()
    ? [...new Set(filteredCards.map(c => c.issuer))]
    : issuers;

  return (
    <div style={{ minHeight:"100vh",backgroundColor:"#0A0F1A",color:"#FFF",fontFamily:"'Outfit',sans-serif",position:"relative",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes rSlide { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder{color:rgba(255,255,255,0.25)}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        @media(min-width:600px){.cat-grid{grid-template-columns:repeat(6,1fr)!important}}
        .wallet-scroll::-webkit-scrollbar{display:none}
      `}</style>

      {/* BG glow */}
      <div style={{ position:"fixed",top:"-30%",left:"50%",transform:"translateX(-50%)",width:"600px",height:"600px",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(0,220,130,0.06) 0%,transparent 70%)",pointerEvents:"none",animation:"glow 4s ease-in-out infinite" }} />

      <Confetti active={confetti} />

      {/* Nav Bar */}
      <div style={{ position:"sticky",top:0,zIndex:20,backdropFilter:"blur(12px)",backgroundColor:"rgba(10,15,26,0.92)",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",maxWidth:"560px",margin:"0 auto" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:"8px",padding:"5px 12px",borderRadius:"20px",
            backgroundColor:"rgba(0,220,130,0.08)",border:"1px solid rgba(0,220,130,0.15)" }}>
            <div style={{ width:"6px",height:"6px",borderRadius:"50%",backgroundColor:"#00DC82",animation:"pulse 2s ease-in-out infinite" }} />
            <span style={{ fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#00DC82" }}>CardAdvisor</span>
          </div>
          <div style={{ display:"flex",gap:"24px" }}>
            {[{key:"dashboard",label:"Dashboard"},{key:"wallet",label:"Wallet"},{key:"analytics",label:"Analytics"}].map(t => (
              <button key={t.key} onClick={() => { setView(t.key); if(t.key==="dashboard") setTimeout(()=>ref.current?.focus(),150); }}
                style={{ background:"none",border:"none",padding:"4px 0",fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:700,
                  letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",
                  color: view===t.key?"#00DC82":"rgba(255,255,255,0.3)",
                  borderBottom: view===t.key?"2px solid #00DC82":"2px solid transparent",
                  transition:"all 0.25s ease" }}>
                {t.label}
              </button>
            ))}
          </div>
          {!authLoading && (
            user ? (
              <button onClick={signOut} style={{ padding:"6px 14px",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.1)",
                backgroundColor:"rgba(255,255,255,0.04)",fontFamily:"'Syne',sans-serif",fontSize:"10px",fontWeight:700,
                color:"rgba(255,255,255,0.5)",cursor:"pointer",letterSpacing:"0.05em" }}>
                Sign out
              </button>
            ) : (
              <button onClick={signIn} style={{ padding:"6px 14px",borderRadius:"20px",border:"1px solid rgba(0,220,130,0.2)",
                backgroundColor:"rgba(0,220,130,0.06)",fontFamily:"'Syne',sans-serif",fontSize:"10px",fontWeight:700,
                color:"#00DC82",cursor:"pointer",letterSpacing:"0.05em" }}>
                Sign in
              </button>
            )
          )}
        </div>
      </div>

      {/* Header */}
      <div style={{ padding:"24px 20px 16px",textAlign:"center",position:"relative",zIndex:1 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:"26px",fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.15,
          background:"linear-gradient(135deg,#FFF 0%,rgba(255,255,255,0.6) 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
          Maximize every purchase.
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding:"20px",maxWidth:"520px",margin:"0 auto",position:"relative",zIndex:1 }}>

        {/* WALLET */}
        {view === "wallet" && (
          <div style={{ animation:"fUp 0.3s ease" }}>
            {/* Card search */}
            <div style={{ position:"relative",marginBottom:"16px" }}>
              <div style={{ position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"14px",opacity:0.4,pointerEvents:"none" }}>🔍</div>
              <input type="text" placeholder={`Search ${CARDS_DATABASE.length} cards...`} value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:"100%",padding:"12px 14px 12px 40px",border:"1.5px solid rgba(255,255,255,0.06)",borderRadius:"12px",
                  backgroundColor:"rgba(255,255,255,0.03)",fontFamily:"'Outfit',sans-serif",fontSize:"13px",color:"#FFF",outline:"none" }} />
            </div>

            {filteredIssuers.map(issuer => {
              const cards = filteredCards.filter(c => c.issuer === issuer);
              if (cards.length === 0) return null;
              return (
                <div key={issuer} style={{ marginBottom:"18px" }}>
                  <div style={{ fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",
                    color:"rgba(255,255,255,0.2)",marginBottom:"8px",fontFamily:"'Syne',sans-serif" }}>{issuer}</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:"8px" }}>
                    {cards.map(card => <Chip key={card.id} card={card} selected={sel.includes(card.id)} onToggle={toggle} />)}
                  </div>
                </div>
              );
            })}

            {sel.length > 0 && (
              <button onClick={() => { setView("dashboard"); setTimeout(()=>ref.current?.focus(),150); }}
                style={{ width:"100%",padding:"16px",background:"linear-gradient(135deg,#00DC82 0%,#00C974 100%)",
                  color:"#0A0F1A",border:"none",borderRadius:"14px",fontFamily:"'Syne',sans-serif",fontSize:"14px",
                  fontWeight:800,letterSpacing:"0.04em",cursor:"pointer",marginTop:"8px",
                  boxShadow:"0 4px 20px rgba(0,220,130,0.3)",transition:"all 0.2s ease" }}>
                Find the best card →
              </button>
            )}
          </div>
        )}

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div style={{ animation:"fUp 0.3s ease" }}>
            {sel.length === 0 ? (
              <div style={{ textAlign:"center",padding:"48px 20px" }}>
                <div style={{ fontSize:"40px",marginBottom:"16px" }}>💳</div>
                <div style={{ fontSize:"15px",fontWeight:600,color:"rgba(255,255,255,0.5)",fontFamily:"'Syne',sans-serif" }}>Add cards first</div>
                <button onClick={() => setView("wallet")}
                  style={{ marginTop:"20px",padding:"12px 28px",background:"linear-gradient(135deg,#00DC82,#00C974)",
                    color:"#0A0F1A",border:"none",borderRadius:"12px",fontFamily:"'Syne',sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer" }}>
                  Set Up Wallet
                </button>
              </div>
            ) : (
              <>
                {/* Section A: Optimization Score + Active Streak */}
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"20px",paddingBottom:"20px",borderBottom:"1px solid rgba(255,255,255,0.06)",marginBottom:"20px" }}>
                  <div style={{ flex:1,minWidth:"200px" }}>
                    <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(255,255,255,0.25)",marginBottom:"8px" }}>Optimization Score</div>
                    <div style={{ display:"flex",alignItems:"baseline",gap:"2px" }}>
                      <span style={{ fontFamily:"'Syne',sans-serif",fontSize:"42px",fontWeight:800,color:"#00DC82",lineHeight:1 }}>{optScore.score}</span>
                      <span style={{ fontFamily:"'Syne',sans-serif",fontSize:"18px",fontWeight:600,color:"rgba(255,255,255,0.25)" }}>/100</span>
                    </div>
                    <div style={{ marginTop:"4px" }}>
                      <span style={{ fontFamily:"'Syne',sans-serif",fontSize:"13px",fontWeight:600,color:"rgba(255,255,255,0.6)" }}>{optScore.label}</span>
                      <span style={{ fontFamily:"'Syne',sans-serif",fontSize:"13px",color:"rgba(255,255,255,0.3)" }}>{" "}· {optScore.pct}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(255,255,255,0.25)",marginBottom:"8px" }}>Active Streak</div>
                    <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"20px",fontWeight:800,color:"#FFF" }}>0 Days</div>
                    <div style={{ fontSize:"12px",color:"rgba(255,255,255,0.3)",marginTop:"4px" }}>Keep optimizing!</div>
                  </div>
                </div>

                {/* Section B: Stats Bar */}
                {(lookups > 0) && (
                  <div style={{ display:"flex",justifyContent:"center",gap:"24px",marginBottom:"20px",animation:"fUp 0.3s ease" }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"18px",fontWeight:800,color:"#00DC82" }}>{lookups}</div>
                      <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600 }}>Lookups</div>
                    </div>
                    <div style={{ width:"1px",backgroundColor:"rgba(255,255,255,0.06)" }} />
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"18px",fontWeight:800,color:"#00DC82" }}>{sel.length}</div>
                      <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600 }}>Cards</div>
                    </div>
                    <div style={{ width:"1px",backgroundColor:"rgba(255,255,255,0.06)" }} />
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"18px",fontWeight:800,color:"#FFD700" }}>~${totalSaved.toFixed(0)}</div>
                      <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600 }}>Extra rewards</div>
                    </div>
                  </div>
                )}

                {/* Section C: Search Bar */}
                <div style={{ position:"relative",marginBottom:"20px",padding:"16px",borderRadius:"16px",backgroundColor:"rgba(0,220,130,0.03)",border:"1.5px solid rgba(0,220,130,0.12)" }}>
                  <div style={{ display:"flex",gap:"10px",alignItems:"center" }}>
                    <div style={{ position:"relative",flex:1 }}>
                      <div style={{ position:"absolute",left:"16px",top:"50%",transform:"translateY(-50%)",fontSize:"18px",opacity:0.4,pointerEvents:"none" }}>🔍</div>
                      <input ref={ref} type="text" placeholder="Where are you spending?" value={input}
                        onChange={e => { setInput(e.target.value); setLastTop(null); }}
                        onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
                        style={{ width:"100%",padding:"18px 20px 18px 48px",border:"2px solid rgba(255,255,255,0.06)",borderRadius:"14px",
                          backgroundColor:"rgba(255,255,255,0.03)",fontFamily:"'Outfit',sans-serif",fontSize:"16px",fontWeight:500,color:"#FFF",outline:"none",
                          transition:"all 0.2s ease" }}
                        onFocus={e => { e.target.style.borderColor="rgba(0,220,130,0.4)"; e.target.style.backgroundColor="rgba(0,220,130,0.03)"; }}
                        onBlur={e => { e.target.style.borderColor="rgba(255,255,255,0.06)"; e.target.style.backgroundColor="rgba(255,255,255,0.03)"; }} />
                    </div>
                    <button onClick={handleSearch} disabled={!input.trim() || aiLoading}
                      style={{ padding:"18px 20px",border:"none",borderRadius:"14px",
                        background: !input.trim() || aiLoading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#00DC82 0%,#00C974 100%)",
                        color: !input.trim() || aiLoading ? "rgba(255,255,255,0.25)" : "#0A0F1A",
                        fontFamily:"'Syne',sans-serif",fontSize:"13px",fontWeight:700,cursor: !input.trim() || aiLoading ? "default" : "pointer",
                        transition:"all 0.2s ease",flexShrink:0,
                        boxShadow: !input.trim() || aiLoading ? "none" : "0 4px 16px rgba(0,220,130,0.25)" }}>
                      Search
                    </button>
                  </div>

                  {suggestions.length > 0 && input.length >= 2 && !MC[input.toLowerCase()] && (
                    <div style={{ position:"absolute",top:"calc(100% + 4px)",left:0,right:0,backgroundColor:"#141A2A",
                      border:"1.5px solid rgba(255,255,255,0.08)",borderRadius:"12px",zIndex:10,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
                      {suggestions.map((s, i) => (
                        <button key={s} onClick={() => setInput(s)}
                          style={{ display:"flex",alignItems:"center",gap:"10px",width:"100%",textAlign:"left",padding:"12px 16px",
                            border:"none",backgroundColor:"transparent",fontFamily:"'Outfit',sans-serif",fontSize:"13px",fontWeight:500,
                            color:"rgba(255,255,255,0.7)",cursor:"pointer",borderBottom: i<suggestions.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(0,220,130,0.06)"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
                          <span style={{ fontSize:"14px" }}>{CATEGORY_ICONS[MC[s.toLowerCase()]] || "🏪"}</span>{s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section E: Search Results */}
                {aiLoading && input.trim() && (
                  <div style={{ display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"20px",
                    backgroundColor:"rgba(0,220,130,0.06)",border:"1px solid rgba(0,220,130,0.15)",fontSize:"12px",fontWeight:600,
                    color:"#00DC82",marginBottom:"16px",animation:"pulse 1.5s ease-in-out infinite" }}>
                    Categorizing...
                  </div>
                )}

                {!aiLoading && cat && input.trim() && (
                  <div style={{ display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"20px",
                    backgroundColor:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",fontSize:"12px",fontWeight:500,
                    color:"rgba(255,255,255,0.5)",marginBottom:"16px",animation:"fUp 0.2s ease" }}>
                    <span>{CATEGORY_ICONS[cat] || "💳"}</span>{CATEGORY_LABELS[cat] || cat}
                  </div>
                )}

                {ranked.length > 0 && input.trim() && (
                  <div style={{ display:"flex",flexDirection:"column",gap:"8px" }}>
                    {ranked.map(({ card, rate }, i) => (
                      <ResultRow key={card.id} card={card} rate={rate} rank={i} maxRate={ranked[0].rate} isOnly={ranked.length===1} />
                    ))}

                    {savings && parseInt(savings) > 0 && (
                      <div style={{ marginTop:"8px",padding:"16px 20px",borderRadius:"14px",backgroundColor:"rgba(0,220,130,0.04)",
                        border:"1px solid rgba(0,220,130,0.1)",display:"flex",alignItems:"center",gap:"12px",animation:"fUp 0.4s ease 0.3s both" }}>
                        <div style={{ width:"36px",height:"36px",borderRadius:"10px",backgroundColor:"rgba(0,220,130,0.1)",
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0 }}>💰</div>
                        <div>
                          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"13px",color:"#00DC82" }}>Smart move</div>
                          <div style={{ fontSize:"12px",color:"rgba(255,255,255,0.4)",marginTop:"2px",lineHeight:1.4 }}>
                            <strong style={{ color:"rgba(255,255,255,0.7)" }}>{ranked[0].card.shortName}</strong> earns{" "}
                            <strong style={{ color:"#00DC82" }}>{savings}% more</strong> rewards on {(CATEGORY_LABELS[cat]||cat).toLowerCase()}.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Section D: Quick Categories */}
                {!input.trim() && (
                  <div style={{ marginTop:"4px" }}>
                    <div style={{ fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",
                      color:"rgba(255,255,255,0.2)",marginBottom:"12px",fontFamily:"'Syne',sans-serif" }}>Quick Categories</div>
                    <div className="cat-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px" }}>
                      {(() => {
                        const defaultCats = ["dining","groceries","gas","travel","hotels","streaming"];
                        const allCats = Object.entries(CATEGORY_LABELS).filter(([k]) => k !== "general").map(([k]) => k);
                        const catsToShow = showAllCats ? allCats : defaultCats;
                        return (
                          <>
                            {catsToShow.map(k => (
                              <button key={k} onClick={() => setInput(CATEGORY_LABELS[k])}
                                style={{ padding:"16px 8px",borderRadius:"12px",border:"1.5px solid rgba(255,255,255,0.06)",
                                  backgroundColor:"rgba(255,255,255,0.02)",textAlign:"center",cursor:"pointer",
                                  transition:"all 0.2s ease" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(0,220,130,0.3)"; e.currentTarget.style.backgroundColor="rgba(0,220,130,0.06)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.backgroundColor="rgba(255,255,255,0.02)"; }}>
                                <span style={{ fontSize:"24px",display:"block",marginBottom:"6px" }}>{CATEGORY_ICONS[k]}</span>
                                <span style={{ fontSize:"11px",fontFamily:"'Outfit',sans-serif",color:"rgba(255,255,255,0.45)" }}>{CATEGORY_LABELS[k]}</span>
                              </button>
                            ))}
                            <button onClick={() => setShowAllCats(!showAllCats)}
                              style={{ padding:"16px 8px",borderRadius:"12px",border:"1.5px solid rgba(255,255,255,0.06)",
                                backgroundColor:"rgba(255,255,255,0.02)",textAlign:"center",cursor:"pointer",
                                transition:"all 0.2s ease" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(0,220,130,0.3)"; e.currentTarget.style.backgroundColor="rgba(0,220,130,0.06)"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.backgroundColor="rgba(255,255,255,0.02)"; }}>
                              <span style={{ fontSize:"24px",display:"block",marginBottom:"6px" }}>{showAllCats ? "⬆️" : "···"}</span>
                              <span style={{ fontSize:"11px",fontFamily:"'Outfit',sans-serif",color:"rgba(255,255,255,0.45)" }}>{showAllCats ? "Less" : "More"}</span>
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Section F: Active Wallet Preview */}
                {!input.trim() && (
                  <div style={{ marginTop:"32px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(255,255,255,0.25)" }}>Active Wallet</div>
                      <button onClick={() => setView("wallet")}
                        style={{ background:"none",border:"none",fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:700,color:"#00DC82",cursor:"pointer",padding:0 }}>
                        Manage Wallet →
                      </button>
                    </div>
                    <div className="wallet-scroll" style={{ display:"flex",gap:"14px",overflowX:"auto",paddingBottom:"8px" }}>
                      {sel.map(id => {
                        const card = CARDS_DATABASE.find(c => c.id === id);
                        if (!card) return null;
                        const isLight = card.id === "apple-card";
                        return (
                          <div key={card.id} style={{ width:"280px",minWidth:"280px",height:"160px",borderRadius:"14px",background:card.gradient,
                            padding:"20px",position:"relative",transition:"transform 0.2s ease",cursor:"default" }}
                            onMouseEnter={e => e.currentTarget.style.transform="translateY(-4px)"}
                            onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"16px",fontWeight:700,color:isLight?"#1A1A1A":"#FFF" }}>{card.shortName}</div>
                            <div style={{ fontSize:"10px",letterSpacing:"0.15em",color:isLight?"rgba(26,26,26,0.5)":"rgba(255,255,255,0.5)",marginTop:"4px" }}>{card.currency.toUpperCase()}</div>
                            <div style={{ position:"absolute",bottom:"20px",right:"20px",fontSize:"11px",color:isLight?"rgba(26,26,26,0.4)":"rgba(255,255,255,0.4)" }}>{card.issuer}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {view === "analytics" && (
          <div style={{ animation:"fUp 0.3s ease",textAlign:"center",padding:"48px 20px" }}>
            <div style={{ fontSize:"48px",marginBottom:"16px" }}>📊</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"22px",fontWeight:800,color:"#FFF",marginBottom:"8px" }}>Analytics</h2>
            <div style={{ fontFamily:"'Outfit',sans-serif",fontSize:"14px",color:"rgba(255,255,255,0.4)",marginBottom:"32px" }}>Coming Soon</div>
            <div style={{ padding:"24px",borderRadius:"16px",backgroundColor:"rgba(255,255,255,0.02)",border:"1.5px solid rgba(255,255,255,0.06)",maxWidth:"360px",margin:"0 auto" }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"13px",fontWeight:600,color:"rgba(255,255,255,0.5)" }}>Spending insights &amp; optimization tips</div>
              <div style={{ fontFamily:"'Outfit',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.25)",marginTop:"8px" }}>Track your reward earnings, category breakdowns, and card utilization over time.</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign:"center",padding:"32px 20px",fontSize:"11px",color:"rgba(255,255,255,0.12)",marginTop:"40px" }}>
        {`CardAdvisor · ${CARDS_DATABASE.length} cards · Not financial advice · Rates as of Feb 2026`}
      </div>
    </div>
  );
}
