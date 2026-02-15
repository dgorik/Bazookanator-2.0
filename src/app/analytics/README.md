# Analytics module – memory capsule

## Source of truth (state)

- **URL filters (`useUrlState`)** live in `src/app/analytics/page.tsx` as `filters`:
  - `valueMeasure`, `targetMeasure` (sticky)
  - `division` (sticky)
  - `timeView` (sticky: monthly/quarterly/total)
  - `month` (sticky; only meaningful on `timeView === 'monthly'`)
  - `brand/category/location` exist in `filters` but are **not** the primary waterfall selection inputs.

- **Waterfall selections (local React state)** in `src/app/analytics/page.tsx`:
  - `selectedLocation`, `selectedBrand`, `selectedCategory`
  - These drive the “waterfall” behavior and KPI card resets.

## Waterfall behavior (selection dependencies)

Order: **Location → Brand → Category**

- Selecting **Location**:
  - sets `selectedLocation`
  - clears `selectedBrand` + `selectedCategory`

- Selecting **Brand**:
  - sets `selectedBrand`
  - clears `selectedCategory`
  - must **NOT** clear `selectedLocation` (brand depends on location, not vice versa)

- Selecting **Category**:
  - sets `selectedCategory` only

## Reset rules (do NOT touch sticky filters)

Sticky filters that resets must NOT change:

- `valueMeasure`, `targetMeasure`, `division`, `timeView`, `month`

Reset actions:

- **Reset Category**: clears `selectedCategory`
- **Reset Brand**: clears `selectedBrand` + `selectedCategory`
- **Reset Location**: clears `selectedLocation` + `selectedBrand` + `selectedCategory`
- Optional “reset all waterfall”: clears all three selected\* only

## KPI cards: scope / independence

- KPI queries are based on a shared `baseFilters` from URL `filters` (division/month/etc).
- Each card adds its own override.
- If implementing full waterfall in KPI queries:
  - Brand KPI should include upstream `selectedLocation` (and its own `selectedBrand`)
  - Category KPI should include upstream `selectedLocation` + `selectedBrand` (and its own `selectedCategory`)

## Filter option RPCs (Supabase)

Used by UI via `src/lib/fetcher/fetchers.ts`:

- `get_filter_options` (generic options)
- `get_filtered_locations`
- `get_filtered_brands`
- `get_filtered_categories`
- `get_sales_value_target`

Waterfall option fetching intent:

- Brand options should be filtered by selected location
- Category options should be filtered by selected location + selected brand

## Known gotchas / guardrails

- Avoid side-effects during render (e.g., `fetch(...)` calls inside component bodies) — can cause UI “freezing”.
- Ensure RPC return shapes match what the client maps:
  - `get_filtered_locations` should return a `location` field (not mislabeled as `brand`).

A single-page executive dashboard that answers, in order:

1. Where are we vs target? (one headline KPI card)
2. What’s driving the variance? (interactive variance drivers chart)
3. Who are the biggest winners/losers? (Top 5 div_sub table)
4. Is it improving or worsening? (trend chart)
   Page UI frame (final agreed layout)
   Header
   Title + subtitle
   Time view tabs: Monthly / Quarterly / Total (TimeViewTabs)
   Filters
   Row 1 (measures): Actual measure + Target measure (existing pattern)
   Row 2 (scope): Division + Period (Month/Quarter depending on timeView)
   Headline KPI (single card)
   Shows Actual, Target, and % to target in one card (your current KPICard pattern is close).
   Drill chips (context, below KPI)
   Chips: Brand, Category, Sub-brand (appear when selected)
   Action: Clear drill (clears drill selections only; does not touch sticky filters)
   Main content grid
   Left (primary): Variance Drivers chart (ranked bars, clickable)
   Right (secondary): Top 5 Winners/Losers by div_sub (compact table with toggle)
   Bottom
   Trend chart: Actual vs Target over time (aligned to timeView)
   Intended behavior (drill logic you asked us to assume)
   Sticky filters (URL state)
   These define the “global slice”:
   division, timeView, period (month/quarter), valueMeasure, targetMeasure
   Drill selections (local state)
   These define “where the user clicked to drill”:
   selectedBrand?
   selectedCategory?
   selectedSubBrand? (new)
   (optional later) selectedDivSub? if you want the div_sub table rows to act as chips
   Variance Drivers chart behavior
   The chart’s grouping level depends on drill depth:
   No brand selected → show Brand drivers
   Brand selected, no category → show Category drivers (within that brand)
   Brand + Category selected → show Sub-brand drivers (within brand+category)
   Click interactions
   Clicking a bar sets the next drill selection:
   Brand bar click → set selectedBrand, clear category/sub-brand
   Category bar click → set selectedCategory, clear sub-brand
   Sub-brand bar click → set selectedSubBrand
   Clicking a selected chip “x” removes that level and below.
   Top 5 Winners/Losers (div_sub) table
   Always scoped to the sticky filters (division/period/measures) and optionally to current drill selections (your call):
   Exec-friendly default: keep it scoped only to sticky filters (so it stays stable).
   Optional: scope it to drill selections too (if you want “winners/losers within Nike → Footwear”).
   Technical mapping to your current code (what exists vs what we add)
   What you already have
   Filters + URL state: src/app/analytics/page.tsx (useUrlState, TimeViewTabs, AnalyticsFilterBar)
   SWR pattern: already used for measures/divisions and KPI queries
   KPI card UI: KPICard
   A clickable bar chart foundation: src/components/ui/tremor/barchart.tsx supports click via onValueChange
   Supabase RPC access layer: src/lib/fetcher/fetchers.ts (getSalesValueTarget, filtered options)
   What needs to be added (key point: avoid N+1 queries)
   Right now, BrandValueTargetChart effectively does “loop brands → call getSalesValueTarget per brand” which will not scale to category/sub-brand.
   To support drill + Top 5 tables + trend cleanly, you’ll want grouped RPCs that return lists.
   Data contracts (recommended RPCs / fetchers)
5. Headline KPI (already supported)
   RPC: get_sales_value_target
   Fetcher: getSalesValueTarget(valueMeasure, targetMeasure, filters, timeView)
   Output: { value_sales, target_sales }
6. Variance Drivers (new, grouped)
   Purpose: return top-N rows grouped by the current dimension (brand/category/sub_brand), including variance metrics.
   RPC idea: get_variance_drivers
   Inputs:
   p_value_measure, p_target_measure
   p_division, p_month/p_quarter (see “Period model” below), p_time_view
   drill constraints: p_brand?, p_category?
   p_group_by: 'brand' | 'category' | 'sub_brand'
   p_limit: number (e.g., 10/15)
   p_sort: 'variance_abs' | 'variance_pos' | 'variance_neg' (or a direction flag)
   Output rows:
   group_value (string) (brand/category/sub-brand)
   value_sales (number)
   target_sales (number)
   variance_sales (number)
   variance_pct (number, optional; can compute client-side)
7. Top 5 Winners/Losers by div_sub (new, grouped)
   RPC idea: get_top_div_sub_variance
   Inputs: same sticky filters (+ optional drill constraints), plus p_direction ('winners'|'losers') and p_limit=5
   Output: div_sub, variance_sales, variance_pct, (optionally actual/target)
8. Trend series (new)
   RPC idea: get_sales_value_target_trend
   Inputs: sticky filters + measures + time view
   Output rows:
   period_key (month name, quarter label, or date)
   value_sales
   target_sales
   (optional) variance_sales
9. Sub-brand filtered options (optional)
   If you want a dropdown later (not necessary if drill-only), add:
   get_filtered_sub_brands(filters) → list of sub_brand
   Period model (monthly/quarterly/total)
   You currently pass p_month plus p_time_view. For the dashboard UX you described:
   Monthly: user selects a month → p_month = 'Jan'...'Dec' (or whatever your RPC expects)
   Quarterly: you’ll likely need either:
   a new p_quarter param, or
   a convention that encodes quarter into p_month (less clean)
   Total: no period filter
   This matters most for the trend RPC and for consistent filtering across KPI/drivers/table.
   Component breakdown (front-end)
   You can treat the page as 5 “cards”:
10. AnalyticsFilterPanel (existing AnalyticsFilterBar + minor additions)
11. HeadlineKPI (single KPICard-style component)
12. DrillChips (new tiny component)
13. VarianceDriversCard (new; uses your BarChart wrapper + onValueChange)
14. TopDivSubCard (new; compact table, winners/losers toggle)
15. TrendCard (new; line/area chart)
    Performance + UX guardrails (exec-safe)
    Always query server-side grouped rows (no “Promise.all per brand/category/sub-brand”).
    Default to Top N (10–15) for drivers chart.
    Stable loading states: don’t blank the whole page when drilling; skeleton the chart/table only.
    Clear drill never resets sticky filters (matches your existing README intent).
    What “done” looks like (acceptance criteria)
    With division + period + measures selected, exec sees:
    Headline KPI populated
    Drivers chart shows Brand variance ranking
    Top 5 div_sub winners/losers populated
    Trend chart populated
    Clicking a brand bar updates:
    chips show Brand=...
    drivers chart switches to Category drivers
    Clicking a category bar updates:
    chips show Category=...
    drivers chart switches to Sub-brand drivers
    Clear drill returns drivers chart to Brand level without changing division/period/measures.
