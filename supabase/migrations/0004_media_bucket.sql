-- Public bucket for photos, videos and music that belong to published surprises.
-- Run in the Supabase SQL editor. Files live under <user id>/<surprise id>/..., so creators can only write to their own folder.
insert into storage.buckets (id, name, public, file_size_limit)
values ('surprise-media', 'surprise-media', true, 52428800)
on conflict (id) do nothing;

create policy "Anyone can view surprise media" on storage.objects for select using (bucket_id = 'surprise-media');
create policy "Creators upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'surprise-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Creators update own files" on storage.objects for update to authenticated
  using (bucket_id = 'surprise-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Creators delete own files" on storage.objects for delete to authenticated
  using (bucket_id = 'surprise-media' and (storage.foldername(name))[1] = auth.uid()::text);
