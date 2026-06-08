-- ============================================================
-- DRACS — Sesión 5 — Actualizar URLs de imágenes en exercises
-- Run in: Supabase Dashboard → SQL Editor
-- Run AFTER 002_real_exercises.sql + image upload to Storage
--
-- IMPORTANTE:
--   • Actualiza el campo `content` JSONB de los 55 ejercicios.
--   • Mapea cada opción/hotspot/step con su URL correspondiente.
--   • Las URLs apuntan al bucket público "exercise-images".
--   • Reusa imágenes donde corresponde (ej: pez del #1 se usa
--     también como opción en #16, #17, etc).
--   • Ejercicio #35 "Un día en la playa" se convierte de
--     Mecánica B a Mecánica A (4 imágenes separadas).
-- ============================================================

-- Base URL del bucket
-- https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/

-- ── 1. ATRAPÁ (identify_image) ─────────────────────────────────

-- #1 — Atrapá el pez (A: pez vs cangrejo)
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/01_pez.png", "label": "pez", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/02_cangrejo.png", "label": "cangrejo", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Atrapá el pez';

-- #2 — Atrapá la ola (A: ola vs nube)
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/08_ola.png", "label": "ola", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/09_nube.png", "label": "nube", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Atrapá la ola';

-- #3 — Atrapá el sol (A: sol vs luna)
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/10_sol.png", "label": "sol", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/11_luna.png", "label": "luna", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Atrapá el sol';

-- #4 — Atrapá el cangrejo (A: cangrejo, tortuga, estrella)
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/02_cangrejo.png", "label": "cangrejo", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/04_tortuga.png", "label": "tortuga marina", "is_correct": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/05_estrella_marina.png", "label": "estrella de mar", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Atrapá el cangrejo';

-- #5 — Atrapá la gaviota (A: gaviota, pato, paloma)
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/12_gaviota.png", "label": "gaviota", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/13_pato.png", "label": "pato", "is_correct": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/14_paloma.png", "label": "paloma", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Atrapá la gaviota';

-- #6 — Atrapá el flotador (A: flotador, tabla surf, chaleco)
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/03_flotador.png", "label": "flotador", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/06_tabla_surf.png", "label": "tabla de surf", "is_correct": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/07_chaleco.png", "label": "salvavidas", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Atrapá el flotador';

-- #7 — Atrapá la caracola (A: caracola, estrella, coral)
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/15_caracola.png", "label": "caracola", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/05_estrella_marina.png", "label": "estrella de mar", "is_correct": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/16_coral.png", "label": "coral", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Atrapá la caracola';

-- #8 — Atrapá el delfín (B: escena delfin)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/78_escena_delfin.png"'::jsonb
) WHERE title = 'Atrapá el delfín';

-- #9 — Atrapá el castillo de arena (B: reusa 39_castillo_arena.png)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/39_castillo_arena.png"'::jsonb
) WHERE title = 'Atrapá el castillo de arena';

-- #10 — Atrapá el tiburón (B)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/79_escena_tiburon.png"'::jsonb
) WHERE title = 'Atrapá el tiburón';

-- #11 — Atrapá el helado (B)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/80_escena_helado.png"'::jsonb
) WHERE title = 'Atrapá el helado';

-- #12 — Atrapá el pez azul (B)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/81_escena_pez_azul.png"'::jsonb
) WHERE title = 'Atrapá el pez azul';

-- #13 — Atrapá la ola más grande (B)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/82_escena_ola_grande.png"'::jsonb
) WHERE title = 'Atrapá la ola más grande';

-- #14 — Atrapá al que está nadando (B)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/83_escena_nadando.png"'::jsonb
) WHERE title = 'Atrapá al que está nadando';

-- #15 — Atrapá al pescador (B)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/84_escena_pescador.png"'::jsonb
) WHERE title = 'Atrapá al pescador';


-- ── 2. CUÁL NO VA (odd_one_out) ────────────────────────────────

-- #16 — ¿Cuál no va? (animal o comida): pez, cangrejo, manzana
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/01_pez.png", "label": "pez", "is_odd": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/02_cangrejo.png", "label": "cangrejo", "is_odd": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/17_manzana.png", "label": "manzana", "is_odd": true}
  ]'::jsonb
) WHERE title = '¿Cuál no va? (animal o comida)';

-- #17 — ¿Cuál no va? (mar o cielo): ola, pez, nube
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/08_ola.png", "label": "ola", "is_odd": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/01_pez.png", "label": "pez", "is_odd": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/09_nube.png", "label": "nube", "is_odd": true}
  ]'::jsonb
) WHERE title = '¿Cuál no va? (mar o cielo)';

-- #18 — ¿Cuál no vive en el mar?: delfín, pulpo, perro
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/18_delfin.png", "label": "delfín", "is_odd": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/19_pulpo.png", "label": "pulpo", "is_odd": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/20_perro.png", "label": "perro", "is_odd": true}
  ]'::jsonb
) WHERE title = '¿Cuál no vive en el mar?';

-- #19 — ¿Cuál no es de playa?: flotador, sombrilla, bufanda
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/03_flotador.png", "label": "flotador", "is_odd": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/21_sombrilla.png", "label": "sombrilla", "is_odd": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/22_bufanda.png", "label": "bufanda", "is_odd": true}
  ]'::jsonb
) WHERE title = '¿Cuál no es de playa?';

-- #20 — ¿Cuál ave no es del mar?: gaviota, pelícano, gallina
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/12_gaviota.png", "label": "gaviota", "is_odd": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/23_pelicano.png", "label": "pelícano", "is_odd": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/24_gallina.png", "label": "gallina", "is_odd": true}
  ]'::jsonb
) WHERE title = '¿Cuál ave no es del mar?';

-- #21 — ¿Cuál no es pez? (B)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/85_escena_no_pez.png"'::jsonb
) WHERE title = '¿Cuál no es pez?';

-- #22 — ¿Cuál no flota? (B)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/86_escena_no_flota.png"'::jsonb
) WHERE title = '¿Cuál no flota?';

-- #23 — ¿Cuál no es de verano? (B)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/87_escena_no_verano.png"'::jsonb
) WHERE title = '¿Cuál no es de verano?';

-- #24 — ¿Cuál casi no pesa? (B)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/88_escena_pesa.png"'::jsonb
) WHERE title = '¿Cuál casi no pesa?';

-- #25 — ¿Cuál no es para nadar? (B)
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/89_escena_no_nadar.png"'::jsonb
) WHERE title = '¿Cuál no es para nadar?';


-- ── 3. PONELO EN ORDEN (sequence) ──────────────────────────────

-- #26 — Ponerse los zapatos (A): 3 pasos
UPDATE exercises SET content = jsonb_set(
  content,
  '{steps}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/25_pie_descalzo.png", "label": "pie descalzo"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/26_pie_entrando_zapato.png", "label": "pie entrando al zapato"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/27_pie_zapato_atado.png", "label": "pie con el zapato puesto y el cordón atado"}
  ]'::jsonb
) WHERE title = 'Ponerse los zapatos';

-- #27 — Lavarse las manos (A)
UPDATE exercises SET content = jsonb_set(
  content,
  '{steps}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/28_grifo_agua.png", "label": "abrir el grifo con agua saliendo"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/29_manos_jabon.png", "label": "manos con jabón haciendo espuma"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/30_manos_toalla.png", "label": "manos secas con la toalla"}
  ]'::jsonb
) WHERE title = 'Lavarse las manos';

-- #28 — Beber agua (A)
UPDATE exercises SET content = jsonb_set(
  content,
  '{steps}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/31_vaso_vacio.png", "label": "vaso vacío sobre la mesa"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/32_vaso_llenandose.png", "label": "vaso siendo llenado con agua"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/33_nino_bebiendo.png", "label": "niño bebiendo del vaso"}
  ]'::jsonb
) WHERE title = 'Beber agua';

-- #29 — Ir a la playa (A)
UPDATE exercises SET content = jsonb_set(
  content,
  '{steps}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/34_nino_mochila_vacia.png", "label": "niño en casa con la mochila vacía"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/35_nino_preparando_mochila.png", "label": "niño preparando la mochila con traje de baño, toalla y gafas"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/36_nino_llegando_playa.png", "label": "niño llegando a la playa con su mochila"}
  ]'::jsonb
) WHERE title = 'Ir a la playa';

-- #30 — Construir un castillo de arena (A)
UPDATE exercises SET content = jsonb_set(
  content,
  '{steps}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/37_cubo_vacio.png", "label": "cubo vacío junto a la arena"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/38_cubo_lleno.png", "label": "cubo lleno de arena"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/39_castillo_arena.png", "label": "castillo de arena terminado con torres"}
  ]'::jsonb
) WHERE title = 'Construir un castillo de arena';

-- #31 — Atar los cordones (A)
UPDATE exercises SET content = jsonb_set(
  content,
  '{steps}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/40_cordones_sueltos.png", "label": "cordones sueltos y cruzados"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/41_cordones_nudo.png", "label": "cordones formando un nudo"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/42_lazo_terminado.png", "label": "lazo terminado"}
  ]'::jsonb
) WHERE title = 'Atar los cordones';

-- #32 — La ola (B): escena 90
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/90_secuencia_ola.png"'::jsonb
) WHERE title = 'La ola';

-- #33 — El helado (B): escena 91
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/91_secuencia_helado.png"'::jsonb
) WHERE title = 'El helado';

-- #34 — El pulpo (B): escena 92
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/92_secuencia_pulpo.png"'::jsonb
) WHERE title = 'El pulpo';

-- #35 — Un día en la playa: AHORA es Mecánica A con 4 imágenes separadas
-- Cambia mechanic de B a A y carga 4 steps
UPDATE exercises SET content = '{
  "mechanic": "A",
  "steps": [
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/93_playa_dia_1.png", "label": "mañana: niño llegando con la mochila, sombrilla cerrada"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/94_playa_dia_2.png", "label": "mediodía: niño jugando en el agua con el flotador, sombrilla abierta"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/95_playa_dia_3.png", "label": "tarde: niño merendando bajo la sombrilla con sol más bajo"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/96_playa_dia_4.png", "label": "atardecer: niño volviendo, sombrilla cerrada, sol naranja"}
  ],
  "correct_order": [0, 1, 2, 3]
}'::jsonb
WHERE title = 'Un día en la playa';

-- #36 — Sembrar una planta (B): escena 99
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/99_secuencia_planta.png"'::jsonb
) WHERE title = 'Sembrar una planta';

-- #37 — Cepillarse los dientes (A)
UPDATE exercises SET content = jsonb_set(
  content,
  '{steps}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/43_cepillo_seco.png", "label": "cepillo seco siendo mojado bajo el grifo"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/44_cepillo_pasta_mojado.png", "label": "cepillo con pasta de dientes encima"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/45_nino_cepillandose.png", "label": "niño cepillándose los dientes"}
  ]'::jsonb
) WHERE title = 'Cepillarse los dientes';

-- #38 — Preparar un sándwich (A)
UPDATE exercises SET content = jsonb_set(
  content,
  '{steps}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/46_rebanadas_pan.png", "label": "dos rebanadas de pan sobre el plato"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/47_pan_jamon_queso.png", "label": "una rebanada con jamón y queso encima"},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/48_sandwich_armado.png", "label": "sándwich armado y cerrado"}
  ]'::jsonb
) WHERE title = 'Preparar un sándwich';

-- #39 — El cangrejo y la ola (B): escena 97
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/97_secuencia_cangrejo.png"'::jsonb
) WHERE title = 'El cangrejo y la ola';

-- #40 — El desayuno (B): escena 98
UPDATE exercises SET content = jsonb_set(
  content,
  '{scene_url}',
  '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/98_secuencia_desayuno.png"'::jsonb
) WHERE title = 'El desayuno';


-- ── 4. ¿QUÉ FALTA? (fill_blank) ────────────────────────────────

-- #41 — El pez nada en el ___: mar, cielo
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/49_mar.png", "text": "mar", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/50_cielo.png", "text": "cielo", "is_correct": false}
  ]'::jsonb
) WHERE title = 'El pez nada en el ___';

-- #42 — El sol está en el ___: cielo, agua
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/50_cielo.png", "text": "cielo", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/51_agua.png", "text": "agua", "is_correct": false}
  ]'::jsonb
) WHERE title = 'El sol está en el ___';

-- #43 — El cangrejo camina en la ___: arena, cama
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/52_arena.png", "text": "arena", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/53_cama.png", "text": "cama", "is_correct": false}
  ]'::jsonb
) WHERE title = 'El cangrejo camina en la ___';

-- #44 — Me pongo las gafas de ___: sol, lluvia(paraguas)
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/54_anteojos.png", "text": "sol", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/55_paraguas.png", "text": "lluvia", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Me pongo las gafas de ___';

-- #45 — El delfín ___ en el agua: nada, corre
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/56_nadar.png", "text": "nada", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/57_correr.png", "text": "corre", "is_correct": false}
  ]'::jsonb
) WHERE title = 'El delfín ___ en el agua';

-- #46 — La gaviota ___ en el cielo: vuela, duerme
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/12_gaviota.png", "text": "vuela", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/58_duerme.png", "text": "duerme", "is_correct": false}
  ]'::jsonb
) WHERE title = 'La gaviota ___ en el cielo';

-- #47 — El niño ___ el castillo de arena: construye, come
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/38_cubo_lleno.png", "text": "construye", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/59_comer.png", "text": "come", "is_correct": false}
  ]'::jsonb
) WHERE title = 'El niño ___ el castillo de arena';

-- #48 — El helado ___ al sol: se derrite, se enfría
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/60_helado_derretido.png", "text": "se derrite", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/61_helado_congelado.png", "text": "se enfría", "is_correct": false}
  ]'::jsonb
) WHERE title = 'El helado ___ al sol';

-- #49 — Para ir a la playa necesito mi ___: traje de baño, abrigo, paraguas
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/62_traje_bano.png", "text": "traje de baño", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/63_abrigo.png", "text": "abrigo", "is_correct": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/55_paraguas.png", "text": "paraguas", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Para ir a la playa necesito mi ___';

-- #50 — El pescador usa una ___ para pescar: caña, cuchara, escoba
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/64_cana_pescar.png", "text": "caña", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/65_cuchara.png", "text": "cuchara", "is_correct": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/66_escoba.png", "text": "escoba", "is_correct": false}
  ]'::jsonb
) WHERE title = 'El pescador usa una ___ para pescar';

-- #51 — La tortuga sale del mar y camina por la ___: arena, nieve, calle
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/52_arena.png", "text": "arena", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/67_nieve.png", "text": "nieve", "is_correct": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/68_calle.png", "text": "calle", "is_correct": false}
  ]'::jsonb
) WHERE title = 'La tortuga sale del mar y camina por la ___';

-- #52 — Hoy el mar está muy ___: tranquilo, agitado, seco + imagen ancla
UPDATE exercises SET content = jsonb_set(
  jsonb_set(
    content,
    '{anchor_image_url}',
    '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/69_mar_tranquilo.png"'::jsonb
  ),
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/69_mar_tranquilo.png", "text": "tranquilo", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/70_mar_agitado.png", "text": "agitado", "is_correct": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/71_seco.png", "text": "seco", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Hoy el mar está muy ___';

-- #53 — El helado está ___: derretido, congelado, caliente + imagen ancla
UPDATE exercises SET content = jsonb_set(
  jsonb_set(
    content,
    '{anchor_image_url}',
    '"https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/60_helado_derretido.png"'::jsonb
  ),
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/60_helado_derretido.png", "text": "derretido", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/61_helado_congelado.png", "text": "congelado", "is_correct": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/72_caliente.png", "text": "caliente", "is_correct": false}
  ]'::jsonb
) WHERE title = 'El helado está ___';

-- #54 — Llevo el flotador porque no sé ___: nadar, cantar, dibujar
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/73_nino_nadando.png", "text": "nadar", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/74_nino_cantando.png", "text": "cantar", "is_correct": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/75_nino_dibujando.png", "text": "dibujar", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Llevo el flotador porque no sé ___';

-- #55 — Me pongo crema solar para no ___: quemarme, mojarme, dormirme
UPDATE exercises SET content = jsonb_set(
  content,
  '{options}',
  '[
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/76_nino_quemado.png", "text": "quemarme", "is_correct": true},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/77_nino_mojado.png", "text": "mojarme", "is_correct": false},
    {"image_url": "https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/58_duerme.png", "text": "dormirme", "is_correct": false}
  ]'::jsonb
) WHERE title = 'Me pongo crema solar para no ___';


-- ── Verificación post-update ───────────────────────────────────
-- Deberían dar 55.
SELECT count(*) AS total FROM exercises;

-- Cuántos tienen image_url real (no null) en options o scene_url o steps:
SELECT
  COUNT(*) FILTER (WHERE content ? 'options' AND content->'options' @> '[{"image_url": null}]'::jsonb) AS options_con_null,
  COUNT(*) FILTER (WHERE content ? 'scene_url' AND content->>'scene_url' IS NULL) AS scene_con_null,
  COUNT(*) FILTER (WHERE content ? 'steps' AND content->'steps' @> '[{"image_url": null}]'::jsonb) AS steps_con_null
FROM exercises;

-- Listar ejercicios con scene_url aún en null (el #9 castillo)
SELECT title FROM exercises 
WHERE content ? 'scene_url' AND content->>'scene_url' = 'null';
