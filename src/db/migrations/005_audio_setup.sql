-- ============================================================
-- DRACS S6 - Setup de audios pre-grabados
-- Agrega columna audio_url a exercises + crea tabla ui_audios
-- ============================================================

-- 1. Agregar columna audio_url a exercises (si no existe)
alter table public.exercises
  add column if not exists audio_url text;

-- 2. Crear tabla ui_audios
create table if not exists public.ui_audios (
  key         text primary key,
  text        text not null,
  category    text not null check (category in ('hotspot_intro', 'feedback_correct', 'feedback_incorrect', 'session')),
  audio_url   text,
  created_at  timestamptz not null default now()
);

-- 3. Seed de las 10 frases iniciales
insert into public.ui_audios (key, text, category) values
  ('hotspot_intro_mar',     '¡Vamos al mar!',         'hotspot_intro'),
  ('hotspot_intro_casa',    '¡A jugar en la casa!',   'hotspot_intro'),
  ('hotspot_intro_playa',   '¡Al castillo de arena!', 'hotspot_intro'),
  ('hotspot_intro_faro',    '¡A buscar sorpresas!',   'hotspot_intro'),
  ('hotspot_intro_sol',     '¡Al sol!',               'hotspot_intro'),
  ('feedback_correct_1',    '¡Muy bien!',             'feedback_correct'),
  ('feedback_correct_2',    '¡Genial!',               'feedback_correct'),
  ('feedback_correct_3',    '¡Excelente!',            'feedback_correct'),
  ('feedback_incorrect_1',  'Casi, prueba de nuevo.', 'feedback_incorrect'),
  ('feedback_incorrect_2',  'Intenta otra vez.',      'feedback_incorrect')
on conflict (key) do nothing;

-- 4. RLS lectura pública
alter table public.ui_audios enable row level security;
drop policy if exists "ui_audios_select_all" on public.ui_audios;
create policy "ui_audios_select_all" on public.ui_audios for select using (true);

-- 5. Verificaciones
select key, text, category, audio_url from public.ui_audios order by category, key;
select count(*) as exercises_con_audio from public.exercises where audio_url is not null;
