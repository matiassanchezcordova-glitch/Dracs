// El asistente (familia) — pieza central de pixie dust, mockup 100% front-end
// y BLOQUEADO (§3). Sin LLM, sin red, sin almacenamiento: puro estado local.
// Tematizado como el dragón del niño. El nombre vive en la constante DRAGUI.

import { useEffect, useRef, useState } from 'react'
import { Lock, Sparkle, PaperPlaneTilt } from '@phosphor-icons/react'
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
      background: HT.blueTint, display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <img src="/brand/dracs-dragon.png" alt="" aria-hidden style={{ width: '86%', height: '86%', objectFit: 'contain' }} />
    </span>
  )
}

// ── Tarjeta-juego de ejemplo que "crea" el asistente ─────────────────────────
function MiniExerciseCard({ ex, name }: { ex: MiniExercise; name: string }) {
  return (
    <div style={{
      marginTop: '10px', background: HT.white, border: `1px solid ${HT.line}`,
      borderRadius: HT.radiusSm, overflow: 'hidden', boxShadow: HT.shadowSoft,
      maxWidth: '320px',
    }}>
      <div style={{
        height: '104px', background: ex.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ex.Icon size={44} weight="fill" color="#FFFFFF" />
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <span style={{
          display: 'inline-block', marginBottom: '8px', padding: '3px 10px', borderRadius: '20px',
          background: HT.blueTint, color: HT.ink, fontSize: '11px', fontWeight: 800,
          fontFamily: HT.body, letterSpacing: '0.02em',
        }}>
          {fill(ex.skillTag, name)}
        </span>
        <p style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 700, color: HT.ink, fontFamily: HT.display }}>
          {fill(ex.title, name)}
        </p>
        {/* Botón inerte: se ve real (vende el video) pero no hace nada. */}
        <button
          type="button"
          aria-disabled
          onClick={e => e.preventDefault()}
          style={{
            width: '100%', height: '44px', border: 'none', borderRadius: '12px',
            background: HT.yellow, color: HT.ink, fontSize: '15px', fontWeight: 700,
            fontFamily: HT.display, cursor: 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <Sparkle size={16} weight="fill" /> Empezar a jugar
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
          background: isUser ? HT.yellow : HT.white,
          border: isUser ? 'none' : `1px solid ${HT.line}`,
          color: HT.ink, fontSize: '15px', fontWeight: 500, lineHeight: 1.5,
          fontFamily: HT.body, boxShadow: isUser ? 'none' : HT.shadowSoft,
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
        background: HT.white, border: `1px solid ${HT.line}`, boxShadow: HT.shadowSoft,
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
          padding: '16px 18px', borderBottom: `1px solid ${HT.line}`,
          background: `linear-gradient(180deg, ${HT.blueTint} 0%, ${HT.white} 100%)`,
        }}>
          <DragonAvatar size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: HT.blueDeep, fontFamily: HT.display }}>
              {DRAGUI}
            </p>
            <p style={{ margin: '1px 0 0', fontSize: '13px', fontWeight: 600, color: HT.muted, fontFamily: HT.body }}>
              {ASSISTANT_SUBTITLE}
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0,
            padding: '5px 11px', borderRadius: '20px', background: HT.sand,
            color: HT.taupe, fontSize: '11px', fontWeight: 800, fontFamily: HT.body,
            letterSpacing: '0.02em',
          }}>
            <Lock size={12} weight="fill" /> {ASSISTANT_PREVIEW_BADGE}
          </span>
        </div>

        {/* Chat */}
        <div style={{
          padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px',
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
                    padding: '9px 14px', minHeight: '40px', borderRadius: '20px',
                    border: `1.5px solid ${HT.blue}`, background: HT.white,
                    color: HT.blue, fontSize: '13.5px', fontWeight: 700, fontFamily: HT.body,
                    cursor: typing ? 'default' : 'pointer', transition: 'background 0.15s ease, transform 0.12s ease',
                  }}
                  onMouseEnter={e => { if (!typing) e.currentTarget.style.background = HT.blueTint }}
                  onMouseLeave={e => { e.currentTarget.style.background = HT.white }}
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
              background: '#FFF7E4', border: `1px dashed ${HT.yellow}`,
            }}>
              <p style={{
                margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: HT.ink,
                lineHeight: 1.55, fontFamily: HT.body,
                display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <Lock size={16} weight="fill" color={HT.taupe} style={{ flexShrink: 0, marginTop: '2px' }} />
                {assistantPreviewNote(childName)}
              </p>
              {waitlisted ? (
                <p style={{
                  margin: 0, fontSize: '14px', fontWeight: 700, color: HT.mint,
                  fontFamily: HT.display,
                }}>
                  {WAITLIST_THANKS}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setWaitlisted(true)}
                  style={{
                    height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none',
                    background: HT.blue, color: HT.white, fontSize: '14px', fontWeight: 700,
                    fontFamily: HT.display, cursor: 'pointer',
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
          padding: '12px 14px', borderTop: `1px solid ${HT.line}`, background: HT.white,
        }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
            height: '46px', padding: '0 14px', borderRadius: '999px',
            background: HT.cream, border: `1px solid ${HT.line}`, color: HT.taupe,
          }}>
            <Lock size={15} weight="fill" style={{ flexShrink: 0 }} />
            <input
              type="text"
              disabled
              placeholder={ASSISTANT_LOCKED_PLACEHOLDER}
              aria-label="Escribir a Dragui (disponible muy pronto)"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: '15px', fontFamily: HT.body, color: HT.taupe, cursor: 'not-allowed',
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
            <PaperPlaneTilt size={18} weight="fill" />
          </button>
        </div>
      </div>
    </section>
  )
}
