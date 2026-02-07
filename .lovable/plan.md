

# 🛒 Malaysian Food Inflation Tracker — MVP Plan

## Overview
A single-page data visualization app that tracks Malaysian food price inflation, styled with a dark theme inspired by inflationchart.com. Uses Supabase (via Lovable Cloud) for database and edge functions, with Firecrawl for web scraping.

---

## Phase 1: Database & Backend Setup

### Supabase Tables
- **`food_prices`** — stores daily prices per item (date, item, price_rm) with a unique constraint on date+item
- **`indicators`** — stores CPI and salary data (date, type, value)
- Pre-populate CPI data (Feb 2024 – Feb 2026) and baseline food prices

### Edge Function: Daily Price Scraper
- A Supabase Edge Function that attempts to scrape KPDN PriceCatcher using **Firecrawl** (scrape the page, extract prices from the response)
- **Fallback**: If scraping fails, generates prices based on last known values with small random variance (±2%)
- Calculates a "basket" total from all individual items
- Upserts results into `food_prices` table
- Scheduled via **pg_cron** to run daily at 11:30 PM MYT

### Edge Function: Backfill Historical Data
- One-time edge function to generate ~2 years of realistic synthetic price data (Feb 2024 → today)
- Uses compound monthly inflation (~1.2%/month) with daily noise for realism
- Populates the database so the chart looks meaningful from day one

---

## Phase 2: Frontend — Main Page

### Header
- Bold gradient title: "🛒 Malaysian Food Prices 🇲🇾 in Real Terms 💰"
- **Item dropdown**: Chicken, Eggs, Tomato, Long Beans, Rice, Milk, Full Basket
- **Time period dropdown**: 1 year, 2 years, All time
- Clean, horizontal layout on desktop; stacks on mobile

### Main Chart (Recharts)
- **70% width** on desktop, full width on mobile
- Three color-coded lines:
  - 🟢 Green (#4ade80) — Nominal price in RM
  - 🔵 Blue (#60a5fa) — Official CPI index
  - 🔴 Red (#f87171) — Real price (inflation-adjusted = nominal ÷ CPI × 100)
- Smooth curves, no dots, dark-themed tooltip
- Click legend items to toggle line visibility
- 500px height desktop, 400px mobile

### Sidebar (30% width, stacks below on mobile)
1. **Big stat card** — Headline percentage change (e.g., "+33.6%") with explanatory text
2. **ELI5 section** — Simple explanation of what the three lines mean
3. **Data sources** — Links to KPDN PriceCatcher, methodology note, update frequency

---

## Design System
- **Background**: Black (#000) with dark cards (#0a0a0a)
- **Accent colors**: Red/yellow gradient for title, red for highlights
- **Typography**: Clean, minimal — data-focused
- **Responsive**: Desktop side-by-side layout → mobile stacked layout

---

## What's NOT in this MVP (can add later)
- "Adjust by" dropdown (Nominal RM / CPI / Median Salary) — start with all three lines visible
- Logarithmic scale toggle
- "Begin at zero" toggle
- Festival alert warnings
- Key findings bullet points
- Current prices 2×2 grid
- Caveats/disclaimers section

