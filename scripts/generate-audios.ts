/**
 * generate-audios.ts — DRACS S6 Bloque 1
 * ------------------------------------------------------------
 * Genera audios pre-grabados (TTS) con ElevenLabs y los sube a
 * Supabase Storage (bucket `exercise-audio`), guardando la URL
 * pública en la base de datos.
 *
 * Uso:
 *   npm run generate-audios                 # genera lo que falte
 *   npm run generate-audios -- --dry-run    # muestra qué haría, sin gastar cuota
 *   npm run generate-audios -- --force      # regenera TODO, incluso lo ya generado
 *
 * Es idempotente: por defecto salta las filas que ya tienen `audio_url`.
 *
 * IMPORTANTE: este script es SOLO para uso local/admin. Usa la
 * SUPABASE_SERVICE_ROLE_KEY, que NUNCA debe subirse a Vercel ni al
 * frontend. Lee las variables desde `.env.local` (gitignored).
 * ------------------------------------------------------------
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Cargar variables desde .env.local (no .env).
config({ path: '.env.local' })

// ── Flags de línea de comandos ──────────────────────────────
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const FORCE = args.includes('--force')
// S6 Bloque 2: el procesamiento de `exercises` ya está ACTIVO por defecto
// (se generan los audios de los 55 prompts). Para saltarlo puntualmente
// (p. ej. regenerar solo ui_audios), pasar --skip-exercises.
const SKIP_EXERCISES = args.includes('--skip-exercises')

// ── Constantes de configuración ─────────────────────────────
const BUCKET = 'exercise-audio'
// Modelo primario: eleven_v3 entona mucho mejor las frases cortas aisladas
// e interpreta los tags emocionales ([excited], [cheerful], …) del texto.
const PRIMARY_MODEL = 'eleven_v3'
// Fallback automático si la cuenta no tiene acceso a eleven_v3 (la API
// responde 400). eleven_turbo_v2_5 sí está disponible en cuentas estándar.
const FALLBACK_MODEL = 'eleven_turbo_v2_5'
const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1/text-to-speech'

// Modelo activo de la corrida. Empieza en el primario y, si la API indica
// que no está disponible para esta cuenta, baja a FALLBACK_MODEL para el
// resto de la corrida (el aviso se loggea una sola vez).
let activeModel: string = PRIMARY_MODEL
let fallbackAnnounced = false

/**
 * voice_settings calibrados para una voz infantil-friendly con
 * exclamaciones y pausas.
 *  - stability 0.30 → más bajo = más variación emocional (impulso en "¡!").
 *  - style 0.65     → más alto = transmite la emoción del texto.
 * La combinación stability=0.30 + style=0.65 está calibrada para que las
 * exclamaciones tengan energía y las pausas (ej. "Casi...") se respeten.
 * Si en el futuro suena demasiado dramática o inestable, subir
 * `stability` a 0.40–0.50 y bajar `style` a 0.50.
 *
 * Estos cuatro campos (stability, similarity_boost, style, use_speaker_boost)
 * son los parámetros estándar de voice_settings y son válidos tanto en
 * eleven_v3 como en el fallback eleven_turbo_v2_5, así que no cambian al
 * cambiar de modelo. Si en una corrida real la API rechazara alguno con un
 * 400 que no sea por el modelo, el error se reporta tal cual (ver synthesize).
 */
const VOICE_SETTINGS = {
  stability: 0.30, // antes 0.5. Más bajo = más variación emocional.
  similarity_boost: 0.75, // se mantiene.
  style: 0.65, // antes 0.3. Más alto = transmite emoción del texto.
  use_speaker_boost: true,
}

// ── Tipos mínimos de las filas que procesamos ───────────────
interface UiAudioRow {
  key: string
  text: string
  audio_url: string | null
}

interface ExerciseRow {
  id: string
  prompt: string | null
  audio_url: string | null
}

// Esquema mínimo solo para tipar el cliente en este script (suficiente para
// que `.update({ audio_url })` y los queries queden bien tipados). El esquema
// completo de la app vive en src/lib/database.types.ts; acá no lo importamos
// para no arrastrar el resto de las tablas ni la dependencia del frontend.
type Database = {
  public: {
    Tables: {
      ui_audios: {
        Row: {
          key: string
          text: string
          category: string
          audio_url: string | null
          created_at: string
        }
        Insert: {
          key: string
          text: string
          category: string
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          key?: string
          text?: string
          category?: string
          audio_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: { id: string; prompt: string | null; audio_url: string | null }
        Insert: { id?: string; prompt?: string | null; audio_url?: string | null }
        Update: { id?: string; prompt?: string | null; audio_url?: string | null }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type DracsClient = SupabaseClient<Database>

// ── Validación de variables de entorno ──────────────────────
function requireEnv(): {
  supabaseUrl: string
  serviceRoleKey: string
  elevenLabsApiKey: string
  voiceId: string
} {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID

  const missing: string[] = []
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL')
  if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!elevenLabsApiKey) missing.push('ELEVENLABS_API_KEY')
  if (!voiceId) missing.push('ELEVENLABS_VOICE_ID')

  if (missing.length > 0) {
    console.error(
      `✗ Faltan variables de entorno en .env.local: ${missing.join(', ')}`
    )
    console.error('  Copiá .env.example a .env.local y completá los valores.')
    process.exit(1)
  }

  // En este punto TypeScript ya sabe que no son undefined gracias al exit.
  return {
    supabaseUrl: supabaseUrl!,
    serviceRoleKey: serviceRoleKey!,
    elevenLabsApiKey: elevenLabsApiKey!,
    voiceId: voiceId!,
  }
}

// Error enriquecido con el status HTTP, para distinguir el 400
// "modelo no disponible" de un 400 por un parámetro inválido.
interface ElevenLabsError extends Error {
  status?: number
}

// ── ElevenLabs: generar un MP3 desde texto ──────────────────
async function generateAudio(
  text: string,
  apiKey: string,
  voiceId: string,
  model: string
): Promise<Buffer> {
  const res = await fetch(`${ELEVENLABS_BASE}/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: VOICE_SETTINGS,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    const err: ElevenLabsError = new Error(
      `ElevenLabs ${res.status} ${res.statusText}: ${detail}`
    )
    err.status = res.status
    throw err
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// ¿El error es un 400 porque la cuenta no tiene acceso al modelo pedido?
// (distinto de un 400 por un parámetro inválido de voice_settings).
function isModelUnavailable(err: ElevenLabsError): boolean {
  if (err.status !== 400) return false
  const m = err.message.toLowerCase()
  return (
    m.includes('model') &&
    (m.includes('not') ||
      m.includes('invalid') ||
      m.includes('avail') ||
      m.includes('access') ||
      m.includes('permission') ||
      m.includes('eleven_v3'))
  )
}

// Genera el audio con el modelo activo. Si el primario (eleven_v3) no está
// disponible para la cuenta, baja a eleven_turbo_v2_5 una sola vez y sigue
// el resto de la corrida con el fallback, sin intervención manual.
async function synthesize(
  text: string,
  apiKey: string,
  voiceId: string
): Promise<Buffer> {
  try {
    return await generateAudio(text, apiKey, voiceId, activeModel)
  } catch (err) {
    const e = err as ElevenLabsError
    if (activeModel === PRIMARY_MODEL && isModelUnavailable(e)) {
      if (!fallbackAnnounced) {
        console.warn(
          '⚠️ eleven_v3 no disponible, usando eleven_turbo_v2_5 como fallback'
        )
        fallbackAnnounced = true
      }
      activeModel = FALLBACK_MODEL
      return await generateAudio(text, apiKey, voiceId, activeModel)
    }
    throw err
  }
}

// ── Subir MP3 a Storage y devolver la URL pública ───────────
async function uploadAudio(
  supabase: DracsClient,
  path: string,
  audio: Buffer
): Promise<string> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, audio, {
    contentType: 'audio/mpeg',
    upsert: true,
  })
  if (error) throw new Error(`Storage upload "${path}": ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// ── Verificar que el bucket exista ──────────────────────────
async function ensureBucket(supabase: DracsClient): Promise<void> {
  const { data, error } = await supabase.storage.getBucket(BUCKET)
  if (error || !data) {
    console.error(
      `✗ Crear primero el bucket "${BUCKET}" en Supabase Storage ` +
        '(público, MIME audio/mpeg).'
    )
    process.exit(1)
  }
}

// Acumuladores globales de la corrida.
let totalGenerated = 0
let totalSkipped = 0
let totalChars = 0

// ── Procesar la tabla ui_audios ─────────────────────────────
async function processUiAudios(
  supabase: DracsClient,
  apiKey: string,
  voiceId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('ui_audios')
    .select('key, text, audio_url')
    .order('key')

  if (error) {
    console.error(`✗ No se pudo leer ui_audios: ${error.message}`)
    process.exit(1)
  }

  const rows = (data ?? []) as UiAudioRow[]
  const pending = FORCE ? rows : rows.filter((r) => !r.audio_url)

  console.log(
    `\nui_audios: ${rows.length} filas totales, ${pending.length} a procesar` +
      `${FORCE ? ' (--force)' : ''}.`
  )

  for (const row of rows) {
    if (!FORCE && row.audio_url) {
      console.log(`→ skip ${row.key} (ya tiene audio_url)`)
      totalSkipped++
      continue
    }

    const path = `ui/${row.key}.mp3`

    if (DRY_RUN) {
      console.log(`[dry-run] generaría ${path} ← "${row.text}" (${row.text.length} chars)`)
      totalGenerated++
      totalChars += row.text.length
      continue
    }

    try {
      const audio = await synthesize(row.text, apiKey, voiceId)
      const publicUrl = await uploadAudio(supabase, path, audio)
      const { error: updateError } = await supabase
        .from('ui_audios')
        .update({ audio_url: publicUrl })
        .eq('key', row.key)
      if (updateError) throw new Error(`update ui_audios: ${updateError.message}`)

      console.log(`✓ generado ${path} (${row.text.length} chars usados)`)
      totalGenerated++
      totalChars += row.text.length
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`✗ falló ${row.key}: ${msg}`)
      // No abortar: seguir con la siguiente fila.
    }
  }
}

// ── Procesar la tabla exercises (S6 BLOQUE 2 — ACTIVO) ──────
// Genera el audio de cada prompt de ejercicio. Corre por defecto; se puede
// saltar con --skip-exercises. El texto que va al TTS es `prompt`, que tras
// la migración 008 ya incluye el tag emocional ('[friendly] …') y el voseo
// normalizado. Idempotente: sin --force salta los que ya tienen audio_url.
async function processExercises(
  supabase: DracsClient,
  apiKey: string,
  voiceId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, prompt, audio_url')

  if (error) {
    console.error(`✗ No se pudo leer exercises: ${error.message}`)
    process.exit(1)
  }

  const rows = (data ?? []) as ExerciseRow[]

  console.log(`\nexercises: ${rows.length} filas totales.`)

  for (const row of rows) {
    if (!FORCE && row.audio_url) {
      console.log(`→ skip exercise ${row.id} (ya tiene audio_url)`)
      totalSkipped++
      continue
    }
    const text = row.prompt?.trim()
    if (!text) {
      console.log(`→ skip exercise ${row.id} (sin texto)`)
      totalSkipped++
      continue
    }

    const path = `exercises/${row.id}.mp3`

    if (DRY_RUN) {
      console.log(`[dry-run] generaría ${path} ← "${text}" (${text.length} chars)`)
      totalGenerated++
      totalChars += text.length
      continue
    }

    try {
      const audio = await synthesize(text, apiKey, voiceId)
      const publicUrl = await uploadAudio(supabase, path, audio)
      const { error: updateError } = await supabase
        .from('exercises')
        .update({ audio_url: publicUrl })
        .eq('id', row.id)
      if (updateError) throw new Error(`update exercises: ${updateError.message}`)

      console.log(`✓ generado ${path} (${text.length} chars usados)`)
      totalGenerated++
      totalChars += text.length
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`✗ falló exercise ${row.id}: ${msg}`)
    }
  }
}

// ── Main ────────────────────────────────────────────────────
async function main(): Promise<void> {
  const env = requireEnv()

  console.log('DRACS — generador de audios (ElevenLabs → Supabase Storage)')
  if (DRY_RUN) console.log('Modo: DRY-RUN (no se llama a ElevenLabs ni a Storage)')
  if (FORCE) console.log('Modo: FORCE (regenera audios existentes)')
  console.log(`Modelo TTS primario: ${PRIMARY_MODEL} (fallback: ${FALLBACK_MODEL})`)

  const supabase = createClient<Database>(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false },
  })

  // El bucket solo hace falta si vamos a subir archivos de verdad.
  if (!DRY_RUN) await ensureBucket(supabase)

  await processUiAudios(supabase, env.elevenLabsApiKey, env.voiceId)

  if (!SKIP_EXERCISES) {
    await processExercises(supabase, env.elevenLabsApiKey, env.voiceId)
  }

  console.log(
    `\nResumen: ${totalGenerated} generado(s), ${totalSkipped} saltado(s), ` +
      `${totalChars} caracteres ${DRY_RUN ? 'estimados' : 'consumidos'}.`
  )
}

main().catch((err) => {
  console.error('✗ Error inesperado:', err)
  process.exit(1)
})
