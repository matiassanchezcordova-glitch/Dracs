-- 011_child_focus.sql
-- Personalización real (Phase 3): el terapeuta enfoca el mundo de un niño.
-- Guarda en el registro del niño (children):
--   focus_areas        áreas de habilidad elegidas (slugs de skill_areas)
--   focus_note         nota libre de contexto (dificultades, objetivos, intereses).
--                      v1 NO la parsea: se guarda para el terapeuta y para un
--                      pase de LLM posterior.
--   emphasis_game_ids  set de juegos que el terapeuta fija como énfasis del niño.
--
-- Requiere 009/010 aplicadas (para que exista el etiquetado de juegos que
-- alimenta las recomendaciones). Sólo agrega columnas; no toca datos ni RLS.

alter table public.children
  add column if not exists focus_areas       text[] not null default '{}',
  add column if not exists focus_note        text,
  add column if not exists emphasis_game_ids uuid[] not null default '{}';

-- Nota para el PRÓXIMO paso (no incluido aquí): cuando el mundo del niño y la
-- "una cosa para hoy" de la familia deban reflejar este énfasis, habrá que
-- exponer emphasis_game_ids / focus_areas en children_family_view.
