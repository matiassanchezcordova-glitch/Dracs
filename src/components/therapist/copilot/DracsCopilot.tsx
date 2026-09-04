// Copiloto clínico del terapeuta — widget flotante, mockup 100% front-end.
// Sin LLM, sin red, sin almacenamiento: estado local y un guion escrito a mano
// (copilotData.ts). Es el equivalente de Dragui para el lado profesional.
//
// ROADMAP (no ahora): la versión real va anclada a los datos reales del
// caseload, con recuperación sobre las mismas sesiones que ya lee el escritorio
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
  Lock, PaperPlaneTilt, X, Info, FileText, CheckCircle, Lightbulb,
} from '@phosphor-icons/react'
import { DT } from '../desk/deskTokens'
import { ANSWERS, GREETING, route, type CopilotAnswer } from './copilotData'

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
.dc-dot   { animation: dcDot 1.1s ease-in-out infinite; }
.dc-pulse { animation: dcPulse 2s ease-out infinite; }
.dc-caret { animation: dcCaret 1s step-end infinite; }
.dc-in    { animation: dcIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) both; }
.dc-halo  { animation: dcHalo 4.5s ease-in-out infinite; }
.dc-bar   { transition: width 0.75s cubic-bezier(0.22, 1, 0.36, 1); }
.dc-input { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
.dc-input:focus { border-color: ${DT.azul}; box-shadow: 0 0 0 3px rgba(91,136,150,0.16); }
.dc-btn:focus-visible, .dc-input:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .dc-dot, .dc-pulse, .dc-caret, .dc-in, .dc-halo { animation: none !important; }
  .dc-bar, .dc-input { transition: none !important; }
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
      <p style={{
        margin: '13px 0 0', display: 'flex', gap: '7px', alignItems: 'flex-start',
        fontSize: '12px', fontWeight: 600, lineHeight: 1.45, color: DT.muted, fontFamily: DT.body,
      }}>
        <Lock size={14} weight="regular" color={DT.topo} style={{ flexShrink: 0, marginTop: '1px' }} />
        Dracs no afirma mejoras clínicas. Tú lo revisas y lo firmas.
      </p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '13px' }}>
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

// ── Pastilla de fuente: de dónde salió lo que acaba de decir ─────────────────
function SourcePill({ src }: { src: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '13px',
      padding: '5px 11px', borderRadius: '999px',
      background: DT.azulTint, border: `1px solid ${DT.azulTintLine}`,
      color: DT.azulInk, fontSize: '11.5px', fontWeight: 700, fontFamily: DT.body,
    }}>
      <Info size={13} weight="regular" /> {src}
    </span>
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
        {msg.done && msg.answer?.dist && <DistBars dist={msg.answer.dist} />}
        {msg.done && msg.answer?.draft && <DraftCard text={msg.answer.draft} />}
        {msg.done && msg.answer && <SourcePill src={msg.answer.src} />}
      </div>
    </AssistantRow>
  )
}

export default function DracsCopilot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, role: 'assistant', full: GREETING, shown: GREETING, done: true },
  ])
  const [typing, setTyping] = useState(false)
  const [busy, setBusy] = useState(false)
  const [used, setUsed] = useState<string[]>([])
  const [input, setInput] = useState('')

  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const narrow = useMediaQuery('(max-width: 520px)')

  const nextId = useRef(1)
  const timers = useRef<number[]>([])
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  // Foco: al abrir va al input, al cerrar vuelve al lanzador (nunca al montar).
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      wasOpen.current = true
    } else if (wasOpen.current) {
      launcherRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Autoscroll mientras llega texto.
  useEffect(() => {
    const el = chatRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing, open])

  const send = useCallback((raw: string) => {
    const text = raw.trim()
    if (!text || busy) return
    const answer = route(text)

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

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 100)}px`
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
      if (inputRef.current) inputRef.current.style.height = 'auto'
    }
  }

  const chips = ANSWERS.filter(a => !used.includes(a.id)).slice(0, 3)
  const canSend = input.trim().length > 0 && !busy

  const anchor: React.CSSProperties = {
    position: 'fixed', right: '22px', bottom: '22px', zIndex: 9000,
  }

  if (!open) {
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
            onClick={() => setOpen(true)}
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
        {/* Cabecera: degradado azulTint a blanco, hairline degradada debajo */}
        <div style={{
          flexShrink: 0,
          background: `linear-gradient(180deg, ${DT.azulTint} 0%, ${DT.white} 100%)`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '11px', padding: '13px 14px',
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
            <button
              type="button"
              className="dc-btn"
              onClick={() => setOpen(false)}
              aria-label="Cerrar el copiloto"
              style={{
                width: '34px', height: '34px', borderRadius: R_CHIP, flexShrink: 0,
                border: 'none', background: 'transparent', color: DT.muted, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = DT.arena }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <X size={18} weight="regular" />
            </button>
          </div>
          <div aria-hidden style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${DT.azulTintLine} 18%, ${DT.azulTintLine} 82%, transparent 100%)`,
          }} />
        </div>

        {/* Chat */}
        <div
          ref={chatRef}
          aria-live="polite"
          style={{
            flex: 1, minHeight: 0, overflowY: 'auto', background: DT.cream,
            padding: '16px', display: 'flex', flexDirection: 'column', gap: '13px',
          }}
        >
          {messages.map(m => <Bubble key={m.id} msg={m} />)}
          {typing && <TypingIndicator />}
        </div>

        {/* Sugerencias */}
        {chips.length > 0 && (
          <div style={{ flexShrink: 0, padding: '0 14px 12px', background: DT.cream }}>
            <p style={{
              margin: '0 0 7px', display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.05em',
              textTransform: 'uppercase', color: DT.faint, fontFamily: DT.body,
            }}>
              <Lightbulb size={13} weight="regular" /> Sugerencias
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {chips.map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  className="dc-btn"
                  onClick={() => send(chip.chip)}
                  disabled={busy}
                  style={{
                    padding: '8px 13px', minHeight: '36px', borderRadius: R_CHIP,
                    border: `1px solid ${DT.azulTintLine}`, background: DT.white,
                    color: DT.azulInk, fontSize: '12.5px', fontWeight: 700, fontFamily: DT.body,
                    cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.55 : 1,
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!busy) e.currentTarget.style.background = DT.azulTint }}
                  onMouseLeave={e => { e.currentTarget.style.background = DT.white }}
                >
                  {chip.chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Entrada */}
        <div style={{
          flexShrink: 0, padding: '11px 14px 12px', background: DT.white,
          borderTop: `1px solid ${DT.line}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px' }}>
            <textarea
              ref={inputRef}
              className="dc-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Pregúntale por una carpeta o pídele un borrador"
              aria-label="Escribir al copiloto"
              style={{
                flex: 1, minHeight: '44px', maxHeight: '100px', resize: 'none',
                padding: '12px 14px', borderRadius: R_CHIP,
                background: DT.cream, border: `1px solid ${DT.line}`, outline: 'none',
                fontSize: '14.5px', fontFamily: DT.body, fontWeight: 500, color: DT.ink,
                lineHeight: 1.4,
              }}
            />
            <button
              type="button"
              className="dc-btn"
              onClick={() => send(input)}
              disabled={!canSend}
              aria-label="Enviar"
              style={{
                width: '44px', height: '44px', borderRadius: '50%', border: 'none', flexShrink: 0,
                background: canSend ? DT.yellow : DT.arena,
                color: canSend ? DT.ink : DT.faint,
                cursor: canSend ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: canSend ? '0 1px 2px rgba(51,48,42,0.08), 0 4px 12px rgba(247,195,28,0.30)' : 'none',
              }}
            >
              <PaperPlaneTilt size={19} weight="regular" />
            </button>
          </div>
          <p style={{
            margin: '9px 2px 0', display: 'flex', alignItems: 'flex-start', gap: '6px',
            fontSize: '11.5px', fontWeight: 600, lineHeight: 1.4,
            color: DT.faint, fontFamily: DT.body,
          }}>
            <Info size={14} weight="regular" style={{ flexShrink: 0, marginTop: '1px' }} />
            Vista previa. Dracs no valora ni diagnostica: tú decides y tú firmas.
          </p>
        </div>
      </div>
    </>
  )
}
