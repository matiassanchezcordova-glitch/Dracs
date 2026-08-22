-- 012_family_view_focus.sql
-- Cierra el triángulo: expone el énfasis del terapeuta a la familia.
--
-- Recrea children_family_view agregando SOLO dos columnas al final:
--   focus_areas         áreas de foco elegidas por el terapeuta
--   emphasis_game_ids   set de juegos fijados como énfasis
--
-- NUNCA expone focus_note (contexto privado del terapeuta: filtrarlo sería una
-- fuga) ni clinical_notes. El resto de la vista queda idéntico: mismos filtros,
-- security_barrier y grant. Requiere 011_child_focus.sql aplicada.
--
-- CREATE OR REPLACE VIEW admite AGREGAR columnas al final conservando las
-- existentes en el mismo orden; mantiene el grant y no rompe dependientes.

CREATE OR REPLACE VIEW children_family_view
WITH (security_barrier = true)
AS
SELECT
  id, full_name, birth_date, family_notes,
  therapist_id, family_id, created_at,
  focus_areas, emphasis_game_ids
FROM children
WHERE family_id = (SELECT auth.uid());

GRANT SELECT ON children_family_view TO authenticated;
