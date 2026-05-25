-- Create product-images storage bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow public read access
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Allow authenticated users (admins) to upload
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );

-- Allow users to delete their own images
create policy "Authenticated users can delete"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );
