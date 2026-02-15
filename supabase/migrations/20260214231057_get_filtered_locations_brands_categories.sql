CREATE OR REPLACE FUNCTION get_filtered_locations(
  p_measure text DEFAULT NULL,
  p_division text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_brand text DEFAULT NULL,
  p_month text DEFAULT NULL
)
RETURNS TABLE (location text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT pd.location
  FROM product_data pd
  WHERE
    pd.location IS NOT NULL
    AND (p_measure IS NULL OR pd.measure = p_measure)
    AND (p_division IS NULL OR pd.division = p_division)
    AND (p_category IS NULL OR pd.category = p_category)
    AND (p_brand IS NULL OR pd.brand = p_brand)
    AND (p_month IS NULL OR pd.month = p_month)
  ORDER BY pd.location;
END;
$$;


CREATE OR REPLACE FUNCTION get_filtered_brands(
  p_measure text DEFAULT NULL,
  p_division text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_month text DEFAULT NULL
)
RETURNS TABLE (brand text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT pd.brand
  FROM product_data pd
  WHERE
    pd.brand IS NOT NULL
    AND (p_measure IS NULL OR pd.measure = p_measure)
    AND (p_division IS NULL OR pd.division = p_division)
    AND (p_category IS NULL OR pd.category = p_category)
    AND (p_location IS NULL OR pd.location = p_location)
    AND (p_month IS NULL OR pd.month = p_month)
  ORDER BY pd.brand;
END;
$$;

-- Get categories filtered by current selections
CREATE OR REPLACE FUNCTION get_filtered_categories(
  p_measure text DEFAULT NULL,
  p_division text DEFAULT NULL,
  p_brand text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_month text DEFAULT NULL
)
RETURNS TABLE (category text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT pd.category
  FROM product_data pd
  WHERE
    pd.category IS NOT NULL
    AND (p_measure IS NULL OR pd.measure = p_measure)
    AND (p_division IS NULL OR pd.division = p_division)
    AND (p_brand IS NULL OR pd.brand = p_brand)
    AND (p_location IS NULL OR pd.location = p_location)
    AND (p_month IS NULL OR pd.month = p_month)
  ORDER BY pd.category;
END;
$$;