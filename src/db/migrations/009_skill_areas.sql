-- 009_skill_areas.sql
-- Taxonomía de áreas de habilidad (v1) + etiquetado de los juegos (exercises).
--
-- PHASE 1 del "Escritorio del Terapeuta". Esta migración crea SOLO el esquema:
--   1) tabla de referencia `skill_areas` (sembrada con la taxonomía v1)
--   2) dos columnas nullable en `exercises`: primary_skill / secondary_skill
--
-- Las etiquetas concretas de cada juego (UPDATE ...) van en una migración aparte
-- (010), después de que Matías revise la tabla propuesta.
--
-- Nota clínica: las descripciones dicen qué TRABAJA cada área, nunca resultados
-- ("mejora"/"trata"). Sin claims.

-- ── 1. Tabla de referencia ───────────────────────────────────────────────────
create table if not exists public.skill_areas (
  slug           text primary key,
  label_es       text not null,
  description_es text,
  sort_order     integer not null default 0
);

insert into public.skill_areas (slug, label_es, description_es, sort_order) values
  ('lenguaje_receptivo', 'Lenguaje receptivo',
   'Comprensión del lenguaje: reconocer una palabra y asociarla a su referente.', 1),
  ('lenguaje_expresivo', 'Vocabulario y lenguaje expresivo',
   'Vocabulario y construcción de oraciones con sentido.', 2),
  ('atencion', 'Atención y percepción visual',
   'Atención sostenida y discriminación visual entre estímulos.', 3),
  ('cognicion', 'Cognición y conceptos',
   'Conceptos, categorías y secuencias temporales o causales.', 4),
  ('autorregulacion', 'Autorregulación y espera',
   'Esperar el turno y regular la respuesta.', 5),
  ('social', 'Habilidades sociales y comunicación',
   'Comunicación e interacción social.', 6),
  ('autonomia', 'Autonomía y vida diaria',
   'Rutinas y actividades de la vida diaria, paso a paso.', 7),
  -- `motricidad_fina` se mantiene en la taxonomía por decisión de producto,
  -- aunque hoy 0 juegos la trabajan: todas las mecánicas actuales son de
  -- toque/selección (SequenceQuestion usa handleTap; ExerciseCard es
  -- draggable={false}). Queda lista para juegos de arrastre/trazo/precisión.
  ('motricidad_fina', 'Motricidad fina y coordinación visomotora',
   'Coordinación ojo-mano y precisión del gesto.', 8)
on conflict (slug) do update
  set label_es = excluded.label_es,
      description_es = excluded.description_es,
      sort_order = excluded.sort_order;

-- ── 2. Columnas de etiqueta en los juegos ────────────────────────────────────
alter table public.exercises
  add column if not exists primary_skill   text references public.skill_areas(slug),
  add column if not exists secondary_skill text references public.skill_areas(slug);

-- Lectura pública de la tabla de referencia (igual criterio que exercises, que
-- ya es de lectura pública). Ajustar a la política real del proyecto si difiere.
alter table public.skill_areas enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'skill_areas'
      and policyname = 'skill_areas_public_read'
  ) then
    create policy skill_areas_public_read
      on public.skill_areas for select using (true);
  end if;
end $$;
