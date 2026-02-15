-- Only return actual winners (variance > 0) or actual losers (variance < 0)
-- instead of returning the top N regardless of sign.

CREATE OR REPLACE FUNCTION get_top_div_sub_variance(
  p_value_measure text,
  p_target_measure text,
  p_division text DEFAULT NULL,
  p_brand text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_sub_brand text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_month text DEFAULT NULL,
  p_time_view text DEFAULT 'total',
  p_direction text DEFAULT 'losers',
  p_limit int DEFAULT 5
)
RETURNS TABLE (
  div_sub text,
  value_sales numeric,
  target_sales numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  current_month text;
  current_quarter int;
BEGIN
  IF p_value_measure IS NULL OR p_target_measure IS NULL THEN
    RETURN;
  END IF;

  current_month := TO_CHAR(NOW(), 'MON');
  current_quarter := EXTRACT(QUARTER FROM NOW());

  RETURN QUERY
  SELECT
    pd.div_sub,
    COALESCE(SUM(CASE WHEN pd.measure = p_value_measure THEN pd.sales ELSE 0 END), 0) AS value_sales,
    COALESCE(SUM(CASE WHEN pd.measure = p_target_measure THEN pd.sales ELSE 0 END), 0) AS target_sales
  FROM product_data pd
  WHERE
    pd.div_sub IS NOT NULL
    AND (p_division IS NULL OR pd.division = p_division)
    AND (p_brand IS NULL OR pd.brand = p_brand)
    AND (p_category IS NULL OR pd.category = p_category)
    AND (p_sub_brand IS NULL OR pd.sub_brand = p_sub_brand)
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
  GROUP BY pd.div_sub
  HAVING
    CASE WHEN p_direction = 'winners'
      THEN (
        COALESCE(SUM(CASE WHEN pd.measure = p_value_measure THEN pd.sales ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN pd.measure = p_target_measure THEN pd.sales ELSE 0 END), 0)
      ) > 0
      ELSE (
        COALESCE(SUM(CASE WHEN pd.measure = p_value_measure THEN pd.sales ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN pd.measure = p_target_measure THEN pd.sales ELSE 0 END), 0)
      ) < 0
    END
  ORDER BY
    CASE WHEN p_direction = 'winners'
      THEN -(
        COALESCE(SUM(CASE WHEN pd.measure = p_value_measure THEN pd.sales ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN pd.measure = p_target_measure THEN pd.sales ELSE 0 END), 0)
      )
      ELSE (
        COALESCE(SUM(CASE WHEN pd.measure = p_value_measure THEN pd.sales ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN pd.measure = p_target_measure THEN pd.sales ELSE 0 END), 0)
      )
    END
  LIMIT p_limit;
END;
$$;
