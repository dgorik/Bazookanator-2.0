-- Enforce read-only SELECT + optional limit clamp
create or replace function public.execute_sql_readonly(sql_query text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned text;
  limited text;
  result jsonb;
begin
  if sql_query is null or btrim(sql_query) = '' then
    raise exception 'SQL is empty';
  end if;

  cleaned := btrim(sql_query);

  -- Only SELECT
  if left(lower(cleaned), 6) <> 'select' then
    raise exception 'Only SELECT statements are allowed';
  end if;

  -- No semicolons
  if position(';' in cleaned) > 0 then
    raise exception 'Semicolons are not allowed';
  end if;

  -- Enforce a hard limit (adjust 100 as needed)
  if cleaned ~* '\blimit\s+(\d+)\b' then
    limited := regexp_replace(cleaned, '\blimit\s+(\d+)\b', 'LIMIT 100', 1, 1, 'i');
  else
    limited := cleaned || ' LIMIT 100';
  end if;

  execute format('select jsonb_agg(t) from (%s) t', limited) into result;
  return coalesce(result, '[]'::jsonb);
end;
$$;

-- Tighten privileges
revoke all on function public.execute_sql_readonly(text) from public;
grant execute on function public.execute_sql_readonly(text) to authenticated, service_role;