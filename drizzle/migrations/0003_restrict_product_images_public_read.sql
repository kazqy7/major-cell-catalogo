DROP POLICY "public read product images" ON storage.objects;

CREATE POLICY "public read product images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = 'official'
);