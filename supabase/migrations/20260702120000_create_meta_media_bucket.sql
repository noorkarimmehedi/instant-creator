-- Public media bucket for creator avatars and future profile media.
-- Server-side service role handles writes; public read is required for avatar URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'meta-media',
  'meta-media',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
