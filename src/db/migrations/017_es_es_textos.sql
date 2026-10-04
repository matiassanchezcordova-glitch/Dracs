-- DRACS — Textos de los juegos en español de España
-- Correr en: Supabase Dashboard → SQL Editor. Es idempotente: se puede correr
-- más de una vez sin efecto extra.
--
-- 008 ya pasó a "tú" el campo `prompt`. Quedaban con voseo los títulos y el
-- texto dentro de `content`, y alguna palabra que en España se dice de otra
-- forma ("tomar agua"). Si cambia el texto que se lee en voz alta, se borra su
-- audio_url para que `npm run generate-audios` lo vuelva a generar (solo esos).

-- ── 1. Imperativos con voseo → tú, en título, prompt, prompt_display y content ──
do $$
declare
  pares text[][] := array[
    ['Atrapá', 'Atrapa'], ['atrapá', 'atrapa'],
    ['Buscá', 'Busca'], ['buscá', 'busca'],
    ['Encontrá', 'Encuentra'], ['encontrá', 'encuentra'],
    ['Ordená', 'Ordena'], ['ordená', 'ordena'],
    ['Mirá', 'Mira'], ['mirá', 'mira'],
    ['Elegí', 'Elige'], ['elegí', 'elige'],
    ['Tocá', 'Toca'], ['tocá', 'toca'],
    ['Escuchá', 'Escucha'], ['escuchá', 'escucha'],
    ['Completá', 'Completa'], ['completá', 'completa'],
    ['Señalá', 'Señala'], ['señalá', 'señala'],
    ['Arrastrá', 'Arrastra'], ['arrastrá', 'arrastra'],
    ['Ponelo', 'Ponlo'], ['ponelo', 'ponlo'],
    ['Decí', 'Di'], ['decí', 'di']
  ];
  p text[];
begin
  foreach p slice 1 in array pares loop
    update public.exercises
       set audio_url = case when prompt ~ ('\m' || p[1] || '\M') then null else audio_url end,
           title          = regexp_replace(title,          '\m' || p[1] || '\M', p[2], 'g'),
           prompt         = regexp_replace(prompt,         '\m' || p[1] || '\M', p[2], 'g'),
           prompt_display = regexp_replace(prompt_display, '\m' || p[1] || '\M', p[2], 'g'),
           content        = regexp_replace(content::text,  '\m' || p[1] || '\M', p[2], 'g')::jsonb
     where title ~ ('\m' || p[1] || '\M')
        or prompt ~ ('\m' || p[1] || '\M')
        or prompt_display ~ ('\m' || p[1] || '\M')
        or content::text ~ ('\m' || p[1] || '\M');
  end loop;
end $$;

-- ── 2. Palabras que en España se dicen de otra forma ─────────────────────────
-- "tomar agua" → "beber agua"
update public.exercises
   set audio_url = case when prompt ilike '%tomar agua%' then null else audio_url end,
       title          = replace(replace(title, 'tomar agua', 'beber agua'), 'Tomar agua', 'Beber agua'),
       prompt         = replace(prompt, '¿Cómo se hace para tomar agua del vaso?', '¿Cómo se bebe agua de un vaso?'),
       prompt_display = replace(prompt_display, '¿Cómo se hace para tomar agua del vaso?', '¿Cómo se bebe agua de un vaso?'),
       content        = replace(replace(content::text, 'tomar agua', 'beber agua'), 'Tomar agua', 'Beber agua')::jsonb
 where title ilike '%tomar agua%' or prompt ilike '%tomar agua%' or content::text ilike '%tomar agua%';

-- "¿Cuál ave…?" → "¿Qué ave…?"
update public.exercises
   set audio_url = case when prompt like '%¿Cuál ave%' then null else audio_url end,
       title          = replace(title, '¿Cuál ave', '¿Qué ave'),
       prompt         = replace(prompt, '¿Cuál ave', '¿Qué ave'),
       prompt_display = replace(prompt_display, '¿Cuál ave', '¿Qué ave'),
       content        = replace(content::text, '¿Cuál ave', '¿Qué ave')::jsonb
 where title like '%¿Cuál ave%' or prompt like '%¿Cuál ave%' or content::text like '%¿Cuál ave%';

-- ── 3. Comprobación: no debería salir ninguna fila ───────────────────────────
select id, title, prompt_display
  from public.exercises
 where (title || ' ' || coalesce(prompt, '') || ' ' || content::text)
       ~ '\m(Atrapá|Buscá|Encontrá|Ordená|Mirá|Elegí|Tocá|Escuchá|Completá|Señalá|Arrastrá|Ponelo|Decí|tomar agua)\M';
