-- Create the new table
CREATE TABLE product_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  
  -- Metrics and Identifiers
  measure text,
  division text,
  district text,
  sku text,
  brand text,
  sub_brand text,
  category text,
  div_sub text,
  main_sku text,
  item_description text,
  product_category_old text,
  location text,
  coa_code text,
  oracle_category text,
  
  -- Time tracking
  year integer,
  launch_year integer,
  
  -- Attributes and Values
  innovation_vs_legacy text,
  month text,
  sales numeric -- Using numeric to support decimals for measurements/currency
);

-- Enable Row Level Security (RLS)
ALTER TABLE product_data ENABLE ROW LEVEL SECURITY;

-- Optional: Create an index on SKU or Brand for faster searching
CREATE INDEX idx_product_data_sku ON product_data(sku);
CREATE INDEX idx_product_data_brand ON product_data(brand);

