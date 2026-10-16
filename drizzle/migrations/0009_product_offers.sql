ALTER TABLE public.products ADD COLUMN offer_active boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN offer_price numeric;
ALTER TABLE public.products ADD COLUMN offer_ends_at timestamptz;