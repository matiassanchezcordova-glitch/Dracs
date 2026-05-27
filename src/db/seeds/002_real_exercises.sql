-- ============================================================
-- DRACS — Sesión 4 — Catálogo real de 50 ejercicios MVP
-- Run in: Supabase Dashboard → SQL Editor
-- Run AFTER 001_initial_data.sql.
--
-- IMPORTANTE:
--   • Borra los 8 ejercicios placeholder de Sesión 2.
--   • Inserta 50 ejercicios redactados clínicamente:
--       - 15 identify_image (Atrapá)
--       - 10 odd_one_out (Cuál NO va)
--       - 10 sequence (Ponelo en orden)
--       - 15 fill_blank (¿Qué falta?)
--   • audio_url = NULL en todos (se completan en Sesión 6).
--   • image_url / scene_url dentro de content = null
--     (se completan en Sesión 5).
--   • content.mechanic: 'A' (cajitas separadas) o 'B' (escena con hotspots).
-- ============================================================

-- ── Borrado de placeholders ────────────────────────────────────
-- Los 8 ejercicios de muestra con emojis ya no se usan.
-- session_exercises los referencia con ON DELETE RESTRICT,
-- así que primero limpiamos sus referencias.

DELETE FROM session_exercises
WHERE exercise_id IN (SELECT id FROM exercises);

DELETE FROM exercises;


-- ── 1. ATRAPÁ (identify_image) — 15 ejercicios ─────────────────

-- #1 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 1,
  'Atrapá el pez',
  '¡Atrapá el pez!',
  '{
    "mechanic": "A",
    "word": "PEZ",
    "options": [
      { "image_url": null, "label": "pez", "is_correct": true },
      { "image_url": null, "label": "cangrejo", "is_correct": false }
    ]
  }'::jsonb
);

-- #2 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 1,
  'Atrapá la ola',
  '¿Dónde está la ola?',
  '{
    "mechanic": "A",
    "word": "OLA",
    "options": [
      { "image_url": null, "label": "ola", "is_correct": true },
      { "image_url": null, "label": "nube", "is_correct": false }
    ]
  }'::jsonb
);

-- #3 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 1,
  'Atrapá el sol',
  '¡Buscá el sol!',
  '{
    "mechanic": "A",
    "word": "SOL",
    "options": [
      { "image_url": null, "label": "sol", "is_correct": true },
      { "image_url": null, "label": "luna", "is_correct": false }
    ]
  }'::jsonb
);

-- #4 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 2,
  'Atrapá el cangrejo',
  '¡Atrapá el cangrejo!',
  '{
    "mechanic": "A",
    "word": "CANGREJO",
    "options": [
      { "image_url": null, "label": "cangrejo", "is_correct": true },
      { "image_url": null, "label": "tortuga marina", "is_correct": false },
      { "image_url": null, "label": "estrella de mar", "is_correct": false }
    ]
  }'::jsonb
);

-- #5 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 2,
  'Atrapá la gaviota',
  '¿Cuál es la gaviota?',
  '{
    "mechanic": "A",
    "word": "GAVIOTA",
    "options": [
      { "image_url": null, "label": "gaviota", "is_correct": true },
      { "image_url": null, "label": "pato", "is_correct": false },
      { "image_url": null, "label": "paloma", "is_correct": false }
    ]
  }'::jsonb
);

-- #6 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 2,
  'Atrapá el flotador',
  '¡Encontrá el flotador!',
  '{
    "mechanic": "A",
    "word": "FLOTADOR",
    "options": [
      { "image_url": null, "label": "flotador", "is_correct": true },
      { "image_url": null, "label": "tabla de surf", "is_correct": false },
      { "image_url": null, "label": "salvavidas", "is_correct": false }
    ]
  }'::jsonb
);

-- #7 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 2,
  'Atrapá la caracola',
  '¿Dónde está la caracola?',
  '{
    "mechanic": "A",
    "word": "CARACOLA",
    "options": [
      { "image_url": null, "label": "caracola", "is_correct": true },
      { "image_url": null, "label": "estrella de mar", "is_correct": false },
      { "image_url": null, "label": "coral", "is_correct": false }
    ]
  }'::jsonb
);

-- #8 — Dificultad 3, Mecánica B (escena)
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 3,
  'Atrapá el delfín',
  '¡Buscá el delfín en el mar!',
  '{
    "mechanic": "B",
    "word": "DELFIN",
    "scene_url": null,
    "scene_description": "Vista del mar abierto con varios mamíferos y peces grandes nadando.",
    "hotspots": [
      { "label": "delfín", "x": null, "y": null, "radius": null, "is_correct": true },
      { "label": "ballena", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "orca", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "tiburón", "x": null, "y": null, "radius": null, "is_correct": false }
    ]
  }'::jsonb
);

-- #9 — Dificultad 3, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 3,
  'Atrapá el castillo de arena',
  '¿Dónde está el castillo de arena?',
  '{
    "mechanic": "B",
    "word": "CASTILLO DE ARENA",
    "scene_url": null,
    "scene_description": "La orilla de la playa con varias construcciones y juegos de arena.",
    "hotspots": [
      { "label": "castillo de arena", "x": null, "y": null, "radius": null, "is_correct": true },
      { "label": "hoyo en la arena", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "montaña de arena lisa", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "cubo lleno de arena", "x": null, "y": null, "radius": null, "is_correct": false }
    ]
  }'::jsonb
);

-- #10 — Dificultad 3, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 3,
  'Atrapá el tiburón',
  '¡Encontrá el tiburón!',
  '{
    "mechanic": "B",
    "word": "TIBURON",
    "scene_url": null,
    "scene_description": "Vista submarina con varios peces grandes.",
    "hotspots": [
      { "label": "tiburón", "x": null, "y": null, "radius": null, "is_correct": true },
      { "label": "pez espada", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "mero", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "barracuda", "x": null, "y": null, "radius": null, "is_correct": false }
    ]
  }'::jsonb
);

-- #11 — Dificultad 3, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 3,
  'Atrapá el helado',
  '¿Dónde está el helado?',
  '{
    "mechanic": "B",
    "word": "HELADO",
    "scene_url": null,
    "scene_description": "Un puesto de playa con varios postres y dulces.",
    "hotspots": [
      { "label": "helado en cucurucho", "x": null, "y": null, "radius": null, "is_correct": true },
      { "label": "granizado en vaso", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "paleta de hielo", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "flan en copa", "x": null, "y": null, "radius": null, "is_correct": false }
    ]
  }'::jsonb
);

-- #12 — Dificultad 4, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 4,
  'Atrapá el pez azul',
  '¡Buscá el pez azul!',
  '{
    "mechanic": "B",
    "word": "PEZ AZUL",
    "scene_url": null,
    "scene_description": "Un arrecife de coral con muchos peces de distintos colores nadando.",
    "hotspots": [
      { "label": "pez azul", "x": null, "y": null, "radius": null, "is_correct": true },
      { "label": "pez naranja con rayas blancas", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "pez globo amarillo", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "pez verde con manchas negras", "x": null, "y": null, "radius": null, "is_correct": false }
    ]
  }'::jsonb
);

-- #13 — Dificultad 4, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 4,
  'Atrapá la ola más grande',
  '¿Cuál es la ola más grande?',
  '{
    "mechanic": "B",
    "word": "OLA GRANDE",
    "scene_url": null,
    "scene_description": "El mar con varias olas de distintos tamaños rompiendo a la vez.",
    "hotspots": [
      { "label": "ola muy grande con espuma en la cresta", "x": null, "y": null, "radius": null, "is_correct": true },
      { "label": "ola mediana", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "ola pequeña que apenas rompe", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "onda chiquita cerca de la orilla", "x": null, "y": null, "radius": null, "is_correct": false }
    ]
  }'::jsonb
);

-- #14 — Dificultad 5, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 5,
  'Atrapá al que está nadando',
  '¿Quién está nadando en el mar?',
  '{
    "mechanic": "B",
    "word": "NADANDO",
    "scene_url": null,
    "scene_description": "Una playa con varios niños haciendo distintas actividades acuáticas.",
    "hotspots": [
      { "label": "niño nadando estilo crol", "x": null, "y": null, "radius": null, "is_correct": true },
      { "label": "niño buceando con tubo y gafas", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "niño en flotador sentado", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "niño caminando en la orilla", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "niño saltando una ola", "x": null, "y": null, "radius": null, "is_correct": false }
    ]
  }'::jsonb
);

-- #15 — Dificultad 5, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'identify_image', 'vocabulary', 5,
  'Atrapá al pescador',
  '¿Quién está pescando?',
  '{
    "mechanic": "B",
    "word": "PESCADOR",
    "scene_url": null,
    "scene_description": "Una bahía con varios personajes haciendo deportes acuáticos.",
    "hotspots": [
      { "label": "pescador con caña en un muelle", "x": null, "y": null, "radius": null, "is_correct": true },
      { "label": "surfista parado en la tabla", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "chico en kayak con remo", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "nadador con gorro", "x": null, "y": null, "radius": null, "is_correct": false },
      { "label": "velerista en un velero", "x": null, "y": null, "radius": null, "is_correct": false }
    ]
  }'::jsonb
);


-- ── 2. CUÁL NO VA (odd_one_out) — 10 ejercicios ────────────────

-- #16 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'odd_one_out', 'vocabulary', 1,
  '¿Cuál no va? (animal o comida)',
  'Uno no es como los demás. ¿Cuál es?',
  '{
    "mechanic": "A",
    "question": "Uno no es como los demás",
    "options": [
      { "image_url": null, "label": "pez", "is_odd": false },
      { "image_url": null, "label": "cangrejo", "is_odd": false },
      { "image_url": null, "label": "manzana", "is_odd": true }
    ]
  }'::jsonb
);

-- #17 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'odd_one_out', 'vocabulary', 1,
  '¿Cuál no va? (mar o cielo)',
  '¿Cuál no va con los otros?',
  '{
    "mechanic": "A",
    "question": "Dos son del mar, uno del cielo",
    "options": [
      { "image_url": null, "label": "ola", "is_odd": false },
      { "image_url": null, "label": "pez", "is_odd": false },
      { "image_url": null, "label": "nube", "is_odd": true }
    ]
  }'::jsonb
);

-- #18 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'odd_one_out', 'vocabulary', 2,
  '¿Cuál no vive en el mar?',
  'Uno no vive en el mar. ¿Cuál es?',
  '{
    "mechanic": "A",
    "question": "Uno no vive en el mar",
    "options": [
      { "image_url": null, "label": "delfín", "is_odd": false },
      { "image_url": null, "label": "pulpo", "is_odd": false },
      { "image_url": null, "label": "perro", "is_odd": true }
    ]
  }'::jsonb
);

-- #19 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'odd_one_out', 'vocabulary', 2,
  '¿Cuál no es de playa?',
  'Uno no es de playa. ¿Cuál es?',
  '{
    "mechanic": "A",
    "question": "Uno no es de playa",
    "options": [
      { "image_url": null, "label": "flotador", "is_odd": false },
      { "image_url": null, "label": "sombrilla", "is_odd": false },
      { "image_url": null, "label": "bufanda", "is_odd": true }
    ]
  }'::jsonb
);

-- #20 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'odd_one_out', 'vocabulary', 2,
  '¿Cuál ave no es del mar?',
  'Una de estas no vive cerca del mar.',
  '{
    "mechanic": "A",
    "question": "Una no vive cerca del mar",
    "options": [
      { "image_url": null, "label": "gaviota", "is_odd": false },
      { "image_url": null, "label": "pelícano", "is_odd": false },
      { "image_url": null, "label": "gallina", "is_odd": true }
    ]
  }'::jsonb
);

-- #21 — Dificultad 3, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'odd_one_out', 'vocabulary', 3,
  '¿Cuál no es pez?',
  'Tres son peces. Uno no. ¿Cuál?',
  '{
    "mechanic": "B",
    "question": "Tres son peces, uno no",
    "scene_url": null,
    "scene_description": "Vista submarina con cuatro animales nadando juntos.",
    "hotspots": [
      { "label": "pez payaso", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "mero", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "sardina", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "delfín", "x": null, "y": null, "radius": null, "is_odd": true }
    ]
  }'::jsonb
);

-- #22 — Dificultad 3, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'odd_one_out', 'vocabulary', 3,
  '¿Cuál no flota?',
  'Tres flotan en el mar. Uno se hunde. ¿Cuál?',
  '{
    "mechanic": "B",
    "question": "Tres flotan, uno se hunde",
    "scene_url": null,
    "scene_description": "Superficie del mar con varios objetos.",
    "hotspots": [
      { "label": "flotador inflado", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "pelota de playa", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "hoja seca", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "piedra", "x": null, "y": null, "radius": null, "is_odd": true }
    ]
  }'::jsonb
);

-- #23 — Dificultad 3, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'odd_one_out', 'vocabulary', 3,
  '¿Cuál no es de verano?',
  'Tres son de verano. Uno no. ¿Cuál?',
  '{
    "mechanic": "B",
    "question": "Tres son de verano, uno no",
    "scene_url": null,
    "scene_description": "Un baúl o una mesa con cosas mezcladas.",
    "hotspots": [
      { "label": "sombrilla de playa", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "traje de baño", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "gafas de sol", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "gorro de lana", "x": null, "y": null, "radius": null, "is_odd": true }
    ]
  }'::jsonb
);

-- #24 — Dificultad 4, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'odd_one_out', 'vocabulary', 4,
  '¿Cuál casi no pesa?',
  'Tres pesan mucho. Uno casi nada. ¿Cuál?',
  '{
    "mechanic": "B",
    "question": "Tres pesan mucho, uno casi nada",
    "scene_url": null,
    "scene_description": "Una playa con varios objetos sobre la arena.",
    "hotspots": [
      { "label": "ancla de barco", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "piedra grande", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "balde lleno de agua", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "pluma", "x": null, "y": null, "radius": null, "is_odd": true }
    ]
  }'::jsonb
);

-- #25 — Dificultad 5, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'odd_one_out', 'vocabulary', 5,
  '¿Cuál no es para nadar?',
  'Tres sirven para el agua. Uno para el aire. ¿Cuál?',
  '{
    "mechanic": "B",
    "question": "Tres son para el agua, uno para el aire",
    "scene_url": null,
    "scene_description": "Una mesa con varios objetos deportivos.",
    "hotspots": [
      { "label": "gafas de bucear", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "aletas de natación", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "tabla de surf", "x": null, "y": null, "radius": null, "is_odd": false },
      { "label": "barrilete", "x": null, "y": null, "radius": null, "is_odd": true }
    ]
  }'::jsonb
);


-- ── 3. PONELO EN ORDEN (sequence) — 10 ejercicios ──────────────

-- #26 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 1,
  'Ponerse los zapatos',
  'Ordená los pasos para ponerse los zapatos.',
  '{
    "mechanic": "A",
    "steps": [
      { "image_url": null, "label": "pie descalzo" },
      { "image_url": null, "label": "pie entrando al zapato" },
      { "image_url": null, "label": "pie con el zapato puesto y el cordón atado" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #27 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 1,
  'Lavarse las manos',
  'Ordená los pasos para lavarse las manos.',
  '{
    "mechanic": "A",
    "steps": [
      { "image_url": null, "label": "abrir el grifo con agua saliendo" },
      { "image_url": null, "label": "manos con jabón haciendo espuma" },
      { "image_url": null, "label": "manos secas con la toalla" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #28 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 1,
  'Beber agua',
  '¿Cómo se hace para tomar agua del vaso?',
  '{
    "mechanic": "A",
    "steps": [
      { "image_url": null, "label": "vaso vacío sobre la mesa" },
      { "image_url": null, "label": "vaso siendo llenado con agua" },
      { "image_url": null, "label": "niño bebiendo del vaso" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #29 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 2,
  'Ir a la playa',
  'Ordená los pasos para ir a la playa.',
  '{
    "mechanic": "A",
    "steps": [
      { "image_url": null, "label": "niño en casa con la mochila vacía" },
      { "image_url": null, "label": "niño preparando la mochila con traje de baño, toalla y gafas" },
      { "image_url": null, "label": "niño llegando a la playa con su mochila" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #30 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 2,
  'Construir un castillo de arena',
  'Ordená los pasos para hacer un castillo de arena.',
  '{
    "mechanic": "A",
    "steps": [
      { "image_url": null, "label": "cubo vacío junto a la arena" },
      { "image_url": null, "label": "cubo lleno de arena" },
      { "image_url": null, "label": "castillo de arena terminado con torres" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #31 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 2,
  'Atar los cordones',
  '¿Cómo se atan los cordones del zapato?',
  '{
    "mechanic": "A",
    "steps": [
      { "image_url": null, "label": "cordones sueltos y cruzados" },
      { "image_url": null, "label": "cordones formando un nudo" },
      { "image_url": null, "label": "lazo terminado" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #32 — Dificultad 3, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 3,
  'La ola',
  'Ordená cómo se forma una ola y vuelve.',
  '{
    "mechanic": "B",
    "steps": [
      { "image_url": null, "label": "ola creciendo mar adentro" },
      { "image_url": null, "label": "ola rompiendo con espuma blanca" },
      { "image_url": null, "label": "espuma volviendo a la orilla" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #33 — Dificultad 3, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 3,
  'El helado',
  'Ordená qué le pasó al helado en la playa.',
  '{
    "mechanic": "B",
    "steps": [
      { "image_url": null, "label": "helado entero y firme en la mano del niño" },
      { "image_url": null, "label": "helado a medio derretir, goteando" },
      { "image_url": null, "label": "helado derretido sobre la arena" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #34 — Dificultad 3, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 3,
  'El pulpo',
  'Ordená lo que hace el pulpo.',
  '{
    "mechanic": "B",
    "steps": [
      { "image_url": null, "label": "pulpo escondido detrás de una roca" },
      { "image_url": null, "label": "pulpo saliendo con tentáculos abiertos" },
      { "image_url": null, "label": "pulpo nadando libre en el mar" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #35 — Dificultad 4, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 4,
  'Un día en la playa',
  'Ordená un día en la playa, de la mañana a la tarde.',
  '{
    "mechanic": "B",
    "steps": [
      { "image_url": null, "label": "mañana: niño llegando con la mochila, sombrilla cerrada" },
      { "image_url": null, "label": "mediodía: niño jugando en el agua con el flotador, sombrilla abierta" },
      { "image_url": null, "label": "tarde: niño merendando bajo la sombrilla con sol más bajo" },
      { "image_url": null, "label": "atardecer: niño volviendo, sombrilla cerrada, sol naranja" }
    ],
    "correct_order": [0, 1, 2, 3]
  }'::jsonb
);

-- #36 — Dificultad 5, Mecánica B
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 5,
  'Sembrar una planta',
  'Ordená cómo crece una planta desde semilla.',
  '{
    "mechanic": "B",
    "steps": [
      { "image_url": null, "label": "mano poniendo una semilla en la tierra" },
      { "image_url": null, "label": "regadera echando agua sobre la tierra" },
      { "image_url": null, "label": "pequeño brote verde saliendo de la tierra" },
      { "image_url": null, "label": "planta con flor" }
    ],
    "correct_order": [0, 1, 2, 3]
  }'::jsonb
);

-- #37 — Dificultad 2, Mecánica A (extra)
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 2,
  'Cepillarse los dientes',
  '¿Cómo se cepilla los dientes un niño?',
  '{
    "mechanic": "A",
    "steps": [
      { "image_url": null, "label": "cepillo seco siendo mojado bajo el grifo" },
      { "image_url": null, "label": "cepillo con pasta de dientes encima" },
      { "image_url": null, "label": "niño cepillándose los dientes" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #38 — Dificultad 2, Mecánica A (extra)
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 2,
  'Preparar un sándwich',
  'Ordená cómo se hace un sándwich.',
  '{
    "mechanic": "A",
    "steps": [
      { "image_url": null, "label": "dos rebanadas de pan sobre el plato" },
      { "image_url": null, "label": "una rebanada con jamón y queso encima" },
      { "image_url": null, "label": "sándwich armado y cerrado" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #39 — Dificultad 3, Mecánica B (extra)
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 3,
  'El cangrejo y la ola',
  'Ordená qué le pasa al cangrejo con la ola.',
  '{
    "mechanic": "B",
    "steps": [
      { "image_url": null, "label": "cangrejo caminando tranquilo en la arena seca" },
      { "image_url": null, "label": "ola llegando, cangrejo siendo cubierto de agua" },
      { "image_url": null, "label": "cangrejo otra vez en la arena, mojado, sacudiéndose" }
    ],
    "correct_order": [0, 1, 2]
  }'::jsonb
);

-- #40 — Dificultad 4, Mecánica B (extra)
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'sequence', 'sequencing', 4,
  'El desayuno',
  'Ordená qué hace un niño al despertarse.',
  '{
    "mechanic": "B",
    "steps": [
      { "image_url": null, "label": "niño durmiendo en la cama" },
      { "image_url": null, "label": "niño despertándose, abriendo los ojos" },
      { "image_url": null, "label": "niño en la mesa preparando el desayuno" },
      { "image_url": null, "label": "niño desayunando" }
    ],
    "correct_order": [0, 1, 2, 3]
  }'::jsonb
);


-- ── 4. ¿QUÉ FALTA? (fill_blank) — 15 ejercicios ────────────────

-- #41 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 1,
  'El pez nada en el ___',
  'El pez nada en el... ¿qué falta?',
  '{
    "mechanic": "A",
    "sentence": "El pez nada en el ___",
    "options": [
      { "image_url": null, "text": "mar", "is_correct": true },
      { "image_url": null, "text": "cielo", "is_correct": false }
    ]
  }'::jsonb
);

-- #42 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 1,
  'El sol está en el ___',
  'El sol está en el... ¿qué falta?',
  '{
    "mechanic": "A",
    "sentence": "El sol está en el ___",
    "options": [
      { "image_url": null, "text": "cielo", "is_correct": true },
      { "image_url": null, "text": "agua", "is_correct": false }
    ]
  }'::jsonb
);

-- #43 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 1,
  'El cangrejo camina en la ___',
  'El cangrejo camina en la... ¿qué falta?',
  '{
    "mechanic": "A",
    "sentence": "El cangrejo camina en la ___",
    "options": [
      { "image_url": null, "text": "arena", "is_correct": true },
      { "image_url": null, "text": "cama", "is_correct": false }
    ]
  }'::jsonb
);

-- #44 — Dificultad 1, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 1,
  'Me pongo las gafas de ___',
  'Me pongo las gafas de... ¿qué falta?',
  '{
    "mechanic": "A",
    "sentence": "Me pongo las gafas de ___",
    "options": [
      { "image_url": null, "text": "sol", "is_correct": true },
      { "image_url": null, "text": "lluvia", "is_correct": false }
    ]
  }'::jsonb
);

-- #45 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 2,
  'El delfín ___ en el agua',
  'El delfín... en el agua. ¿Qué falta?',
  '{
    "mechanic": "A",
    "sentence": "El delfín ___ en el agua",
    "options": [
      { "image_url": null, "text": "nada", "is_correct": true },
      { "image_url": null, "text": "corre", "is_correct": false }
    ]
  }'::jsonb
);

-- #46 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 2,
  'La gaviota ___ en el cielo',
  'La gaviota... en el cielo. ¿Qué falta?',
  '{
    "mechanic": "A",
    "sentence": "La gaviota ___ en el cielo",
    "options": [
      { "image_url": null, "text": "vuela", "is_correct": true },
      { "image_url": null, "text": "duerme", "is_correct": false }
    ]
  }'::jsonb
);

-- #47 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 2,
  'El niño ___ el castillo de arena',
  'El niño... el castillo de arena. ¿Qué falta?',
  '{
    "mechanic": "A",
    "sentence": "El niño ___ el castillo de arena",
    "options": [
      { "image_url": null, "text": "construye", "is_correct": true },
      { "image_url": null, "text": "come", "is_correct": false }
    ]
  }'::jsonb
);

-- #48 — Dificultad 2, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 2,
  'El helado ___ al sol',
  'El helado... al sol. ¿Qué falta?',
  '{
    "mechanic": "A",
    "sentence": "El helado ___ al sol",
    "options": [
      { "image_url": null, "text": "se derrite", "is_correct": true },
      { "image_url": null, "text": "se enfría", "is_correct": false }
    ]
  }'::jsonb
);

-- #49 — Dificultad 3, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 3,
  'Para ir a la playa necesito mi ___',
  'Para ir a la playa necesito mi... ¿qué falta?',
  '{
    "mechanic": "A",
    "sentence": "Para ir a la playa necesito mi ___",
    "options": [
      { "image_url": null, "text": "traje de baño", "is_correct": true },
      { "image_url": null, "text": "abrigo", "is_correct": false },
      { "image_url": null, "text": "paraguas", "is_correct": false }
    ]
  }'::jsonb
);

-- #50 — Dificultad 3, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 3,
  'El pescador usa una ___ para pescar',
  'El pescador usa una... para pescar. ¿Qué falta?',
  '{
    "mechanic": "A",
    "sentence": "El pescador usa una ___ para pescar",
    "options": [
      { "image_url": null, "text": "caña", "is_correct": true },
      { "image_url": null, "text": "cuchara", "is_correct": false },
      { "image_url": null, "text": "escoba", "is_correct": false }
    ]
  }'::jsonb
);

-- #51 — Dificultad 3, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 3,
  'La tortuga sale del mar y camina por la ___',
  'La tortuga sale del mar y camina por la... ¿qué falta?',
  '{
    "mechanic": "A",
    "sentence": "La tortuga sale del mar y camina por la ___",
    "options": [
      { "image_url": null, "text": "arena", "is_correct": true },
      { "image_url": null, "text": "nieve", "is_correct": false },
      { "image_url": null, "text": "calle", "is_correct": false }
    ]
  }'::jsonb
);

-- #52 — Dificultad 4, Mecánica A (con imagen ancla)
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 4,
  'Hoy el mar está muy ___',
  'Hoy el mar está muy... ¿qué falta?',
  '{
    "mechanic": "A",
    "sentence": "Hoy el mar está muy ___",
    "anchor_image_url": null,
    "anchor_description": "Mar quieto, sin olas",
    "options": [
      { "image_url": null, "text": "tranquilo", "is_correct": true },
      { "image_url": null, "text": "agitado", "is_correct": false },
      { "image_url": null, "text": "seco", "is_correct": false }
    ]
  }'::jsonb
);

-- #53 — Dificultad 4, Mecánica A (con imagen ancla)
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 4,
  'El helado está ___',
  'El helado está... ¿qué falta?',
  '{
    "mechanic": "A",
    "sentence": "El helado está ___",
    "anchor_image_url": null,
    "anchor_description": "Helado a medio derretir",
    "options": [
      { "image_url": null, "text": "derretido", "is_correct": true },
      { "image_url": null, "text": "congelado", "is_correct": false },
      { "image_url": null, "text": "caliente", "is_correct": false }
    ]
  }'::jsonb
);

-- #54 — Dificultad 5, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 5,
  'Llevo el flotador porque no sé ___',
  'Llevo el flotador porque no sé... ¿qué falta?',
  '{
    "mechanic": "A",
    "sentence": "Llevo el flotador porque no sé ___",
    "options": [
      { "image_url": null, "text": "nadar", "is_correct": true },
      { "image_url": null, "text": "cantar", "is_correct": false },
      { "image_url": null, "text": "dibujar", "is_correct": false }
    ]
  }'::jsonb
);

-- #55 — Dificultad 5, Mecánica A
INSERT INTO exercises (type, category, difficulty, title, prompt, content) VALUES (
  'fill_blank', 'vocabulary', 5,
  'Me pongo crema solar para no ___',
  'Me pongo crema solar para no... ¿qué falta?',
  '{
    "mechanic": "A",
    "sentence": "Me pongo crema solar para no ___",
    "options": [
      { "image_url": null, "text": "quemarme", "is_correct": true },
      { "image_url": null, "text": "mojarme", "is_correct": false },
      { "image_url": null, "text": "dormirme", "is_correct": false }
    ]
  }'::jsonb
);


-- ── Verificación post-load ─────────────────────────────────────
-- Debería devolver 50.
SELECT count(*) AS total_exercises FROM exercises;

-- Distribución por tipo (esperado: 15 identify_image, 10 odd_one_out,
-- 10 sequence, 15 fill_blank)
SELECT type, count(*) FROM exercises GROUP BY type ORDER BY type;

-- Distribución por dificultad
SELECT difficulty, count(*) FROM exercises GROUP BY difficulty ORDER BY difficulty;
