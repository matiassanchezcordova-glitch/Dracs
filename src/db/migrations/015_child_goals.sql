-- 015_child_goals.sql
-- Objetivos y línea base (Plan de la Carpeta). Guarda en el registro del niño:
--   focus_goals  lista de objetivos, uno por área de foco. Cada uno trae:
--                  area            slug de skill_areas
--                  baselineLabel   el dato del que se partió, en texto
--                  baselineDate    día de la línea base (YYYY-MM-DD)
--                  target          a dónde quiere llegar, con las palabras
--                                  del logopeda
--                  setDate         cuándo se fijó
--                  lastReviewDate  última revisión
--                  done            lo marca el logopeda, nunca Dracs
--
-- jsonb y no una tabla aparte: son pocos por niño, se leen y se escriben
-- siempre juntos con el resto del enfoque, y así 011 y 015 viven en la misma
-- fila. Sólo agrega una columna; no toca datos ni RLS.
--
-- NO se expone en children_family_view: el objetivo y su seguimiento son del
-- logopeda, como focus_note. La familia sigue viendo focus_areas y
-- emphasis_game_ids, y nada más.
--
-- Requiere 011_child_focus.sql aplicada.

alter table public.children
  add column if not exists focus_goals jsonb not null default '[]'::jsonb;
