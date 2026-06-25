# Scripts locales de DRACS

## `generate-audios.ts` — Generación de audios TTS pre-grabados

Genera los audios de voz (TTS) con **ElevenLabs** y los sube a **Supabase
Storage** (bucket `exercise-audio`), guardando la URL pública en la base de
datos.

Procesa la tabla **`ui_audios`** (frases de interfaz: intros de hotspots,
feedback correcto/incorrecto) y, desde S6 Bloque 2, también la tabla
**`exercises`** (los prompts de los 55 ejercicios).

### Qué hace

1. Lee `.env.local` (variables locales, nunca se suben a Vercel).
2. Se conecta a Supabase con la **service role key** (no la anon).
3. Por cada fila de `ui_audios` sin `audio_url`:
   - Llama a ElevenLabs (`eleven_v3`, con fallback automático a
     `eleven_turbo_v2_5` si la cuenta no tiene acceso; voz Natalia).
   - Sube el MP3 a `exercise-audio/ui/{key}.mp3`.
   - Guarda la URL pública en `ui_audios.audio_url`.
4. Por cada fila de `exercises` sin `audio_url` (salvo `--skip-exercises`):
   - Genera el audio del `prompt` y lo sube a `exercise-audio/exercises/{id}.mp3`.
   - Guarda la URL pública en `exercises.audio_url`.
5. Es **idempotente**: salta las filas que ya tienen `audio_url`.

### Cómo correrlo

Desde la raíz del repo (`05 Code/dracs`):

```bash
# Ver qué generaría SIN gastar cuota de ElevenLabs ni tocar Storage
npm run generate-audios -- --dry-run

# Generar de verdad (solo lo que falte)
npm run generate-audios

# Regenerar TODO, incluso lo que ya tiene audio_url
npm run generate-audios -- --force
```

> Desde S6 Bloque 2 la generación de `exercises` está **activa por defecto**.
> Para saltarla puntualmente (regenerar solo `ui_audios`), usar `--skip-exercises`.

### Variables de entorno requeridas (`.env.local`)

| Variable                    | Para qué                                            |
| --------------------------- | --------------------------------------------------- |
| `VITE_SUPABASE_URL`         | URL del proyecto Supabase                            |
| `SUPABASE_SERVICE_ROLE_KEY` | Acceso admin a DB + Storage (¡secreto, solo local!) |
| `ELEVENLABS_API_KEY`        | API key de ElevenLabs                                |
| `ELEVENLABS_VOICE_ID`       | Voz Natalia: `jQrhxsqzG6CPKo3ll0w9`                  |

Si falta alguna, el script aborta con un mensaje claro indicando cuál.

### Pasos previos (una sola vez)

1. **SQL:** correr `src/db/migrations/005_audio_setup.sql` en el SQL Editor de
   Supabase. Debe crear la tabla `ui_audios` con 10 filas seed.
2. **Bucket:** crear el bucket `exercise-audio` en Supabase Storage:
   - Public: **SÍ**
   - File size limit: 5 MB
   - Allowed MIME types: `audio/mpeg`

### Ajuste de la voz

Los `voice_settings` (`stability: 0.5`, `style: 0.3`, etc.) están pensados para
una voz infantil-friendly. Si la voz suena muy plana, subir `style`; si suena
muy actuada, bajar `style` y subir `stability`. Están documentados en el propio
script.

### Costo estimado (10 frases iniciales)

Las 10 frases seed suman **~152 caracteres** en total:

```
¡Vamos al mar!            14
¡A jugar en la casa!      20
¡Al castillo de arena!    22
¡A buscar sorpresas!      20
¡Al sol!                   8
¡Muy bien!                10
¡Genial!                   8
¡Excelente!               11
Casi, prueba de nuevo.    22
Intenta otra vez.         17
                        ─────
                      ~152 caracteres
```

Es un consumo despreciable frente a la cuota del plan Starter (30.000
caracteres/mes): menos del **0,6 %**. Suficiente para validar la voz en
contexto antes de generar las ~80 frases finales.
