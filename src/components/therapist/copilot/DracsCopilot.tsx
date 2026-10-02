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

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import {
  Lock, PaperPlaneTilt, X, FileText, CheckCircle, Copy, Lightbulb, ArrowsOut, ArrowsIn,
  Paperclip, Microphone, Waveform, UserCircle, ChartBar, UsersThree, CalendarBlank,
  type Icon,
} from '@phosphor-icons/react'
import { DEMO_CHILD_NAME } from '../../../lib/demo'
import { loadHistory } from '../../../hooks/useChildProfile'
import { DT, SURFACE_PANEL } from '../desk/deskTokens'
import { fromLocalHistory, rangeFor, statsFor } from '../desk/informeData'
import {
  buildAnswers, FALLBACK, GREETING, NO_OFFER, REPEATED, isAffirmative, normalize, route,
  type AnswerGroup, type CopilotAnswer,
} from './copilotData'
import type { Patient } from '../../../data/patients'

const FAVICON = '/brand/dracs-favicon-cut.png'

// Radios del sistema, los de la web: tarjetas 16, panel 20, chips e inputs 12.
const R_CARD = '16px'
const R_PANEL = '20px'
const R_CHIP = '12px'

// Sombras largas y suaves, como las de la web.
const SHADOW_LAUNCHER = '0 2px 4px rgba(21,25,27,0.08), 0 18px 36px -14px rgba(21,25,27,0.4)'
const SHADOW_PANEL = '0 2px 6px rgba(21,25,27,0.06), 0 30px 60px -20px rgba(21,25,27,0.35)'

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
const AVISO_LEGAL = 'Dracs no es un dispositivo médico. No valora ni diagnostica: el profesional revisa y firma todo.'

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
.dc-strip { scrollbar-width: none; -ms-overflow-style: none; }
.dc-strip::-webkit-scrollbar { display: none; }
.dc-input:focus, .dc-input:focus-within { border-color: ${DT.azul}; box-shadow: 0 0 0 3px rgba(63,107,120,0.2); }
.dc-launch:hover { background: #1F3D47 !important; }
.dc-btn:focus-visible, .dc-input:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .dc-dot, .dc-pulse, .dc-caret, .dc-in, .dc-halo, .dc-fade, .dc-rise { animation: none !important; }
  .dc-bar, .dc-input, .dc-sug { transition: none !important; }
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
            <span style={{ fontSize: '14px', fontWeight: 600, color: DT.ink, fontFamily: DT.body }}>
              {label}
            </span>
            <span style={{
              fontSize: '14px', fontWeight: 600, color: DT.muted, fontFamily: DT.body,
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
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch { /* el navegador no dejó copiar: el texto está a la vista */ }
  }
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
        fontSize: '12.5px', fontWeight: 600, letterSpacing: '0.04em',
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
      {/* Una sola acción, y hace algo: se lleva el borrador al portapapeles.
          Antes eran dos botones que solo decían "muy pronto". */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
        <button
          type="button"
          className="dc-btn"
          onClick={copy}
          style={{
            height: '38px', padding: '0 15px', borderRadius: R_CHIP, border: 'none',
            background: DT.yellow, color: DT.ink, fontSize: '14.5px', fontWeight: 600,
            fontFamily: DT.display, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '7px',
          }}
        >
          {copied ? <CheckCircle size={15} weight="regular" /> : <Copy size={15} weight="regular" />}
          {copied ? 'Copiado' : 'Copiar borrador'}
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
            fontSize: '13px', fontWeight: 600, color: GROUP_TONE[g.tone] === DT.azul ? DT.azulInk : DT.topoInk,
            fontFamily: DT.body,
          }}>
            <span aria-hidden style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: GROUP_TONE[g.tone],
            }} />
            {g.label}
          </span>
          <span style={{
            flex: 1, minWidth: '120px', fontSize: '14.5px', fontWeight: 600,
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
      margin: '11px 0 0', fontSize: '13px', fontWeight: 600, lineHeight: 1.45,
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

// ── Sugerencia: un único estilo, se muestre donde se muestre ─────────────────
// Fila fina, sin caja ni fondo, icono de línea y texto alineado a la izquierda.
// `nowrap` es solo colocación (en la tira no puede partirse en dos líneas), no
// otro diseño: colores, radios, paddings y tipografía son los mismos.
function Suggestion({ answer, disabled, nowrap, onPick }: {
  answer: CopilotAnswer
  disabled: boolean
  nowrap?: boolean
  onPick: () => void
}) {
  const ChipIcon = CHIP_ICON[answer.id] ?? Lightbulb
  return (
    <button
      type="button"
      className="dc-btn dc-sug"
      onClick={onPick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: nowrap ? 'center' : 'flex-start', gap: '10px',
        width: nowrap ? 'auto' : '100%', flexShrink: 0,
        padding: '8px 10px', borderRadius: R_CHIP,
        border: '1px solid transparent', background: 'transparent',
        color: DT.ink, fontSize: '14px', fontWeight: 600, lineHeight: 1.4,
        fontFamily: DT.body, textAlign: 'left',
        whiteSpace: nowrap ? 'nowrap' : 'normal',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.55 : 1,
      }}
    >
      <ChipIcon
        size={17}
        weight="regular"
        color={DT.azulInk}
        style={{ flexShrink: 0, marginTop: nowrap ? 0 : '1px' }}
      />
      <span style={{ flex: 1, minWidth: 0 }}>{answer.chip}</span>
    </button>
  )
}

// ── Borrador de informe, armado con las partidas del niño ────────────────────
// Las líneas llegan hechas desde la sección Informe cuando el botón sale de
// ahí (que es quien tiene los datos reales del paciente abierto). Si el
// terapeuta lo pide escribiendo, se arma con el historial del niño de la demo.
// Sin partidas detrás no se inventa un borrador: se dice que no las hay.
//
// Ninguna línea empieza por una cifra: MessageBody lee "12 ..." como ítem
// numerado y la partiría en dos.
function informeLinesFor(name: string): string[] {
  if (normalize(name) !== normalize(DEMO_CHILD_NAME)) return []
  const stats = statsFor(fromLocalHistory(loadHistory()), rangeFor('cuatro'))
  if (!stats.hasData) return []
  const lines = [
    `Jugó ${stats.sessions} ${stats.sessions === 1 ? 'partida' : 'partidas'} en ${stats.activeDays} ${stats.activeDays === 1 ? 'día' : 'días'} de las últimas 4 semanas.`,
  ]
  if (stats.accuracy != null) lines.push(`Sus aciertos del período están en ${stats.accuracy}%.`)
  if (stats.firstHalf != null && stats.secondHalf != null) {
    lines.push(`Primera mitad del período ${stats.firstHalf}%, segunda mitad ${stats.secondHalf}%.`)
  }
  return lines
}

function informeAnswer(rawName: string | undefined, given?: string[]): CopilotAnswer {
  const name = (rawName ?? '').trim() || DEMO_CHILD_NAME
  const lines = given && given.length > 0 ? given : informeLinesFor(name)

  if (lines.length === 0) {
    return {
      id: 'informe', chip: '', keys: [],
      text: `No tengo partidas de ${name} en Dracs, así que no puedo armarte el borrador. El informe vive en la sección Informe de su carpeta.`,
    }
  }

  const numbered = lines.map((l, i) => `${i + 1}.  ${l}`).join('\n')
  return {
    id: 'informe', chip: '', keys: [],
    text: `Borrador para ${name}:\n\n${numbered}\n\nLo tienes completo en la sección Informe de su carpeta.`,
    src: 'Según sus partidas de las últimas 4 semanas.',
  }
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
          fontSize: '12.5px', fontWeight: 600, fontFamily: DT.body,
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
          fontSize: '13.5px', fontWeight: 600, fontFamily: DT.body,
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

export default function DracsCopilot({ patients, isDemo }: { patients: Patient[]; isDemo: boolean }) {
  const answers = useMemo(() => buildAnswers(patients, isDemo), [patients, isDemo])
  const [view, setView] = useState<View>('min')
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, role: 'assistant', full: GREETING, shown: GREETING, done: true },
  ])
  const [typing, setTyping] = useState(false)
  const [busy, setBusy] = useState(false)
  const [used, setUsed] = useState<string[]>([])
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
  // Lo último que dijo Dracs y la acción que dejó ofrecida, para no repetirse
  // palabra por palabra y para poder cumplir un "sí".
  const lastSaid = useRef(GREETING)
  const offered = useRef<string | null>(null)

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
  const deliver = useCallback((raw: string, incoming: CopilotAnswer) => {
    const text = raw.trim()
    if (!text || busy) return

    // Nunca la misma respuesta dos veces seguidas: si toca repetir, se dice que
    // ya está arriba en vez de soltar el mismo párrafo otra vez.
    const answer = incoming.text === lastSaid.current ? REPEATED : incoming
    lastSaid.current = answer.text
    offered.current = answer.offers ?? null

    setMessages(prev => [
      ...prev,
      { id: nextId.current++, role: 'user', full: text, shown: text, done: true },
    ])
    setUsed(prev => prev.includes(answer.id) ? prev : [...prev, answer.id])
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
    const text = raw.trim()
    if (!text) return

    // "sí", "dale", "ok": se ejecuta lo que Dracs dejó ofrecido. Si no había
    // nada ofrecido, se pregunta corto en vez de repetir la respuesta anterior.
    if (isAffirmative(text)) {
      const pending = offered.current ? answers.find(a => a.id === offered.current) : null
      deliver(text, pending ?? NO_OFFER)
      return
    }

    const routed = route(text, answers)
    deliver(text, routed.id === 'informe' ? informeAnswer(undefined) : routed)
  }, [answers, deliver])

  // Enganches del escritorio: "Tu día" pide preparar una sesión, y el informe de
  // la Carpeta pide un borrador. Si el guion de la vista previa no cubre a ese
  // niño, se responde el límite honesto en vez de contar lo de otro paciente.
  useEffect(() => {
    const onAsk = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        { intent?: string; childName?: string; summary?: string[] } | null
      const intent = detail?.intent
      if (intent !== 'prep' && intent !== 'redacta') return
      const child = (detail?.childName ?? '').trim()
      const answer = answers.find(a => a.id === 'prep')
      if (!answer) return
      setView(v => v === 'min' ? 'panel' : v)

      // El informe se arma con los datos que manda la carpeta abierta: son los
      // del paciente real, no los del guion.
      if (intent === 'redacta') {
        const lines = Array.isArray(detail?.summary) ? detail!.summary : undefined
        deliver(
          child ? `Redacta el informe de ${child}` : 'Redacta el informe',
          informeAnswer(child, lines),
        )
        return
      }

      const covered = child !== '' && normalize(answer.text).includes(normalize(child))
      deliver(child ? `Prepárame la sesión de ${child}` : answer.chip, covered ? answer : FALLBACK)
    }
    window.addEventListener('dracs-copilot-open', onAsk)
    return () => window.removeEventListener('dracs-copilot-open', onAsk)
  }, [answers, deliver])

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
  // Una sugerencia usada se va para siempre: volver a pedirla devolvería la
  // misma respuesta, así que la lista mengua a medida que se gastan.
  const chips = answers.filter(a => !used.includes(a.id))
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
          fontSize: '13.5px', fontWeight: 600, fontFamily: DT.body,
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
      <div style={{ flexShrink: 0, background: DT.white, borderBottom: `1px solid ${DT.line}` }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: isFull ? '16px 20px' : '14px 16px',
        }}>
          <DracsMark size={40} radius={20} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: DT.ink, fontFamily: DT.serif, lineHeight: 1.15 }}>
              Dracs
            </p>
            <p style={{
              margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
              fontSize: '14px', fontWeight: 400, color: DT.muted, fontFamily: DT.body,
            }}>
              Copiloto clínico
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '1px 8px', borderRadius: '999px', background: DT.cream,
                fontSize: '13px', fontWeight: 500, color: DT.muted,
              }}>
                <Lock size={12} weight="regular" /> Vista previa
              </span>
            </p>
          </div>
          {isFull
            ? headerButton('Contraer al panel de esquina', () => setView('panel'), <ArrowsIn size={18} weight="regular" />, 'Contraer')
            : headerButton('Expandir a pantalla completa', () => setView('full'), <ArrowsOut size={18} weight="regular" />)}
          {/* Cerrar minimiza: el hilo se conserva y vuelve donde estaba. */}
          {headerButton('Minimizar el copiloto', () => setView('min'), <X size={18} weight="regular" />)}
        </div>
      </div>
    )
  }

  function renderChat() {
    return (
      <div
        ref={chatRef}
        aria-live="polite"
        style={{
          flex: 1, minHeight: 0, overflowY: 'auto', background: 'transparent',
          padding: isFull ? '22px 24px' : '16px',
          display: 'flex', flexDirection: 'column', gap: '13px',
        }}
      >
        {messages.map(m => <Bubble key={m.id} msg={m} />)}
        {typing && <TypingIndicator />}
      </div>
    )
  }

  // Sugerencias. Un solo componente y un solo estilo; lo único que cambia es
  // dónde se colocan:
  //   - hilo vacío: columna bajo el rótulo "Dracs puede";
  //   - con conversación: una tira fija encima de la casilla de texto, fuera
  //     del hilo, para que no queden colgando entre los mensajes.
  // Las usadas ya no están: la lista mengua sola.
  function renderSuggestions() {
    if (chips.length === 0) return null

    // Ancho real disponible: el panel de esquina son 440px, así que ahí la tira
    // también va en scroll horizontal. Envolver comería media conversación.
    const scrollStrip = narrow || !isFull

    if (isEmptyThread) {
      return (
        <div style={{
          flexShrink: 0, background: 'transparent',
          padding: isFull ? '0 24px 16px' : '0 14px 12px',
        }}>
          <p style={{
            margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 600, color: DT.mostazaInk, fontFamily: DT.body,
          }}>
            <Lightbulb size={13} weight="regular" /> Dracs puede
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '430px' }}>
            {chips.map(chip => (
              <Suggestion
                key={chip.id}
                answer={chip}
                disabled={busy}
                onPick={() => send(chip.chip)}
              />
            ))}
          </div>
        </div>
      )
    }

    return (
      <div style={{
        flexShrink: 0, background: 'transparent',
        padding: isFull ? '0 24px 8px' : '0 14px 8px',
      }}>
        <div
          className={scrollStrip ? 'dc-strip' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: '2px',
            flexWrap: scrollStrip ? 'nowrap' : 'wrap',
            overflowX: scrollStrip ? 'auto' : 'visible',
            paddingBottom: scrollStrip ? '2px' : 0,
          }}
        >
          {chips.map(chip => (
            <Suggestion
              key={chip.id}
              answer={chip}
              disabled={busy}
              nowrap
              onPick={() => send(chip.chip)}
            />
          ))}
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
          margin: '10px 2px 0', fontSize: '13px', fontWeight: 600, lineHeight: 1.45,
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
          {/* El botón flotante: en tinta, como el botón "Menú" de la barra. */}
          <button
            ref={launcherRef}
            type="button"
            className="dc-btn dc-launch"
            onClick={() => setView('panel')}
            aria-label="Abrir el copiloto clínico de Dracs"
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '6px 20px 6px 6px', borderRadius: '999px',
              background: DT.night, border: 'none', boxShadow: SHADOW_LAUNCHER,
              cursor: 'pointer', fontFamily: DT.display, transition: 'background 0.15s ease',
            }}
          >
            <DracsMark size={38} radius={19} />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
              Pregúntale a Dracs
            </span>
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
            background: 'rgba(21,25,27,0.48)',
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
              ...SURFACE_PANEL, borderRadius: narrow ? '20px' : R_PANEL,
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
          ...SURFACE_PANEL, borderRadius: R_PANEL, border: `1px solid ${DT.line}`,
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
