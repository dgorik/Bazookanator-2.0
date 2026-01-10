-- Function to get top category sales
CREATE OR REPLACE FUNCTION get_top_category_sales(
  p_measure text DEFAULT NULL,
  p_year text DEFAULT NULL,
  p_division text DEFAULT NULL,
  p_brand text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_month text DEFAULT NULL,
  p_time_view text DEFAULT 'total'
)
RETURNS TABLE (
  category text,
  sales numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  current_month text;
  current_quarter int;
BEGIN
  -- Get current month abbreviation for monthly view
  current_month := TO_CHAR(NOW(), 'MON');
  -- Get current quarter for quarterly view
  current_quarter := EXTRACT(QUARTER FROM NOW());

  RETURN QUERY
  SELECT
    pd.category,
    COALESCE(SUM(pd.sales), 0) as sales
  FROM product_data pd
  WHERE
    -- Apply filters only if they are provided (not null)
    (p_measure IS NULL OR pd.measure = p_measure)
    AND (p_year IS NULL OR pd.year = p_year)
    AND (p_division IS NULL OR pd.division = p_division)
    AND (p_brand IS NULL OR pd.brand = p_brand)
    AND (p_location IS NULL OR pd.location = p_location)
    AND (p_month IS NULL OR pd.month = p_month)
    -- Apply time view filtering
    AND (
      CASE p_time_view
        WHEN 'monthly' THEN pd.month = current_month
        WHEN 'quarterly' THEN 
          pd.month IN (
            CASE current_quarter
              WHEN 1 THEN 'JAN'
              WHEN 2 THEN 'APR'
              WHEN 3 THEN 'JUL'
              WHEN 4 THEN 'OCT'
            END,
            CASE current_quarter
              WHEN 1 THEN 'FEB'
              WHEN 2 THEN 'MAY'
              WHEN 3 THEN 'AUG'
              WHEN 4 THEN 'NOV'
            END,
            CASE current_quarter
              WHEN 1 THEN 'MAR'
              WHEN 2 THEN 'JUN'
              WHEN 3 THEN 'SEP'
              WHEN 4 THEN 'DEC'
            END
          )
        ELSE TRUE -- 'total' - no time filtering
      END
    )
    AND pd.category IS NOT NULL
  GROUP BY pd.category
  ORDER BY sales DESC
  LIMIT 1;
END;
$$;

-- Function to get top subbrand sales
CREATE OR REPLACE FUNCTION get_top_subbrand_sales(
  p_measure text DEFAULT NULL,
  p_year text DEFAULT NULL,
  p_division text DEFAULT NULL,
  p_brand text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_month text DEFAULT NULL,
  p_time_view text DEFAULT 'total'
)
RETURNS TABLE (
  sub_brand text,
  sales numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  current_month text;
  current_quarter int;
BEGIN
  -- Get current month abbreviation for monthly view
  current_month := TO_CHAR(NOW(), 'MON');
  -- Get current quarter for quarterly view
  current_quarter := EXTRACT(QUARTER FROM NOW());

  RETURN QUERY
  SELECT
    pd.sub_brand,
    COALESCE(SUM(pd.sales), 0) as sales
  FROM product_data pd
  WHERE
    -- Apply filters only if they are provided (not null)
    (p_measure IS NULL OR pd.measure = p_measure)
    AND (p_year IS NULL OR pd.year = p_year)
    AND (p_division IS NULL OR pd.division = p_division)
    AND (p_brand IS NULL OR pd.brand = p_brand)
    AND (p_category IS NULL OR pd.category = p_category)
    AND (p_location IS NULL OR pd.location = p_location)
    AND (p_month IS NULL OR pd.month = p_month)
    -- Apply time view filtering
    AND (
      CASE p_time_view
        WHEN 'monthly' THEN pd.month = current_month
        WHEN 'quarterly' THEN 
          pd.month IN (
            CASE current_quarter
              WHEN 1 THEN 'JAN'
              WHEN 2 THEN 'APR'
              WHEN 3 THEN 'JUL'
              WHEN 4 THEN 'OCT'
            END,
            CASE current_quarter
              WHEN 1 THEN 'FEB'
              WHEN 2 THEN 'MAY'
              WHEN 3 THEN 'AUG'
              WHEN 4 THEN 'NOV'
            END,
            CASE current_quarter
              WHEN 1 THEN 'MAR'
              WHEN 2 THEN 'JUN'
              WHEN 3 THEN 'SEP'
              WHEN 4 THEN 'DEC'
            END
          )
        ELSE TRUE -- 'total' - no time filtering
      END
    )
    AND pd.sub_brand IS NOT NULL
  GROUP BY pd.sub_brand
  ORDER BY sales DESC
  LIMIT 1;
END;
$$;
