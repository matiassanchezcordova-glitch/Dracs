-- ============================================================
-- DRACS — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Perfiles de usuario (extiende auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('patient', 'family', 'therapist')),
  full_name   TEXT NOT NULL,
  email       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Datos del paciente / niño
CREATE TABLE patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  child_name      TEXT NOT NULL,
  child_age       INTEGER NOT NULL CHECK (child_age BETWEEN 3 AND 10),
  diagnosis       TEXT DEFAULT 'Síndrome de Down',
  current_level   INTEGER DEFAULT 1 CHECK (current_level BETWEEN 1 AND 4),
  streak_days     INTEGER DEFAULT 0,
  therapist_id    UUID REFERENCES profiles(id),
  center_name     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Datos del terapeuta
CREATE TABLE therapists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  specialty       TEXT NOT NULL,
  license_number  TEXT NOT NULL,
  center_name     TEXT NOT NULL,
  city            TEXT NOT NULL,
  max_patients    INTEGER DEFAULT 80,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Centros de trabajo
CREATE TABLE centers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  city        TEXT NOT NULL,
  type        TEXT CHECK (type IN ('hospital', 'cdiap', 'private', 'public', 'other')),
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Sesiones de ejercicios
CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_number    INTEGER NOT NULL,
  total_exercises   INTEGER NOT NULL,
  correct_answers   INTEGER NOT NULL,
  accuracy_percent  NUMERIC(5,2),
  duration_minutes  INTEGER,
  level_at_session  INTEGER,
  exercises_data    JSONB,
  completed_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios del terapeuta
CREATE TABLE therapist_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id    UUID NOT NULL REFERENCES profiles(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  week_code       TEXT NOT NULL,
  comment_text    TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (therapist_id, patient_id, week_code)
);

-- Solicitudes de vinculación terapeuta ↔ paciente
CREATE TABLE link_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES patients(id),
  therapist_id  UUID NOT NULL REFERENCES profiles(id),
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Centros precargados ─────────────────────────────────────────────────────

INSERT INTO centers (name, city, type) VALUES
  ('Hospital Sant Pau', 'Barcelona', 'hospital'),
  ('Hospital Sant Joan de Déu', 'Barcelona', 'hospital'),
  ('Hospital Vall d''Hebron', 'Barcelona', 'hospital'),
  ('CDIAP Nou Barris', 'Barcelona', 'cdiap'),
  ('CDIAP Sarrià-Sant Gervasi', 'Barcelona', 'cdiap'),
  ('CDIAP Eixample', 'Barcelona', 'cdiap'),
  ('Hospital La Paz', 'Madrid', 'hospital'),
  ('Hospital Niño Jesús', 'Madrid', 'hospital'),
  ('Hospital Gregorio Marañón', 'Madrid', 'hospital'),
  ('Centro de Atención Temprana Valencia', 'Valencia', 'public');

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE centers            ENABLE ROW LEVEL SECURITY;

-- Centers: lectura pública
CREATE POLICY "centers_select_all"
  ON centers FOR SELECT USING (true);

-- Profiles
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Therapists need to see other therapists' profiles for search
CREATE POLICY "profiles_select_therapists"
  ON profiles FOR SELECT USING (role = 'therapist');

-- Patients
CREATE POLICY "patients_select_owner_or_therapist"
  ON patients FOR SELECT USING (
    profile_id = auth.uid() OR therapist_id = auth.uid()
  );

CREATE POLICY "patients_insert_own"
  ON patients FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "patients_update_own"
  ON patients FOR UPDATE USING (profile_id = auth.uid());

-- Therapist can update therapist_id on patient when accepting link request
CREATE POLICY "patients_update_therapist_accept"
  ON patients FOR UPDATE USING (
    id IN (
      SELECT patient_id FROM link_requests
      WHERE therapist_id = auth.uid() AND status = 'pending'
    )
  );

-- Therapists table
CREATE POLICY "therapists_select_own"
  ON therapists FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "therapists_select_for_search"
  ON therapists FOR SELECT USING (true);

CREATE POLICY "therapists_insert_own"
  ON therapists FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "therapists_update_own"
  ON therapists FOR UPDATE USING (profile_id = auth.uid());

-- Sessions
CREATE POLICY "sessions_select_patient_or_therapist"
  ON sessions FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE profile_id = auth.uid() OR therapist_id = auth.uid()
    )
  );

CREATE POLICY "sessions_insert_own_patient"
  ON sessions FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE profile_id = auth.uid()
    )
  );

-- Therapist comments
CREATE POLICY "comments_select_therapist_or_family"
  ON therapist_comments FOR SELECT USING (
    therapist_id = auth.uid() OR
    patient_id IN (
      SELECT id FROM patients WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "comments_insert_therapist"
  ON therapist_comments FOR INSERT WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "comments_update_therapist"
  ON therapist_comments FOR UPDATE USING (therapist_id = auth.uid());

-- Link requests
CREATE POLICY "link_requests_select_both_parties"
  ON link_requests FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE profile_id = auth.uid()
    ) OR therapist_id = auth.uid()
  );

CREATE POLICY "link_requests_insert_patient"
  ON link_requests FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "link_requests_update_therapist"
  ON link_requests FOR UPDATE USING (therapist_id = auth.uid());
