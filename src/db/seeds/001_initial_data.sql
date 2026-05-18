-- ============================================================
-- DRACS — Initial seed data 001
-- Run in: Supabase Dashboard → SQL Editor
-- Run AFTER 001_mvp_schema.sql.
--
-- Contents:
--   • SECTION A: 8 sample exercises (no auth required)
--   • SECTION B: 1 test child + 1 child_assignment, bound to
--     the first existing therapist profile (you must signup
--     as a therapist in the app once before running B).
--
-- Image and audio URLs are placeholders. Sesiones 5–6 fill them.
-- ============================================================

-- ── SECTION A — Sample exercises ───────────────────────────────

-- 1. identify_image · vocabulary · difficulty 1
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 1,
  'PERRO',
  'Toca el perro',
  '{
    "word": "PERRO",
    "options": [
      { "image_url": null, "emoji_placeholder": "🐶", "label": "perro", "is_correct": true },
      { "image_url": null, "emoji_placeholder": "🐱", "label": "gato",  "is_correct": false }
    ]
  }'::jsonb
);

-- 2. identify_image · vocabulary · difficulty 2
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 2,
  'MANZANA',
  'Toca la manzana',
  '{
    "word": "MANZANA",
    "options": [
      { "image_url": null, "emoji_placeholder": "🍎", "label": "manzana", "is_correct": true },
      { "image_url": null, "emoji_placeholder": "🍌", "label": "plátano", "is_correct": false },
      { "image_url": null, "emoji_placeholder": "🍐", "label": "pera",    "is_correct": false }
    ]
  }'::jsonb
);

-- 3. identify_image · vocabulary · difficulty 3
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 3,
  'CORRER',
  'Toca la acción de correr',
  '{
    "word": "CORRER",
    "options": [
      { "image_url": null, "emoji_placeholder": "🏃", "label": "correr",  "is_correct": true },
      { "image_url": null, "emoji_placeholder": "🚶", "label": "caminar", "is_correct": false },
      { "image_url": null, "emoji_placeholder": "🦘", "label": "saltar",  "is_correct": false },
      { "image_url": null, "emoji_placeholder": "🏊", "label": "nadar",   "is_correct": false }
    ]
  }'::jsonb
);

-- 4. sequence · sequencing · difficulty 2
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 2,
  'Lavarse las manos',
  'Ordena los pasos para lavarse las manos',
  '{
    "steps": [
      { "image_url": null, "emoji_placeholder": "🚿", "label": "abrir el grifo" },
      { "image_url": null, "emoji_placeholder": "🧼", "label": "poner jabón" },
      { "image_url": null, "emoji_placeholder": "🤲", "label": "secar las manos" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- 5. sequence · sequencing · difficulty 2
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 2,
  'Preparar el desayuno',
  'Ordena los pasos para preparar el desayuno',
  '{
    "steps": [
      { "image_url": null, "emoji_placeholder": "🥛", "label": "servir la leche" },
      { "image_url": null, "emoji_placeholder": "🥣", "label": "echar los cereales" },
      { "image_url": null, "emoji_placeholder": "🥄", "label": "comer" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- 6. fill_blank · vocabulary · difficulty 2
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 2,
  'Me lavo las ___',
  'Completa la frase',
  '{
    "sentence": "Me lavo las ___",
    "options": [
      { "text": "manos",   "is_correct": true  },
      { "text": "zapatos", "is_correct": false }
    ]
  }'::jsonb
);

-- 7. fill_blank · vocabulary · difficulty 3
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 3,
  'Cuando tengo sed bebo ___',
  'Completa la frase',
  '{
    "sentence": "Cuando tengo sed bebo ___",
    "options": [
      { "text": "agua",   "is_correct": true  },
      { "text": "tierra", "is_correct": false },
      { "text": "papel",  "is_correct": false }
    ]
  }'::jsonb
);

-- 8. odd_one_out · vocabulary · difficulty 2
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'odd_one_out', 'vocabulary', 2,
  '¿Cuál no es un animal?',
  'Toca el que no es un animal',
  '{
    "question": "¿Cuál no es un animal?",
    "options": [
      { "image_url": null, "emoji_placeholder": "🐶", "label": "perro",   "is_odd": false },
      { "image_url": null, "emoji_placeholder": "🐱", "label": "gato",    "is_odd": false },
      { "image_url": null, "emoji_placeholder": "🍎", "label": "manzana", "is_odd": true  },
      { "image_url": null, "emoji_placeholder": "🐰", "label": "conejo",  "is_odd": false }
    ]
  }'::jsonb
);


-- ── SECTION B — Test child + assignment ────────────────────────
-- Binds to the first therapist profile in the DB. Run this AFTER
-- you've signed up at least once as a therapist via the app.
-- If no therapist exists yet, the DO block aborts with a clear error.

DO $$
DECLARE
  v_therapist_id UUID;
  v_child_id     UUID;
BEGIN
  SELECT id INTO v_therapist_id
  FROM profiles
  WHERE role = 'therapist'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_therapist_id IS NULL THEN
    RAISE EXCEPTION
      'No therapist profile found. Signup as a therapist in the app first, then re-run SECTION B.';
  END IF;

  INSERT INTO children (
    full_name, birth_date, family_notes, clinical_notes,
    therapist_id, family_id
  ) VALUES (
    'Pablo Test',
    DATE '2020-03-15',
    'Avance constante en vocabulario básico. Continuar sesiones diarias.',
    'Hipótesis: dispraxia leve. Reevaluar articulación de /r/ en 2 meses. Familia no informada.',
    v_therapist_id,
    NULL
  )
  RETURNING id INTO v_child_id;

  INSERT INTO child_assignments (
    child_id, categories, difficulty_min, difficulty_max,
    exercises_per_session, assigned_by
  ) VALUES (
    v_child_id,
    ARRAY['vocabulary', 'sequencing'],
    1, 3,
    5,
    v_therapist_id
  );

  RAISE NOTICE 'Created test child % bound to therapist %', v_child_id, v_therapist_id;
END $$;
