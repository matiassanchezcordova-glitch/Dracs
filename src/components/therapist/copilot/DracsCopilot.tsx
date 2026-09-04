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

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Lock, PaperPlaneTilt, X, FolderOpen } from '@phosphor-icons/react'
import { DT } from '../desk/deskTokens'
import { ANSWERS, GREETING, route, type CopilotAnswer } from './copilotData'

const ONLINE = '#10B981'          // mismo verde de "en línea" que usa la familia
const FAVICON = '/brand/dracs-favicon-cut.png'
const INERT_FEEDBACK = 'Llega muy pronto'

interface Msg {
  id: number
  role: 'assistant' | 'user'
  full: string
  shown: string
  done: boolean
  answer?: CopilotAnswer
}

// Animaciones locales del widget. Van aquí (y no en index.css) para que el
// copiloto sea un archivo autocontenido; todas se apagan con reduced-motion.
const CSS = `
@keyframes dcDot   { 0%, 60%, 100% { opacity: 0.25; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
@keyframes dcPulse { 0% { box-shadow: 0 0 0 0 rgba(91,136,150,0.55); } 70% { box-shadow: 0 0 0 8px rgba(91,136,150,0); } 100% { box-shadow: 0 0 0 0 rgba(91,136,150,0); } }
@keyframes dcCaret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes dcIn    { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
.dc-dot   { animation: dcDot 1.1s ease-in-out infinite; }
.dc-pulse { animation: dcPulse 2s ease-out infinite; }
.dc-caret { animation: dcCaret 1s step-end infinite; }
.dc-in    { animation: dcIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) both; }
.dc-bar   { transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
@media (prefers-reduced-motion: reduce) {
  .dc-dot, .dc-pulse, .dc-caret, .dc-in { animation: none !important; }
  .dc-bar { transition: none !important; }
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

// ── Barras de distribución: no es una nota, es cuánto jugó de cada cosa ───────
function DistBars({ dist }: { dist: [string, number][] }) {
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setGrown(true), 40)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
      {dist.map(([label, pct]) => (
        <div key={label}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '4px',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>
              {label}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: DT.muted, fontFamily: DT.body }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: '8px', borderRadius: '999px', background: DT.arena, overflow: 'hidden' }}>
            <div
              className="dc-bar"
              style={{ width: grown ? `${pct}%` : '0%', height: '100%', borderRadius: '999px', background: DT.azul }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tarjeta de borrador: el terapeuta lo revisa y lo firma ───────────────────
function DraftCard({ text }: { text: string }) {
  const [useLabel, setUseLabel] = useState('Usar borrador')
  const [editLabel, setEditLabel] = useState('Editar')
  return (
    <div style={{
      marginTop: '12px', padding: '14px', borderRadius: DT.radiusSm,
      background: DT.white, border: `1px dashed ${DT.mostaza}`,
    }}>
      <p style={{
        margin: '0 0 8px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em',
        textTransform: 'uppercase', color: DT.mostaza, fontFamily: DT.body,
      }}>
        Borrador · para la familia
      </p>
      <p style={{
        margin: 0, fontSize: '14px', fontWeight: 500, lineHeight: 1.6,
        color: DT.ink, fontFamily: DT.body, whiteSpace: 'pre-wrap',
      }}>
        {text}
      </p>
      <p style={{
        margin: '12px 0 0', display: 'flex', gap: '7px', alignItems: 'flex-start',
        fontSize: '12px', fontWeight: 600, lineHeight: 1.45, color: DT.muted, fontFamily: DT.body,
      }}>
        <Lock size={13} weight="fill" color={DT.topo} style={{ flexShrink: 0, marginTop: '2px' }} />
        Dracs no afirma mejoras clínicas. Tú lo revisas y lo firmas.
      </p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          type="button"
          onClick={() => setUseLabel(INERT_FEEDBACK)}
          style={{
            height: '38px', padding: '0 16px', borderRadius: '10px', border: 'none',
            background: DT.yellow, color: DT.ink, fontSize: '13.5px', fontWeight: 700,
            fontFamily: DT.display, cursor: 'pointer',
          }}
        >
          {useLabel}
        </button>
        <button
          type="button"
          onClick={() => setEditLabel(INERT_FEEDBACK)}
          style={{
            height: '38px', padding: '0 16px', borderRadius: '10px',
            border: `1.5px solid ${DT.line}`, background: DT.white, color: DT.ink,
            fontSize: '13.5px', fontWeight: 700, fontFamily: DT.display, cursor: 'pointer',
          }}
        >
          {editLabel}
        </button>
      </div>
    </div>
  )
}

// ── Chip de fuente: de dónde salió lo que acaba de decir ─────────────────────
function SourceChip({ src }: { src: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px',
      padding: '5px 10px', borderRadius: '999px', background: DT.arena,
      color: DT.muted, fontSize: '11.5px', fontWeight: 700, fontFamily: DT.body,
    }}>
      <FolderOpen size={13} weight="fill" color={DT.topo} /> {src}
    </span>
  )
}

function TypingIndicator() {
  return (
    <div style={{
      alignSelf: 'flex-start', padding: '13px 16px', borderRadius: '16px 16px 16px 4px',
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
  )
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '88%', padding: '11px 14px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? DT.yellow : DT.white,
        border: isUser ? 'none' : `1px solid ${DT.line}`,
        boxShadow: isUser ? 'none' : DT.shadowSoft,
        color: DT.ink, fontSize: '14.5px', fontWeight: 500, lineHeight: 1.55,
        fontFamily: DT.body, whiteSpace: 'pre-wrap',
      }}>
        {msg.shown}
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
        {msg.done && msg.answer && <SourceChip src={msg.answer.src} />}
      </div>
    </div>
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
          timers.current.push(window.setTimeout(step, 26 + Math.random() * 34))
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
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
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
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir el copiloto clínico de Dracs"
          style={{
            ...anchor,
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '7px 18px 7px 8px', borderRadius: '999px',
            background: DT.white, border: `1px solid ${DT.line}`, boxShadow: DT.shadow,
            cursor: 'pointer', fontFamily: DT.display,
          }}
        >
          <img
            src={FAVICON}
            alt=""
            aria-hidden
            style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'contain', flexShrink: 0 }}
          />
          <span style={{ fontSize: '15px', fontWeight: 700, color: DT.ink }}>
            Pregúntale a Dracs
          </span>
          <span
            className="dc-pulse"
            aria-hidden
            style={{
              width: '9px', height: '9px', borderRadius: '50%', background: DT.azul, flexShrink: 0,
            }}
          />
        </button>
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
          width: narrow ? 'auto' : 'min(438px, 100vw - 32px)',
          height: narrow ? 'calc(100vh - 32px)' : 'min(680px, 100vh - 44px)',
          display: 'flex', flexDirection: 'column',
          background: DT.cream, borderRadius: DT.radius, border: `1px solid ${DT.line}`,
          boxShadow: '0 18px 48px rgba(51,48,42,0.18)', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '11px', flexShrink: 0,
          padding: '13px 14px', background: DT.white, borderBottom: `1px solid ${DT.line}`,
        }}>
          <img
            src={FAVICON}
            alt=""
            aria-hidden
            style={{ width: '40px', height: '40px', borderRadius: '11px', objectFit: 'contain', flexShrink: 0 }}
          />
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
            padding: '5px 10px', borderRadius: '999px', background: DT.arena,
            color: DT.muted, fontSize: '11px', fontWeight: 800, fontFamily: DT.body,
            letterSpacing: '0.02em',
          }}>
            <Lock size={12} weight="fill" /> Vista previa
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar el copiloto"
            style={{
              width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
              border: 'none', background: 'transparent', color: DT.muted, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = DT.arena }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Chat */}
        <div
          ref={chatRef}
          aria-live="polite"
          style={{
            flex: 1, minHeight: 0, overflowY: 'auto', background: DT.cream,
            padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
          }}
        >
          {messages.map(m => <Bubble key={m.id} msg={m} />)}
          {typing && <TypingIndicator />}
        </div>

        {/* Chips de sugerencia */}
        {chips.length > 0 && (
          <div style={{
            flexShrink: 0, padding: '0 14px 12px', background: DT.cream,
            display: 'flex', flexWrap: 'wrap', gap: '7px',
          }}>
            {chips.map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => send(chip.chip)}
                disabled={busy}
                style={{
                  padding: '8px 13px', minHeight: '36px', borderRadius: '999px',
                  border: `1.5px solid ${DT.azul}`, background: DT.white,
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
        )}

        {/* Entrada */}
        <div style={{
          flexShrink: 0, padding: '11px 14px 12px', background: DT.white,
          borderTop: `1px solid ${DT.line}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Pregúntale por una carpeta o pídele un borrador"
              aria-label="Escribir al copiloto"
              style={{
                flex: 1, minHeight: '44px', maxHeight: '96px', resize: 'none',
                padding: '12px 14px', borderRadius: '16px',
                background: DT.cream, border: `1px solid ${DT.line}`, outline: 'none',
                fontSize: '14.5px', fontFamily: DT.body, fontWeight: 500, color: DT.ink,
                lineHeight: 1.4,
              }}
            />
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!canSend}
              aria-label="Enviar"
              style={{
                width: '44px', height: '44px', borderRadius: '50%', border: 'none', flexShrink: 0,
                background: canSend ? DT.yellow : DT.arena,
                color: canSend ? DT.ink : DT.faint,
                cursor: canSend ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <PaperPlaneTilt size={18} weight="fill" />
            </button>
          </div>
          <p style={{
            margin: '9px 2px 0', fontSize: '11.5px', fontWeight: 600, lineHeight: 1.4,
            color: DT.faint, fontFamily: DT.body,
          }}>
            Vista previa. Dracs no valora ni diagnostica: tú decides y tú firmas.
          </p>
        </div>
      </div>
    </>
  )
}
