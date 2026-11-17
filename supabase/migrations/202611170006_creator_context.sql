-- Persist creator-specific generation context with each saved batch.
-- Apply only to the confirmed ViralBatch Supabase project after reviewing prior migrations.
alter table public.batches
  add column if not exists content_goal text not null default 'Grow audience'
    check (content_goal in ('Grow audience','Educate audience','Build community','Drive sales','Increase engagement')),
  add column if not exists target_audience text not null default '',
  add column if not exists brand_voice text not null default '';

alter table public.batches
  add constraint batches_target_audience_length
    check (char_length(target_audience) <= 120),
  add constraint batches_brand_voice_length
    check (char_length(brand_voice) <= 280);
