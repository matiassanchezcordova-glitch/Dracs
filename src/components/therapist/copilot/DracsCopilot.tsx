// Copiloto clínico del terapeuta — widget flotante, mockup 100% front-end.
// Sin LLM, sin red, sin almacenamiento: estado local y un guion escrito a mano
// (copilotData.ts). Es el equivalente de Dragui para el lado profesional.
//
// Tres estados: minimizado (el botón flotante), panel de esquina y pantalla
// completa. Cerrar nunca borra el hilo: minimiza, y al volver está donde estaba.
//
// ROADMAP (no ahora): la versión real va anclada a los datos reales de sus
// pacientes, con recuperación sobre las mismas sesiones que ya lee el escritorio
// (las partidas, las áreas jugadas, lo que se atascó). Dos límites que no se
// negocian:
//   1. Responde solo desde datos reales. Si el dato no está, lo dice. No
//      rellena huecos ni infiere lo que no vio.
//   2. Nunca emite juicio clínico. Muestra lo que pasó y redacta borradores;
//      la valoración, el diagnóstico y la firma son del terapeuta.
// Para producción, los datos del niño van seudonimizados y minimizados antes de
// tocar ningún modelo, se procesan en la UE y no se usan para entrenar.
// Hoy esto es un mockup con estado local.
//
// Iconografía: un solo set, Phosphor en variante de LÍNEA (weight="regular").
// Ni "fill", ni emojis, ni chevrons. El color entra por `color`/currentColor.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  Lock, PaperPlaneTilt, X, FileText, CheckCircle, Lightbulb, ArrowsOut, ArrowsIn,
  Paperclip, Microphone, Waveform, UserCircle, ChartBar, UsersThree, CalendarBlank,
  type Icon,
} from '@phosphor-icons/react'
import { DEMO_CHILD_NAME } from '../../../lib/demo'
import { DT } from '../desk/deskTokens'
import { ANSWERS, FALLBACK, GREETING, normalize, route, type AnswerGroup, type CopilotAnswer } from './copilotData'

const ONLINE = '#10B981'          // mismo verde de "en línea" que usa la familia
const FAVICON = '/brand/dracs-favicon-cut.png'
const INERT_FEEDBACK = 'Llega muy pronto'

// Radios del sistema: tarjetas 20, panel 26, chips e inputs 13.
const R_CARD = '20px'
const R_PANEL = '26px'
const R_CHIP = '13px'

// Sombras en capas (contacto corta + difusa larga). Nada duro, nada neumórfico.
const SHADOW_LAUNCHER = '0 1px 2px rgba(51,48,42,0.06), 0 10px 28px rgba(51,48,42,0.13)'
const SHADOW_PANEL = '0 2px 6px rgba(51,48,42,0.06), 0 24px 60px rgba(51,48,42,0.18)'

// Punto de color por línea del briefing: jugó / se atascó / no tocó.
const BRIEF_TONES = [DT.azul, DT.mostaza, DT.topo]

// Punto de color de un grupo de repaso, el mismo que usa el escritorio.
const GROUP_TONE: Record<AnswerGroup['tone'], string> = {
  played: DT.azul,
  idle: DT.topo,
}

// Icono de cada sugerencia en pantalla completa, donde hay sitio para verlas
// como tarjetas y no como pastillas.
const CHIP_ICON: Record<string, Icon> = {
  quien: UsersThree,
  area: ChartBar,
  redacta: FileText,
  prep: CalendarBlank,
}

// El aviso legal vive UNA vez en el pie del escritorio. Aquí se repite solo en
// pantalla completa, porque la capa tapa ese pie y el terapeuta ya no lo ve.
const AVISO_LEGAL = 'Dracs no es un dispositivo médico. No valora ni diagnostica: el logopeda revisa y firma todo.'

interface Msg {
  id: number
  role: 'assistant' | 'user'
  full: string
  shown: string
  done: boolean
  answer?: CopilotAnswer
}

// Animaciones y estados de foco locales del widget. Van aquí (y no en
// index.css) para que el copiloto sea un archivo autocontenido; todas se apagan
// con reduced-motion.
const CSS = `
@keyframes dcDot   { 0%, 60%, 100% { opacity: 0.25; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
@keyframes dcPulse { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
@keyframes dcCaret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes dcIn    { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes dcHalo  { 0%, 100% { opacity: 0.75; } 50% { opacity: 1; } }
@keyframes dcFade  { from { opacity: 0; } to { opacity: 1; } }
@keyframes dcRise  { from { opacity: 0; transform: translateY(16px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
.dc-dot   { animation: dcDot 1.1s ease-in-out infinite; }
.dc-pulse { animation: dcPulse 2s ease-out infinite; }
.dc-caret { animation: dcCaret 1s step-end infinite; }
.dc-in    { animation: dcIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) both; }
.dc-halo  { animation: dcHalo 4.5s ease-in-out infinite; }
.dc-fade  { animation: dcFade 0.20s ease-out both; }
.dc-rise  { animation: dcRise 0.26s cubic-bezier(0.22, 1, 0.36, 1) both; }
.dc-bar   { transition: width 0.75s cubic-bezier(0.22, 1, 0.36, 1); }
.dc-input { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
.dc-sug   { transition: background 0.14s ease, border-color 0.14s ease; }
.dc-sug:hover:not(:disabled) { background: ${DT.white}; border-color: ${DT.line}; }
.dc-pill  { transition: background 0.14s ease; }
.dc-pill:hover:not(:disabled) { background: ${DT.azulTint}; }
.dc-strip { scrollbar-width: none; -ms-overflow-style: none; }
.dc-strip::-webkit-scrollbar { display: none; }
.dc-input:focus, .dc-input:focus-within { border-color: ${DT.azul}; box-shadow: 0 0 0 3px rgba(91,136,150,0.16); }
.dc-btn:focus-visible, .dc-input:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .dc-dot, .dc-pulse, .dc-caret, .dc-in, .dc-halo, .dc-fade, .dc-rise { animation: none !important; }
  .dc-bar, .dc-input, .dc-sug, .dc-pill { transition: none !important; }
}
`

function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const mq = window.matchMedia(query)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

// ── Símbolo de Dracs (favicon recortado, fondo transparente) ─────────────────
function DracsMark({ size, radius }: { size: number; radius: number }) {
  return (
    <img
      src={FAVICON}
      alt=""
      aria-hidden
      style={{
        width: size, height: size, borderRadius: radius,
        objectFit: 'contain', flexShrink: 0, display: 'block',
      }}
    />
  )
}

// ── Cuerpo del mensaje ───────────────────────────────────────────────────────
// Las respuestas normales son un párrafo. El briefing de sesión llega como
// líneas numeradas: esas se dibujan como filas con hairline y un punto de color
// en una columna de ancho fijo, para que queden en eje mientras se escriben.
const BRIEF_LINE = /^(\d+)[.)]?\s*(.*)$/

function MessageBody({ text }: { text: string }) {
  const lines = text.split('\n')
  const blocks: { kind: 'p' | 'brief'; items: string[] }[] = []

  for (const line of lines) {
    const match = BRIEF_LINE.exec(line)
    if (match) {
      const last = blocks[blocks.length - 1]
      if (last && last.kind === 'brief') last.items.push(match[2])
      else blocks.push({ kind: 'brief', items: [match[2]] })
    } else if (line.trim() !== '') {
      blocks.push({ kind: 'p', items: [line] })
    }
  }

  return (
    <>
      {blocks.map((block, bi) => block.kind === 'p' ? (
        <p key={bi} style={{
          margin: bi === 0 ? 0 : '10px 0 0', whiteSpace: 'pre-wrap',
          fontSize: '14.5px', fontWeight: 500, lineHeight: 1.55,
          color: DT.ink, fontFamily: DT.body,
        }}>
          {block.items[0]}
        </p>
      ) : (
        <div key={bi} style={{
          position: 'relative', margin: '12px 0 2px', paddingLeft: '14px',
        }}>
          {/* Filo izquierdo con degradado azul */}
          <span aria-hidden style={{
            position: 'absolute', left: 0, top: '2px', bottom: '2px', width: '3px',
            borderRadius: '999px',
            background: `linear-gradient(180deg, ${DT.azul} 0%, ${DT.azulTint} 100%)`,
          }} />
          {block.items.map((item, ii) => (
            <div key={ii} style={{
              display: 'flex', alignItems: 'flex-start', gap: '2px',
              padding: ii === 0 ? '0 0 9px' : '9px 0',
              borderTop: ii === 0 ? 'none' : `1px solid ${DT.line}`,
            }}>
              {/* Columna de ancho fijo: los puntos quedan en eje */}
              <span style={{
                width: '18px', flexShrink: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'flex-start', height: '22px',
              }}>
                <span aria-hidden style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: BRIEF_TONES[ii % BRIEF_TONES.length],
                }} />
              </span>
              <span style={{
                flex: 1, fontSize: '14px', fontWeight: 600, lineHeight: 1.55,
                color: DT.ink, fontFamily: DT.body,
              }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

// ── Barras de distribución: no es una nota, es cuánto jugó de cada cosa ───────
function DistBars({ dist }: { dist: [string, number][] }) {
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setGrown(true), 40)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {dist.map(([label, pct]) => (
        <div key={label}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '5px',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>
              {label}
            </span>
            <span style={{
              fontSize: '13px', fontWeight: 700, color: DT.muted, fontFamily: DT.body,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: '8px', borderRadius: '999px', background: DT.arena, overflow: 'hidden' }}>
            <div
              className="dc-bar"
              style={{
                width: grown ? `${pct}%` : '0%', height: '100%', borderRadius: '999px',
                background: `linear-gradient(90deg, ${DT.azul} 0%, ${DT.azulInk} 100%)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tarjeta de borrador: el terapeuta lo revisa y lo firma ───────────────────
function DraftCard({ text }: { text: string }) {
  const [useDone, setUseDone] = useState(false)
  const [editDone, setEditDone] = useState(false)
  return (
    <div style={{
      position: 'relative', marginTop: '13px', padding: '14px 15px 15px 17px',
      borderRadius: R_CARD, background: DT.cream,
      border: `1px solid ${DT.line}`, boxShadow: DT.shadowSoft, overflow: 'hidden',
    }}>
      {/* Filo mostaza a la izquierda */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: `linear-gradient(180deg, ${DT.mostaza} 0%, rgba(199,162,79,0.35) 100%)`,
      }} />
      <p style={{
        margin: '0 0 9px', display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em',
        textTransform: 'uppercase', color: DT.mostaza, fontFamily: DT.body,
      }}>
        <FileText size={14} weight="regular" /> Borrador · para la familia
      </p>
      <p style={{
        margin: 0, fontSize: '14px', fontWeight: 500, lineHeight: 1.6,
        color: DT.ink, fontFamily: DT.body, whiteSpace: 'pre-wrap',
      }}>
        {text}
      </p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
        <button
          type="button"
          className="dc-btn"
          onClick={() => setUseDone(true)}
          style={{
            height: '38px', padding: '0 15px', borderRadius: R_CHIP, border: 'none',
            background: DT.yellow, color: DT.ink, fontSize: '13.5px', fontWeight: 700,
            fontFamily: DT.display, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '7px',
          }}
        >
          {useDone && <CheckCircle size={15} weight="regular" />}
          {useDone ? INERT_FEEDBACK : 'Usar borrador'}
        </button>
        <button
          type="button"
          className="dc-btn"
          onClick={() => setEditDone(true)}
          style={{
            height: '38px', padding: '0 15px', borderRadius: R_CHIP,
            border: `1px solid ${DT.line}`, background: DT.white, color: DT.ink,
            fontSize: '13.5px', fontWeight: 700, fontFamily: DT.display, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '7px',
          }}
        >
          {editDone && <CheckCircle size={15} weight="regular" />}
          {editDone ? INERT_FEEDBACK : 'Editar'}
        </button>
      </div>
    </div>
  )
}

// ── Grupos de un repaso: etiqueta con punto de color y los nombres ───────────
// Dos filas escaneables en vez de una frase corrida: el terapeuta busca nombres,
// no lee prosa.
function StatusGroups({ groups }: { groups: AnswerGroup[] }) {
  return (
    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
      {groups.map(g => (
        <div key={g.label} style={{
          display: 'flex', alignItems: 'baseline', gap: '9px', flexWrap: 'wrap',
          padding: '9px 11px', borderRadius: R_CHIP,
          background: DT.white, border: `1px solid ${DT.line}`,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px', flexShrink: 0,
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: DT.muted, fontFamily: DT.body,
          }}>
            <span aria-hidden style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: GROUP_TONE[g.tone],
            }} />
            {g.label}
          </span>
          <span style={{
            flex: 1, minWidth: '120px', fontSize: '13.5px', fontWeight: 600,
            lineHeight: 1.5, color: DT.ink, fontFamily: DT.body,
          }}>
            {g.names.join(' · ')}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Pie de procedencia: de cuántas partidas sale el dato ─────────────────────
// Sin icono y sin pastilla: es una nota al pie, no otro elemento que mirar.
// Solo aparece donde saberlo cambia cómo se lee la respuesta.
function SourceLine({ src }: { src: string }) {
  return (
    <p style={{
      margin: '11px 0 0', fontSize: '11.5px', fontWeight: 600, lineHeight: 1.45,
      color: DT.muted, fontFamily: DT.body,
    }}>
      {src}
    </p>
  )
}

function AssistantRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
      <DracsMark size={26} radius={8} />
      <div style={{ maxWidth: 'calc(100% - 42px)' }}>{children}</div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <AssistantRow>
      <div style={{
        padding: '13px 16px', borderRadius: '18px 18px 18px 6px',
        background: DT.white, border: `1px solid ${DT.line}`, boxShadow: DT.shadowSoft,
        display: 'flex', gap: '5px', alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="dc-dot"
            style={{
              width: '7px', height: '7px', borderRadius: '50%', background: DT.topo,
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </AssistantRow>
  )
}

function Bubble({ msg }: { msg: Msg }) {
  // El usuario no lleva avatar: el símbolo es de Dracs, no del terapeuta.
  if (msg.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '86%', padding: '11px 14px', borderRadius: '18px 18px 6px 18px',
          background: DT.yellow, color: DT.ink, fontSize: '14.5px', fontWeight: 600,
          lineHeight: 1.55, fontFamily: DT.body, whiteSpace: 'pre-wrap',
        }}>
          {msg.shown}
        </div>
      </div>
    )
  }

  return (
    <AssistantRow>
      <div style={{
        padding: '12px 15px', borderRadius: '18px 18px 18px 6px',
        background: DT.white, border: `1px solid ${DT.line}`, boxShadow: DT.shadowSoft,
        color: DT.ink, fontFamily: DT.body,
      }}>
        <MessageBody text={msg.shown} />
        {!msg.done && (
          <span
            className="dc-caret"
            aria-hidden
            style={{
              display: 'inline-block', width: '2px', height: '15px', marginLeft: '2px',
              verticalAlign: '-2px', background: DT.azul,
            }}
          />
        )}
        {msg.done && msg.answer?.groups && <StatusGroups groups={msg.answer.groups} />}
        {msg.done && msg.answer?.dist && <DistBars dist={msg.answer.dist} />}
        {msg.done && msg.answer?.draft && <DraftCard text={msg.answer.draft} />}
        {msg.done && msg.answer?.src && <SourceLine src={msg.answer.src} />}
      </div>
    </AssistantRow>
  )
}

// ── Acción de vista previa: dice qué es, y que todavía no está ───────────────
// Inerte de verdad: al pulsar no pasa nada. Solo al pasar el cursor o al
// enfocar con teclado sale el nombre de la función y un candado pequeño. Antes
// el clic dejaba un cartel, y pulsando dos botones seguidos se pisaban.
function PreviewAction({ Icon: I, label, chip }: { Icon: Icon; label: string; chip?: string }) {
  const [near, setNear] = useState(false)

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {near && (
        <span aria-hidden style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, zIndex: 3,
          padding: '4px 9px', borderRadius: '8px',
          background: DT.ink, color: DT.cream,
          fontSize: '11px', fontWeight: 700, fontFamily: DT.body,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(51,48,42,0.16)',
        }}>
          {label}
        </span>
      )}

      {/* Candado: aparece al acercarse, para que se vea que aún no está activo. */}
      {near && (
        <span aria-hidden style={{
          position: 'absolute', top: '-5px', right: '-5px', zIndex: 2,
          width: '17px', height: '17px', borderRadius: '50%',
          background: DT.white, border: `1px solid ${DT.line}`, color: DT.muted,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={10} weight="regular" />
        </span>
      )}

      <button
        type="button"
        className="dc-btn"
        aria-disabled="true"
        aria-label={label}
        onClick={e => e.preventDefault()}
        onMouseEnter={() => setNear(true)}
        onMouseLeave={() => setNear(false)}
        onFocus={() => setNear(true)}
        onBlur={() => setNear(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          height: '34px', padding: chip ? '0 12px 0 9px' : '0 9px',
          borderRadius: R_CHIP, border: `1px solid ${DT.line}`,
          background: DT.white, color: DT.muted, cursor: 'default',
          fontSize: '12.5px', fontWeight: 700, fontFamily: DT.body,
        }}
      >
        <I size={17} weight="regular" />
        {chip}
      </button>
    </span>
  )
}

// Minimizado, panel de esquina, pantalla completa.
type View = 'min' | 'panel' | 'full'

export default function DracsCopilot() {
  const [view, setView] = useState<View>('min')
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, role: 'assistant', full: GREETING, shown: GREETING, done: true },
  ])
  const [typing, setTyping] = useState(false)
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')

  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const narrow = useMediaQuery('(max-width: 520px)')

  const open = view !== 'min'
  const isFull = view === 'full'

  const nextId = useRef(1)
  const timers = useRef<number[]>([])
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const fullRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  // Foco: al abrir va al input, al minimizar vuelve al lanzador (nunca al
  // montar). Al pasar de panel a pantalla completa el input es otro nodo, así
  // que se vuelve a enfocar y el teclado no se queda huérfano.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      wasOpen.current = true
    } else if (wasOpen.current) {
      launcherRef.current?.focus()
    }
  }, [open, view])

  // Escape: en pantalla completa contrae al panel; en el panel, minimiza.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setView(v => v === 'full' ? 'panel' : 'min')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Foco atrapado dentro de la capa: en pantalla completa el resto de la página
  // está tapado, así que tabular hasta ella sería tabular a ciegas.
  useEffect(() => {
    if (!isFull) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const root = fullRef.current
      if (!root) return
      const items = Array.from(
        root.querySelectorAll<HTMLElement>('button, textarea, input, [href], [tabindex]:not([tabindex="-1"])'),
      ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isFull])

  // Autoscroll mientras llega texto.
  useEffect(() => {
    const el = chatRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing, view])

  // Entrega una respuesta CONCRETA para un texto de usuario dado. `send` la usa
  // con lo que devuelve route(); el enganche de "Tu día" la usa directamente.
  const deliver = useCallback((raw: string, answer: CopilotAnswer) => {
    const text = raw.trim()
    if (!text || busy) return

    setMessages(prev => [
      ...prev,
      { id: nextId.current++, role: 'user', full: text, shown: text, done: true },
    ])
    setInput('')
    setBusy(true)
    setTyping(true)

    timers.current.push(window.setTimeout(() => {
      setTyping(false)
      const id = nextId.current++

      if (reduced) {
        setMessages(prev => [
          ...prev,
          { id, role: 'assistant', full: answer.text, shown: answer.text, done: true, answer },
        ])
        setBusy(false)
        return
      }

      setMessages(prev => [
        ...prev,
        { id, role: 'assistant', full: answer.text, shown: '', done: false, answer },
      ])

      // Revelado palabra a palabra: el ritmo irregular es lo que lo hace creíble.
      const words = answer.text.split(' ')
      let i = 0
      const step = () => {
        i += 1
        const shown = words.slice(0, i).join(' ')
        setMessages(prev => prev.map(m => m.id === id ? { ...m, shown } : m))
        if (i < words.length) {
          timers.current.push(window.setTimeout(step, 24 + Math.random() * 32))
        } else {
          setMessages(prev => prev.map(m => m.id === id ? { ...m, done: true } : m))
          setBusy(false)
        }
      }
      timers.current.push(window.setTimeout(step, 30))
    }, 650))
  }, [busy, reduced])

  const send = useCallback((raw: string) => {
    deliver(raw, route(raw))
  }, [deliver])

  // Enganche con "Tu día": la banda del escritorio pide preparar una sesión.
  // Si el guion de la vista previa no cubre a ese niño, se responde el límite
  // honesto en vez de contar lo de otro paciente.
  useEffect(() => {
    const onAsk = (e: Event) => {
      const detail = (e as CustomEvent).detail as { intent?: string; childName?: string } | null
      if (!detail || detail.intent !== 'prep') return
      const child = (detail.childName ?? '').trim()
      const prep = ANSWERS.find(a => a.id === 'prep')
      if (!prep) return
      const covered = child !== '' && normalize(prep.text).includes(normalize(child))
      setView(v => v === 'min' ? 'panel' : v)
      deliver(
        child ? `Prepárame la sesión de ${child}` : prep.chip,
        covered ? prep : FALLBACK,
      )
    }
    window.addEventListener('dracs-copilot-open', onAsk)
    return () => window.removeEventListener('dracs-copilot-open', onAsk)
  }, [deliver])

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, isFull ? 168 : 100)}px`
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
      if (inputRef.current) inputRef.current.style.height = 'auto'
    }
  }

  // Estado vacío: solo el saludo, nada enviado todavía.
  const isEmptyThread = messages.length <= 1 && !typing
  const chips = ANSWERS
  const canSend = input.trim().length > 0 && !busy

  const anchor: React.CSSProperties = {
    position: 'fixed', right: '22px', bottom: '22px', zIndex: 9000,
  }

  // ── Piezas compartidas entre el panel y la pantalla completa ──────────────
  // Son funciones, no componentes: el chat no se desmonta al cambiar de vista y
  // la conversación sigue exactamente donde estaba.

  // Control de cabecera. Con `text` se ve la palabra al lado del icono (en
  // pantalla completa sobra el sitio); sin ella, solo el icono con su etiqueta.
  function headerButton(label: string, onClick: () => void, children: React.ReactNode, text?: string) {
    return (
      <button
        type="button"
        className="dc-btn"
        onClick={onClick}
        aria-label={label}
        style={{
          height: '34px', width: text ? undefined : '34px',
          padding: text ? '0 12px 0 9px' : 0,
          gap: text ? '6px' : 0,
          borderRadius: R_CHIP, flexShrink: 0,
          border: 'none', background: 'transparent', color: DT.muted, cursor: 'pointer',
          fontSize: '12.5px', fontWeight: 700, fontFamily: DT.body,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = DT.arena }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        {children}
        {text}
      </button>
    )
  }

  function renderHeader() {
    return (
      <div style={{
        flexShrink: 0,
        background: `linear-gradient(180deg, ${DT.azulTint} 0%, ${DT.white} 100%)`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '11px',
          padding: isFull ? '14px 18px' : '13px 14px',
        }}>
          <DracsMark size={40} radius={11} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: DT.azulInk, fontFamily: DT.display }}>
              Dracs
            </p>
            <p style={{
              margin: '1px 0 0', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12.5px', fontWeight: 600, color: DT.muted, fontFamily: DT.body,
            }}>
              <span aria-hidden style={{
                width: '7px', height: '7px', borderRadius: '50%', background: ONLINE, flexShrink: 0,
              }} />
              Copiloto clínico
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0,
            padding: '5px 10px', borderRadius: '999px',
            background: DT.white, border: `1px solid ${DT.line}`,
            color: DT.muted, fontSize: '11px', fontWeight: 800, fontFamily: DT.body,
            letterSpacing: '0.02em',
          }}>
            <Lock size={13} weight="regular" /> Vista previa
          </span>
          {isFull
            ? headerButton('Contraer al panel de esquina', () => setView('panel'), <ArrowsIn size={18} weight="regular" />, 'Contraer')
            : headerButton('Expandir a pantalla completa', () => setView('full'), <ArrowsOut size={18} weight="regular" />)}
          {/* Cerrar minimiza: el hilo se conserva y vuelve donde estaba. */}
          {headerButton('Minimizar el copiloto', () => setView('min'), <X size={18} weight="regular" />)}
        </div>
        <div aria-hidden style={{
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${DT.azulTintLine} 18%, ${DT.azulTintLine} 82%, transparent 100%)`,
        }} />
      </div>
    )
  }

  function renderChat() {
    return (
      <div
        ref={chatRef}
        aria-live="polite"
        style={{
          flex: 1, minHeight: 0, overflowY: 'auto', background: DT.cream,
          padding: isFull ? '22px 24px' : '16px',
          display: 'flex', flexDirection: 'column', gap: '13px',
        }}
      >
        {messages.map(m => <Bubble key={m.id} msg={m} />)}
        {typing && <TypingIndicator />}
      </div>
    )
  }

  // Sugerencias. Nunca se pierden y nunca quedan colgando dentro del hilo:
  //   - hilo vacío: columna de filas finas bajo el rótulo "Dracs puede";
  //   - con conversación: una tira fija justo encima de la casilla de texto.
  // Las cuatro están siempre, se pueden volver a pedir.
  function renderSuggestions() {
    if (chips.length === 0) return null

    // Ancho real disponible: el panel de esquina son 440px, así que ahí la tira
    // también va en scroll horizontal. Envolver comería media conversación.
    const scrollStrip = narrow || !isFull

    if (isEmptyThread) {
      return (
        <div style={{
          flexShrink: 0, background: DT.cream,
          padding: isFull ? '0 24px 16px' : '0 14px 12px',
        }}>
          <p style={{
            margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: DT.faint, fontFamily: DT.body,
          }}>
            <Lightbulb size={13} weight="regular" /> Dracs puede
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '430px' }}>
            {chips.map(chip => {
              const ChipIcon = CHIP_ICON[chip.id] ?? Lightbulb
              return (
                <button
                  key={chip.id}
                  type="button"
                  className="dc-btn dc-sug"
                  onClick={() => send(chip.chip)}
                  disabled={busy}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%',
                    padding: '8px 10px', borderRadius: R_CHIP,
                    border: '1px solid transparent', background: 'transparent',
                    color: DT.ink, fontSize: '13px', fontWeight: 600, lineHeight: 1.4,
                    fontFamily: DT.body, textAlign: 'left',
                    cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.55 : 1,
                  }}
                >
                  <ChipIcon size={17} weight="regular" color={DT.azulInk} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ flex: 1, minWidth: 0 }}>{chip.chip}</span>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div style={{
        flexShrink: 0, background: DT.cream,
        padding: isFull ? '0 24px 10px' : '0 14px 10px',
      }}>
        <div
          className={scrollStrip ? 'dc-strip' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            flexWrap: scrollStrip ? 'nowrap' : 'wrap',
            overflowX: scrollStrip ? 'auto' : 'visible',
            paddingBottom: scrollStrip ? '2px' : 0,
          }}
        >
          {chips.map(chip => {
            const ChipIcon = CHIP_ICON[chip.id] ?? Lightbulb
            return (
              <button
                key={chip.id}
                type="button"
                className="dc-btn dc-pill"
                onClick={() => send(chip.chip)}
                disabled={busy}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px', flexShrink: 0,
                  height: '32px', padding: '0 12px', borderRadius: '999px',
                  border: `1px solid ${DT.azulTintLine}`, background: DT.white,
                  color: DT.azulInk, fontSize: '12.5px', fontWeight: 700, fontFamily: DT.body,
                  whiteSpace: 'nowrap', textAlign: 'left',
                  cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.55 : 1,
                }}
              >
                <ChipIcon size={15} weight="regular" />
                {chip.chip}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  function renderSendButton(size: number) {
    return (
      <button
        type="button"
        className="dc-btn"
        onClick={() => send(input)}
        disabled={!canSend}
        aria-label="Enviar"
        style={{
          width: `${size}px`, height: `${size}px`, borderRadius: '50%', border: 'none', flexShrink: 0,
          background: canSend ? DT.yellow : DT.arena,
          color: canSend ? DT.ink : DT.faint,
          cursor: canSend ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: canSend ? '0 1px 2px rgba(51,48,42,0.08), 0 4px 12px rgba(247,195,28,0.30)' : 'none',
        }}
      >
        <PaperPlaneTilt size={19} weight="regular" />
      </button>
    )
  }

  function renderComposer() {
    const textarea = (
      <textarea
        ref={inputRef}
        className={isFull ? undefined : 'dc-input'}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Pregúntale por una carpeta o pídele un borrador"
        aria-label="Escribir al copiloto"
        style={{
          flex: 1, width: isFull ? '100%' : undefined,
          minHeight: isFull ? '54px' : '44px', maxHeight: isFull ? '168px' : '100px',
          resize: 'none', boxSizing: 'border-box',
          padding: isFull ? '14px 2px 6px' : '12px 14px',
          borderRadius: isFull ? '0' : R_CHIP,
          background: isFull ? 'transparent' : DT.cream,
          border: isFull ? 'none' : `1px solid ${DT.line}`,
          outline: 'none',
          fontSize: isFull ? '15.5px' : '14.5px',
          fontFamily: DT.body, fontWeight: 500, color: DT.ink, lineHeight: 1.45,
        }}
      />
    )

    if (!isFull) {
      return (
        <div style={{
          flexShrink: 0, padding: '11px 14px 12px', background: DT.white,
          borderTop: `1px solid ${DT.line}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px' }}>
            {textarea}
            {renderSendButton(44)}
          </div>
        </div>
      )
    }

    return (
      <div style={{
        flexShrink: 0, padding: '14px 24px 18px', background: DT.white,
        borderTop: `1px solid ${DT.line}`,
      }}>
        <div className="dc-input" style={{
          padding: '2px 14px 11px', borderRadius: '18px',
          background: DT.cream, border: `1px solid ${DT.line}`,
        }}>
          {textarea}
          {/* Barra de acciones: todas son vista previa y ninguna hace nada
              todavía. Enviar texto sí funciona. */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px',
          }}>
            <PreviewAction Icon={Paperclip} label="Adjuntar archivo" />
            <PreviewAction Icon={Microphone} label="Grabar voz" />
            <PreviewAction Icon={Waveform} label="Dictar" />
            <PreviewAction Icon={UserCircle} label="Contexto del paciente" chip={DEMO_CHILD_NAME} />
            <span style={{ flex: 1 }} />
            {renderSendButton(46)}
          </div>
        </div>
        {/* El pie legal del escritorio queda tapado por esta capa, así que aquí
            se dice una vez. En el panel de esquina no hace falta: se ve debajo. */}
        <p style={{
          margin: '10px 2px 0', fontSize: '11.5px', fontWeight: 600, lineHeight: 1.45,
          color: DT.faint, fontFamily: DT.body,
        }}>
          {AVISO_LEGAL}
        </p>
      </div>
    )
  }

  // ── Minimizado: solo el botón flotante ───────────────────────────────────
  if (view === 'min') {
    return (
      <>
        <style>{CSS}</style>
        <div style={anchor}>
          {/* Halo muy tenue (azul y amarillo) detrás del botón flotante */}
          <span aria-hidden className="dc-halo" style={{
            position: 'absolute', inset: '-30px -34px -32px -30px', pointerEvents: 'none',
            borderRadius: '999px', filter: 'blur(12px)',
            background:
              'radial-gradient(58% 74% at 28% 52%, rgba(91,136,150,0.20), transparent 72%),' +
              'radial-gradient(54% 70% at 78% 60%, rgba(247,195,28,0.18), transparent 72%)',
          }} />
          <button
            ref={launcherRef}
            type="button"
            className="dc-btn"
            onClick={() => setView('panel')}
            aria-label="Abrir el copiloto clínico de Dracs"
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '7px 18px 7px 8px', borderRadius: '999px',
              background: DT.white, border: `1px solid ${DT.line}`, boxShadow: SHADOW_LAUNCHER,
              cursor: 'pointer', fontFamily: DT.display,
            }}
          >
            <DracsMark size={44} radius={13} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: DT.ink }}>
              Pregúntale a Dracs
            </span>
            <span
              className="dc-pulse"
              aria-hidden
              style={{
                width: '9px', height: '9px', borderRadius: '50%', background: ONLINE, flexShrink: 0,
              }}
            />
          </button>
        </div>
      </>
    )
  }

  // ── Pantalla completa: capa sobre la ventana, ancho de lectura cómodo ─────
  if (isFull) {
    return (
      <>
        <style>{CSS}</style>
        {/* Fondo atenuado y desenfocado: el escritorio sigue ahí detrás, Dracs
            está encima. Por eso la superficie deja aire a los lados y no ocupa
            la ventana entera. */}
        <div
          className="dc-fade"
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(51,48,42,0.40)',
            backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
            display: 'flex', justifyContent: 'center',
            padding: narrow ? '14px 12px' : '30px 24px',
          }}
        >
          <div
            ref={fullRef}
            className="dc-rise"
            role="dialog"
            aria-modal="true"
            aria-label="Copiloto clínico de Dracs, pantalla completa"
            style={{
              width: '100%', maxWidth: '820px',
              display: 'flex', flexDirection: 'column',
              background: DT.cream, borderRadius: narrow ? '20px' : R_PANEL,
              border: `1px solid ${DT.line}`, boxShadow: SHADOW_PANEL, overflow: 'hidden',
            }}
          >
            {renderHeader()}
            {renderChat()}
            {renderSuggestions()}
            {renderComposer()}
          </div>
        </div>
      </>
    )
  }

  // ── Panel de esquina ─────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div
        className="dc-in"
        role="dialog"
        aria-modal="false"
        aria-label="Copiloto clínico de Dracs, vista previa"
        style={{
          ...anchor,
          left: narrow ? '16px' : undefined,
          right: narrow ? '16px' : '22px',
          bottom: narrow ? '16px' : '22px',
          width: narrow ? 'auto' : 'min(440px, 100vw - 32px)',
          height: narrow ? 'calc(100vh - 32px)' : 'min(686px, 100vh - 48px)',
          display: 'flex', flexDirection: 'column',
          background: DT.cream, borderRadius: R_PANEL, border: `1px solid ${DT.line}`,
          boxShadow: SHADOW_PANEL, overflow: 'hidden',
        }}
      >
        {renderHeader()}
        {renderChat()}
        {renderSuggestions()}
        {renderComposer()}
      </div>
    </>
  )
}
