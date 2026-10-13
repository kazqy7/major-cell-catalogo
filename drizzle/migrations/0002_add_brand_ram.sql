ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand text, ADD COLUMN IF NOT EXISTS ram text;
UPDATE public.products SET brand = CASE WHEN category = 'xiaomi' THEN 'Xiaomi' ELSE 'Apple' END WHERE brand IS NULL;
UPDATE public.products SET ram = substring(description from '(\d+\s*GB)\s*RAM') WHERE ram IS NULL AND description ~ '\d+\s*GB\s*RAM';