// El asistente (familia) — pieza central de pixie dust, mockup 100% front-end
// y BLOQUEADO (§3). Sin LLM, sin red, sin almacenamiento: puro estado local.
// Tematizado como el dragón del niño. El nombre vive en la constante DRAGUI.
//
// ROADMAP (no ahora): el segundo superpoder del asistente es RESPONDER sobre el
// recorrido — "¿qué juego le costó más?", "¿cómo fue la semana?" — leyendo los
// mismos datos que ya derivan `journey.ts` y `useFamilyWeek`, con dos voces
// distintas: cálida y sin números para la familia (§principio 5), clínica y con
// números para el profesional. Hoy sigue siendo el mockup con candado.

import { useEffect, useRef, useState } from 'react'
import { Lock, PaperPlaneTilt } from '@phosphor-icons/react'
import { HT } from './homeStyles'
import {
  DRAGUI, ASSISTANT_SUBTITLE, ASSISTANT_PREVIEW_BADGE, ASSISTANT_LOCKED_PLACEHOLDER,
  assistantGreeting, assistantPreviewNote, WAITLIST_CTA, WAITLIST_THANKS,
  ASSISTANT_CHIPS, fallbackReply,
  type MiniExercise, type ScriptedReply,
} from './familyHome.copy'

interface Msg {
  role: 'assistant' | 'user'
  text: string
  exercise?: MiniExercise
}

function fill(text: string, name: string): string {
  return text.replace(/\{name\}/g, name)
}

// ── Avatar del dragón (SOLO en el header del asistente) ──────────────────────
function DragonAvatar({ size }: { size: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: HT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <img src="/landing/dragon.webp" alt="" aria-hidden style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
    </span>
  )
}

// ── Tarjeta-juego de ejemplo que "crea" el asistente ─────────────────────────
function MiniExerciseCard({ ex, name }: { ex: MiniExercise; name: string }) {
  return (
    <div style={{
      marginTop: '10px', background: HT.white, border: `1px solid ${HT.line}`,
      borderRadius: HT.radiusSm, overflow: 'hidden',
      maxWidth: '320px',
    }}>
      <div style={{
        height: '104px', background: ex.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ex.Icon size={44} weight="duotone" color="#FFFFFF" />
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <span style={{
          display: 'inline-block', marginBottom: '8px', padding: '3px 10px', borderRadius: '20px',
          background: HT.sand, color: HT.ink, fontSize: '14px', fontWeight: 400,
          fontFamily: HT.body,
        }}>
          {fill(ex.skillTag, name)}
        </span>
        <p style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 500, color: HT.ink, fontFamily: HT.serif }}>
          {fill(ex.title, name)}
        </p>
        {/* Botón inerte: se ve real (vende el video) pero no hace nada. */}
        <button
          type="button"
          aria-disabled
          onClick={e => e.preventDefault()}
          style={{
            width: '100%', height: '44px', border: 'none', borderRadius: '12px',
            background: HT.yellow, color: HT.ink, fontSize: '16px', fontWeight: 600,
            fontFamily: HT.body, cursor: 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          Empezar a jugar
        </button>
      </div>
    </div>
  )
}

// ── Burbuja de chat ──────────────────────────────────────────────────────────
function Bubble({ msg, name }: { msg: Msg; name: string }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', gap: '8px', alignItems: 'flex-end',
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      {/* Sin avatar por burbuja: el dragón vive UNA sola vez, en el header. */}
      <div style={{ maxWidth: '82%' }}>
        <div style={{
          padding: '11px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser ? HT.night : HT.white,
          border: isUser ? 'none' : `1px solid ${HT.line}`,
          color: isUser ? '#FFFFFF' : HT.ink, fontSize: '16px', fontWeight: 400, lineHeight: 1.5,
          fontFamily: HT.body,
        }}>
          {fill(msg.text, name)}
        </div>
        {msg.exercise && <MiniExerciseCard ex={msg.exercise} name={name} />}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
      <div style={{
        padding: '13px 16px', borderRadius: '16px 16px 16px 4px',
        background: HT.white, border: `1px solid ${HT.line}`,
        display: 'flex', gap: '5px', alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="home-typing-dot"
            style={{
              width: '7px', height: '7px', borderRadius: '50%', background: HT.taupe,
              animation: `typingDot 1.1s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function DraguiAssistant({
  childName, delay = 0,
}: { childName: string; delay?: number }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', text: assistantGreeting(childName) },
  ])
  const [chips, setChips] = useState<ScriptedReply[]>(ASSISTANT_CHIPS)
  const [typing, setTyping] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const [waitlisted, setWaitlisted] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  function handleChip(chip: ScriptedReply) {
    if (typing) return
    const reply = chip.chip ? chip : fallbackReply(childName)
    setChips(prev => prev.filter(c => c.id !== chip.id))
    setMessages(prev => [...prev, { role: 'user', text: chip.chip }])
    setTyping(true)
    const t = window.setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { role: 'assistant', text: reply.reply, exercise: reply.exercise }])
      setInteracted(true)
    }, 800)
    timers.current.push(t)
  }

  return (
    <section
      className="home-rise"
      style={{ animationDelay: `${delay}ms` }}
      aria-label={`${DRAGUI}, ${ASSISTANT_SUBTITLE}`}
    >
      <div style={{
        background: HT.white, border: `1px solid ${HT.line}`, borderRadius: HT.radius,
        boxShadow: HT.shadow, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '20px 24px', borderBottom: `1px solid ${HT.line}`,
          background: HT.white,
        }}>
          <DragonAvatar size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: HT.ink, fontFamily: HT.serif, lineHeight: 1.15 }}>
              {DRAGUI}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '16px', fontWeight: 400, color: HT.muted, fontFamily: HT.body }}>
              {ASSISTANT_SUBTITLE}
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0,
            padding: '5px 12px', borderRadius: '999px', background: HT.cream,
            border: `1px solid ${HT.line}`,
            color: HT.muted, fontSize: '14px', fontWeight: 400, fontFamily: HT.body,
          }}>
            <Lock size={13} weight="regular" /> {ASSISTANT_PREVIEW_BADGE}
          </span>
        </div>

        {/* Chat */}
        <div style={{
          padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px',
          background: HT.cream,
        }}>
          {messages.map((m, i) => <Bubble key={i} msg={m} name={childName} />)}
          {typing && <TypingIndicator />}

          {/* Chips de ejemplo (estilo Claude) */}
          {chips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
              {chips.map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleChip(chip)}
                  disabled={typing}
                  style={{
                    padding: '9px 15px', minHeight: '40px', borderRadius: '999px',
                    border: '1.5px solid #C9CBC6', background: HT.white,
                    color: HT.ink, fontSize: '16px', fontWeight: 400, fontFamily: HT.body,
                    cursor: typing ? 'default' : 'pointer', transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!typing) e.currentTarget.style.borderColor = HT.ink }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#C9CBC6' }}
                >
                  {chip.chip}
                </button>
              ))}
            </div>
          )}

          {/* Nota de vista previa + lista de espera (tras la primera respuesta) */}
          {interacted && (
            <div className="carta-in" style={{
              marginTop: '2px', padding: '16px', borderRadius: HT.radiusSm,
              background: HT.white, border: `1px solid ${HT.line}`,
            }}>
              <p style={{
                margin: '0 0 12px', fontSize: '16px', fontWeight: 400, color: HT.ink,
                lineHeight: 1.55, fontFamily: HT.body,
                display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <Lock size={16} weight="regular" color={HT.muted} style={{ flexShrink: 0, marginTop: '3px' }} />
                {assistantPreviewNote(childName)}
              </p>
              {waitlisted ? (
                <p style={{
                  margin: 0, fontSize: '16px', fontWeight: 600, color: HT.blue,
                  fontFamily: HT.body,
                }}>
                  {WAITLIST_THANKS}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setWaitlisted(true)}
                  style={{
                    height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none',
                    background: HT.night, color: HT.white, fontSize: '16px', fontWeight: 600,
                    fontFamily: HT.body, cursor: 'pointer',
                  }}
                >
                  {WAITLIST_CTA}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Entrada de texto BLOQUEADA — se lee como vista previa, no como rota. */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 24px', borderTop: `1px solid ${HT.line}`, background: HT.white,
        }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
            height: '46px', padding: '0 14px', borderRadius: '999px',
            background: HT.cream, border: `1px solid ${HT.line}`, color: HT.taupe,
          }}>
            <Lock size={15} weight="regular" style={{ flexShrink: 0 }} />
            <input
              type="text"
              disabled
              placeholder={ASSISTANT_LOCKED_PLACEHOLDER}
              aria-label="Escribir a Dragui (disponible muy pronto)"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: '16px', fontFamily: HT.body, color: HT.taupe, cursor: 'not-allowed',
              }}
            />
          </div>
          <button
            type="button"
            disabled
            aria-label="Enviar (disponible muy pronto)"
            style={{
              width: '46px', height: '46px', borderRadius: '50%', border: 'none', flexShrink: 0,
              background: HT.sand, color: HT.taupe, cursor: 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <PaperPlaneTilt size={18} weight="regular" />
          </button>
        </div>
      </div>
    </section>
  )
}
