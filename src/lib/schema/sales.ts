export const salesSchema = `
Table: public.product_data
Description: Each row captures a SKU-level record in the product_data table, including launch metadata, organizational context, and a single month/month-like metric.

Columns:
- id (uuid): Primary key generated through gen_random_uuid().
- created_at (timestamptz): Record creation timestamp, defaults to now().
- measure (text): Metric type describing the scenario that produced the row. Values containing “Board” are the official forecasts (actuals plus forecast presented to the board), “Plan” rows are financial plans, “Sales Plan” rows are sales-specific plans made by sales people, “Actuals” rows are real sales, and “LE” rows combine actuals with the Demantra forecast; nulls mean the scenario is uncategorized.
- division (text): Organizational division (Brick & Mortar and Ecommerce).
- district (text): Sales district tied to the division.
- sku (text): Stock keeping unit code (see idx_product_data_sku for quick lookups).
- brand, sub_brand, category, div_sub (text): Taxonomic dimensions used for hierarchies and roll-ups.
- main_sku (text) and item_description (text): Internal identifier and human-friendly label for the SKU.
- product_category_old (text): Legacy category field retained for historical comparability.
- location, coa_code, oracle_category (text): Operational attributes for where the product was sold and how it maps to enterprise systems.
- year, launch_year (integer): Calendar year for the record and the SKU's launch year.
- innovation_vs_legacy (text): Segment flag that marks innovation versus legacy portfolios.
- month (text): Month indicator stored with normalized abbreviations (JAN—DEC); null means the row does not tie to a single month.
- sales (numeric): Numeric amount tied to the selected measure.

Indexes:
- idx_product_data_sku (btree on sku): supports frequent SKU filters.
- idx_product_data_brand (btree on brand): speeds up brand-based roll-ups.

Notes:
- 'measure' plus 'sales' tells you whether the row is dollars or units, while 'innovation_vs_legacy' and 'division' help segments.
- Use indexed columns ('sku', 'brand') in WHERE clauses to keep queries performant.
`
