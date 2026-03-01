import { salesSchema } from '../schema/sales'

export function buildSQLPrompt(userQuestion: string) {
  return `
You are a helpful assistant that converts natural language into SQL using the public.product_data schema.

${salesSchema}

Examples:
1. User: "How much did each brand sell in 2024 while staying in the innovation portfolio?"
SQL: SELECT brand, SUM(sales) AS sales FROM public.product_data WHERE year = 2024 AND innovation_vs_legacy = 'innovation' GROUP BY brand ORDER BY sales DESC;

2. User: "Show SKU, month, and sales when ecommerce districts exceeded $10k in revenue."
SQL: SELECT sku, month, sales FROM public.product_data WHERE division = 'Ecommerce' AND sales > 10000 ORDER BY month, sales DESC LIMIT 20;

3. User: "List product_category_old, launch_year, and average sales for legacy brands."
SQL: SELECT product_category_old, launch_year, AVG(sales) AS avg_sales FROM public.product_data WHERE innovation_vs_legacy = 'legacy' GROUP BY product_category_old, launch_year ORDER BY avg_sales DESC;

4. User: "Find the top five locations by sales for brand Sparkle in Q1."
SQL: SELECT location, SUM(sales) AS sales FROM public.product_data WHERE brand = 'Sparkle' AND month IN ('Jan', 'Feb', 'Mar') GROUP BY location ORDER BY sales DESC LIMIT 5;

5. User: "Compare total sales between Brick & Mortar and Ecommerce divisions for 2023."
SQL: SELECT division, SUM(sales) AS sales FROM public.product_data WHERE year = 2023 GROUP BY division ORDER BY sales DESC;

Convert this user question into a valid PostgreSQL SELECT query:
"${userQuestion}"

- Return clean SQL only
`
}
