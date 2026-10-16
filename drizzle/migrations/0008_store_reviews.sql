CREATE TABLE public.store_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text CHECK (comment IS NULL OR char_length(comment) <= 1000),
  display_name text CHECK (display_name IS NULL OR char_length(display_name) <= 40),
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT (id, rating, comment, display_name, created_at) ON public.store_reviews TO anon, authenticated;
GRANT DELETE ON public.store_reviews TO authenticated;
GRANT ALL ON public.store_reviews TO service_role;
ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads reviews" ON public.store_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin deletes reviews" ON public.store_reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX store_reviews_ip_time ON public.store_reviews (ip_hash, created_at);