-- ============================================================
-- DRACS — MVP Schema Migration 001
-- Run in: Supabase Dashboard → SQL Editor
--
-- Adds: children, exercises, child_assignments, session_exercises
-- Replaces: sessions (drops empty old one, recreates)
-- Preserves: profiles, patients, therapists, centers,
--            therapist_comments, link_requests
--
-- Notes:
--   - clinical_notes (children) is therapist-only via the
--     `children_family_view` view + RLS that blocks direct
--     SELECT for non-therapists.
--   - is_user_related_to_child() is SECURITY DEFINER so other
--     tables' policies can check the relation without granting
--     SELECT on `children`.
-- ============================================================

-- ── 1. profiles: expand role CHECK (additive, non-breaking) ────
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('patient', 'family', 'therapist', 'child'));

-- ── 2. children ────────────────────────────────────────────────
CREATE TABLE children (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  birth_date      DATE NOT NULL,
  family_notes    TEXT,                          -- shared with family
  clinical_notes  TEXT,                          -- therapist-only
  therapist_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  family_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_children_therapist ON children(therapist_id);
CREATE INDEX idx_children_family    ON children(family_id);

-- ── 3. exercises (master catalog) ──────────────────────────────
CREATE TABLE exercises (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL CHECK (type IN ('identify_image', 'fill_blank', 'odd_one_out', 'sequence')),
  category    TEXT NOT NULL CHECK (category IN ('vocabulary', 'articulation', 'sequencing', 'comprehension')),
  difficulty  INT  NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  title       TEXT NOT NULL,
  prompt      TEXT NOT NULL,
  content     JSONB NOT NULL,
  audio_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_exercises_category_difficulty ON exercises(category, difficulty);
CREATE INDEX idx_exercises_type ON exercises(type);

-- ── 4. child_assignments ───────────────────────────────────────
CREATE TABLE child_assignments (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id               UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  categories             TEXT[] NOT NULL DEFAULT '{}',
  difficulty_min         INT NOT NULL DEFAULT 1 CHECK (difficulty_min BETWEEN 1 AND 5),
  difficulty_max         INT NOT NULL DEFAULT 5 CHECK (difficulty_max BETWEEN 1 AND 5),
  exercises_per_session  INT NOT NULL DEFAULT 5 CHECK (exercises_per_session BETWEEN 1 AND 20),
  assigned_by            UUID NOT NULL REFERENCES profiles(id),
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  CHECK (difficulty_min <= difficulty_max)
);
CREATE INDEX idx_child_assignments_child ON child_assignments(child_id);

-- ── 5. sessions (drop empty old one, recreate with MVP shape) ──
-- Old shape used (patient_id, session_number, accuracy_percent, ...).
-- Old code in ExerciseTab/TherapistTab/FamiliaTab/PatientDetail still
-- references the old columns; those inserts will log a PostgREST
-- warn at runtime until Sesión 3 rewires them. UX unaffected.
DROP TABLE IF EXISTS sessions CASCADE;
CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  total_exercises   INT NOT NULL DEFAULT 0,
  correct_count     INT NOT NULL DEFAULT 0,
  duration_seconds  INT
);
CREATE INDEX idx_sessions_child   ON sessions(child_id);
CREATE INDEX idx_sessions_started ON sessions(started_at DESC);

-- ── 6. session_exercises ───────────────────────────────────────
CREATE TABLE session_exercises (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id           UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  order_index           INT NOT NULL,
  answered_correctly    BOOLEAN,
  time_spent_seconds    INT,
  attempts_count        INT DEFAULT 0,
  UNIQUE (session_id, order_index)
);
CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);

-- ── 7. Helper: SECURITY DEFINER bypass for related-child check ─
-- Other tables' policies call this so they don't need SELECT on
-- `children`, which is locked down to therapists only.
CREATE OR REPLACE FUNCTION is_user_related_to_child(p_child_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM children
    WHERE id = p_child_id
      AND (therapist_id = auth.uid() OR family_id = auth.uid())
  );
$$;

REVOKE EXECUTE ON FUNCTION is_user_related_to_child(UUID) FROM public;
GRANT  EXECUTE ON FUNCTION is_user_related_to_child(UUID) TO authenticated;

-- ── 8. children_family_view ────────────────────────────────────
-- Family-safe view: omits clinical_notes, filters by auth.uid().
-- Runs as view owner (security_invoker = false, default), so it
-- bypasses the children RLS that blocks family direct SELECT.
-- security_barrier = true prevents leaky predicate pushdown.
CREATE VIEW children_family_view
WITH (security_barrier = true)
AS
SELECT
  id, full_name, birth_date, family_notes,
  therapist_id, family_id, created_at
FROM children
WHERE family_id = (SELECT auth.uid());

GRANT SELECT ON children_family_view TO authenticated;

-- ── 9. RLS — enable on new tables ──────────────────────────────
ALTER TABLE children          ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises         ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;

-- ── 10. RLS — exercises (read-only catalog) ────────────────────
CREATE POLICY "exercises_select_authenticated"
  ON exercises FOR SELECT TO authenticated USING (true);

-- ── 11. RLS — children (therapist-only direct access) ──────────
-- Family must read via children_family_view to avoid clinical_notes.
CREATE POLICY "children_select_therapist"
  ON children FOR SELECT
  USING (therapist_id = auth.uid());

CREATE POLICY "children_insert_therapist"
  ON children FOR INSERT
  WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "children_update_therapist"
  ON children FOR UPDATE
  USING (therapist_id = auth.uid());

-- ── 12. RLS — child_assignments ────────────────────────────────
CREATE POLICY "child_assignments_select_related"
  ON child_assignments FOR SELECT
  USING (is_user_related_to_child(child_id));

CREATE POLICY "child_assignments_insert_therapist"
  ON child_assignments FOR INSERT
  WITH CHECK (
    assigned_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM children
      WHERE id = child_id AND therapist_id = auth.uid()
    )
  );

CREATE POLICY "child_assignments_update_therapist"
  ON child_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE id = child_assignments.child_id AND therapist_id = auth.uid()
    )
  );

-- ── 13. RLS — sessions ─────────────────────────────────────────
CREATE POLICY "sessions_select_related"
  ON sessions FOR SELECT
  USING (is_user_related_to_child(child_id));

CREATE POLICY "sessions_insert_related"
  ON sessions FOR INSERT
  WITH CHECK (is_user_related_to_child(child_id));

CREATE POLICY "sessions_update_related"
  ON sessions FOR UPDATE
  USING (is_user_related_to_child(child_id));

-- ── 14. RLS — session_exercises ────────────────────────────────
-- Subquery to sessions is itself RLS-filtered, so this transitively
-- enforces the same related-child check.
CREATE POLICY "session_exercises_select_related"
  ON session_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_exercises.session_id
        AND is_user_related_to_child(s.child_id)
    )
  );

CREATE POLICY "session_exercises_insert_related"
  ON session_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_exercises.session_id
        AND is_user_related_to_child(s.child_id)
    )
  );

CREATE POLICY "session_exercises_update_related"
  ON session_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_exercises.session_id
        AND is_user_related_to_child(s.child_id)
    )
  );
