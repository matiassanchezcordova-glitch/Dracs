-- 016_leads_logopedas.sql
-- Formulario "Quiero sumarme" de la landing (src/landing/JoinForm.tsx).
--
-- Cualquiera puede ENVIAR (insert) desde la web, sin cuenta. Nadie puede LEER
-- desde el cliente: no hay policy de select. Las respuestas se ven en el panel
-- de Supabase (Table Editor → leads_logopedas).
--
-- Mientras esta migración no esté aplicada, el formulario muestra un aviso y
-- ofrece mandar el mismo mensaje por correo. No se pierde nada.

create table if not exists public.leads_logopedas (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  nombre         text not null check (char_length(nombre) between 1 and 120),
  email          text not null check (char_length(email) between 3 and 200),
  lugar_trabajo  text check (char_length(lugar_trabajo) <= 60),
  ciudad         text check (char_length(ciudad) <= 80),
  edades         text check (char_length(edades) <= 80),
  participacion  text[] not null default '{}',
  comentario     text check (char_length(comentario) <= 2000),
  origen         text check (char_length(origen) <= 80)
);

alter table public.leads_logopedas enable row level security;

drop policy if exists "leads: cualquiera puede enviar" on public.leads_logopedas;
create policy "leads: cualquiera puede enviar"
  on public.leads_logopedas
  for insert
  to anon, authenticated
  with check (true);
