-- DRACS S6 Bloque 2 — Preparar prompts de exercises para TTS
-- ============================================================
-- Decisiones tomadas con Matías (S6 B2):
--   • Opción A: el tag emocional vive SOLO en `prompt` (texto que va al TTS);
--     la pantalla lee una columna sin tag.
--   • La pantalla muestra el texto NEUTRO (sin voseo), igual que el audio,
--     para que lo que el niño ve coincida con lo que oye.
--
-- Por eso usamos 3 columnas en public.exercises:
--   • prompt          → texto para TTS: '[friendly] ' + texto neutro.
--   • prompt_display  → texto neutro SIN tag; lo que el frontend mostrará.
--   • prompt_original → backup literal del original (con voseo), solo para revertir.
--
-- NOTA FRONTEND (fuera de scope de este bloque): hasta que el frontend lea
-- `prompt_display` en vez de `prompt`, la pantalla mostrará el tag '[friendly]'.
-- Esto se cablea en el bloque de frontend; este bloque es solo generación.
-- ============================================================

-- ── 1. Columnas nuevas (backup + display) ──────────────────────
alter table public.exercises
  add column if not exists prompt_original text;
alter table public.exercises
  add column if not exists prompt_display text;

-- Guardar el original literal (con voseo) una sola vez, antes de tocar nada.
update public.exercises
set prompt_original = prompt
where prompt_original is null and prompt is not null;

-- ── 2. Normalizar voseo rioplatense → neutro latinoamericano ────
-- Razón: consistencia con la voz Natalia (neutra) y con el mercado.
-- Imperativos realmente presentes en los prompts: Atrapá, Buscá, Encontrá, Ordená.
-- OJO: 'Encontrá' → 'Encuentra' (cambio de raíz e→ue), NO 'Encontra'.
-- 'Mirá'/'Elegí' no aparecen hoy en ningún prompt, pero se dejan por si a futuro.
-- 'está' / '¿Dónde está' / '¿Quién está' NO son voseo (3ª pers. de estar): no se tocan.
-- \m y \M son word boundaries en PostgreSQL regex.
update public.exercises set prompt = regexp_replace(prompt, '\mAtrapá\M',   'Atrapa',    'g') where prompt ~ '\mAtrapá\M';
update public.exercises set prompt = regexp_replace(prompt, '\matrapá\M',   'atrapa',    'g') where prompt ~ '\matrapá\M';
update public.exercises set prompt = regexp_replace(prompt, '\mBuscá\M',    'Busca',     'g') where prompt ~ '\mBuscá\M';
update public.exercises set prompt = regexp_replace(prompt, '\mbuscá\M',    'busca',     'g') where prompt ~ '\mbuscá\M';
update public.exercises set prompt = regexp_replace(prompt, '\mEncontrá\M', 'Encuentra', 'g') where prompt ~ '\mEncontrá\M';
update public.exercises set prompt = regexp_replace(prompt, '\mencontrá\M', 'encuentra', 'g') where prompt ~ '\mencontrá\M';
update public.exercises set prompt = regexp_replace(prompt, '\mOrdená\M',   'Ordena',    'g') where prompt ~ '\mOrdená\M';
update public.exercises set prompt = regexp_replace(prompt, '\mordená\M',   'ordena',    'g') where prompt ~ '\mordená\M';
update public.exercises set prompt = regexp_replace(prompt, '\mMirá\M',     'Mira',      'g') where prompt ~ '\mMirá\M';
update public.exercises set prompt = regexp_replace(prompt, '\mmirá\M',     'mira',      'g') where prompt ~ '\mmirá\M';
update public.exercises set prompt = regexp_replace(prompt, '\mElegí\M',    'Elige',     'g') where prompt ~ '\mElegí\M';
update public.exercises set prompt = regexp_replace(prompt, '\melegí\M',    'elige',     'g') where prompt ~ '\melegí\M';
-- Si aparecen otros verbos en voseo durante la inspección visual, agregalos acá
-- con el mismo patrón (recordá los cambios de raíz: -gí→-ge, -ontrá→-uentra, etc.).

-- ── 3. prompt_display = texto neutro SIN tag ───────────────────
-- Se deriva de `prompt` quitándole un eventual tag inicial '[xxx] '.
-- Idempotente: en la 1ª corrida `prompt` todavía no tiene tag (se agrega en el
-- paso 4), así que queda igual; en re-runs `prompt` ya tiene tag y se lo quita.
-- En ambos casos prompt_display queda neutro y sin tag.
update public.exercises
set prompt_display = regexp_replace(prompt, '^\[[a-z]+\]\s*', '')
where prompt is not null;

-- ── 4. Tag [friendly] al inicio de `prompt` (solo TTS) ─────────
-- Solo si no lo tiene ya (idempotente). Resetea audio_url para forzar regen.
update public.exercises
set prompt = '[friendly] ' || prompt,
    audio_url = null
where prompt is not null
  and prompt not like '[%';

-- ── 5. Verificación ────────────────────────────────────────────
-- (columnas que SÍ existen; la tabla exercises NO tiene columna `place`).
select id, title, prompt_original, prompt_display, prompt
from public.exercises
where prompt is not null
order by difficulty, title
limit 10;

select count(*) as exercises_pendientes_audio
from public.exercises
where prompt is not null and audio_url is null;
