-- Function to get aggregated sales with multiple filters and time view
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
  -- Get current month abbreviation for monthly view
  current_month := TO_CHAR(NOW(), 'MON');
  -- Get current quarter for quarterly view
  current_quarter := EXTRACT(QUARTER FROM NOW());

  SELECT COALESCE(SUM(sales), 0)
  INTO total_sales
  FROM product_data
  WHERE 
    -- Apply filters only if they are provided (not null)
    (p_measure IS NULL OR measure = p_measure)
    AND (p_division IS NULL OR division = p_division)
    AND (p_brand IS NULL OR brand = p_brand)
    AND (p_category IS NULL OR category = p_category)
    AND (p_location IS NULL OR location = p_location)
    AND (p_month IS NULL OR month = p_month)
    -- Apply time view filtering
    AND (
      CASE p_time_view
        WHEN 'monthly' THEN month = current_month
        WHEN 'quarterly' THEN 
          month IN (
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
    );

  RETURN total_sales;
END;
$$;
