-- Remove year parameter from get_sales_by_filters
CREATE OR REPLACE FUNCTION get_sales_by_filters(
  p_measure text DEFAULT NULL,
  p_division text DEFAULT NULL,
  p_brand text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_month text DEFAULT NULL,
  p_time_view text DEFAULT 'total'
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  total_sales numeric;
  current_month text;
  current_quarter int;
BEGIN
  current_month := TO_CHAR(NOW(), 'MON');
  current_quarter := EXTRACT(QUARTER FROM NOW());

  SELECT COALESCE(SUM(sales), 0)
  INTO total_sales
  FROM product_data
  WHERE 
    (p_measure IS NULL OR measure = p_measure)
    AND (p_division IS NULL OR division = p_division)
    AND (p_brand IS NULL OR brand = p_brand)
    AND (p_category IS NULL OR category = p_category)
    AND (p_location IS NULL OR location = p_location)
    AND (p_month IS NULL OR month = p_month)
    AND (
      CASE p_time_view
        WHEN 'monthly' THEN month = current_month
        WHEN 'quarterly' THEN 
          month IN (
            CASE current_quarter WHEN 1 THEN 'JAN' WHEN 2 THEN 'APR' WHEN 3 THEN 'JUL' WHEN 4 THEN 'OCT' END,
            CASE current_quarter WHEN 1 THEN 'FEB' WHEN 2 THEN 'MAY' WHEN 3 THEN 'AUG' WHEN 4 THEN 'NOV' END,
            CASE current_quarter WHEN 1 THEN 'MAR' WHEN 2 THEN 'JUN' WHEN 3 THEN 'SEP' WHEN 4 THEN 'DEC' END
          )
        ELSE TRUE
      END
    );

  RETURN total_sales;
END;
$$;

-- Remove year params from get_sales_by_brand
CREATE OR REPLACE FUNCTION get_sales_by_brand(
  p_value_measure text,
  p_target_measure text,
  p_division text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_month text DEFAULT NULL,
  p_time_view text DEFAULT 'total'
)
RETURNS TABLE (
  brand text,
  value_measure numeric,
  target_measure numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  current_month text;
  current_quarter int;
BEGIN
  current_month := TO_CHAR(NOW(), 'MON');
  current_quarter := EXTRACT(QUARTER FROM NOW());

  RETURN QUERY
  SELECT
    pd.brand,
    COALESCE(SUM(CASE WHEN pd.measure = p_value_measure THEN pd.sales ELSE 0 END), 0) as value_measure,
    COALESCE(SUM(CASE WHEN pd.measure = p_target_measure THEN pd.sales ELSE 0 END), 0) as target_measure
  FROM product_data pd
  WHERE
    (p_division IS NULL OR pd.division = p_division)
    AND (p_category IS NULL OR pd.category = p_category)
    AND (p_location IS NULL OR pd.location = p_location)
    AND (p_month IS NULL OR pd.month = p_month)
    AND (
      CASE p_time_view
        WHEN 'monthly' THEN pd.month = current_month
        WHEN 'quarterly' THEN 
          pd.month IN (
            CASE current_quarter WHEN 1 THEN 'JAN' WHEN 2 THEN 'APR' WHEN 3 THEN 'JUL' WHEN 4 THEN 'OCT' END,
            CASE current_quarter WHEN 1 THEN 'FEB' WHEN 2 THEN 'MAY' WHEN 3 THEN 'AUG' WHEN 4 THEN 'NOV' END,
            CASE current_quarter WHEN 1 THEN 'MAR' WHEN 2 THEN 'JUN' WHEN 3 THEN 'SEP' WHEN 4 THEN 'DEC' END
          )
        ELSE TRUE
      END
    )
  GROUP BY pd.brand
  HAVING pd.brand IS NOT NULL
  ORDER BY pd.brand;
END;
$$;