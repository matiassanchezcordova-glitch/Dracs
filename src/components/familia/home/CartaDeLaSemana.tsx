// Carta de la semana — la app narra la semana en la voz del mundo, en clave
// emocional y nunca numérica (§2.2). Va en serif, como una carta.
//
// Si su profesional publicó un comentario esta semana (sección Familia de la
// carpeta), llega aquí mismo, debajo de la carta y firmado: es el puente entre
// las dos vistas.

import { Envelope, ChatCircleText } from '@phosphor-icons/react'
import { HT } from './homeStyles'
import { cartaTitle, cartaBody, DRAGUI, type WeekSignal } from './familyHome.copy'
import type { ProfessionalNote } from './useProfessionalNote'

function Label({ Icon, children, light }: { Icon: typeof Envelope; children: React.ReactNode; light?: boolean }) {
  return (
    <p style={{
      margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '16px', fontWeight: 400, fontFamily: HT.body,
      color: light ? 'rgba(255,255,255,0.75)' : HT.muted,
    }}>
      <Icon size={18} weight="regular" aria-hidden /> {children}
    </p>
  )
}

export default function CartaDeLaSemana({
  childName, signal, note, delay = 0,
}: { childName: string; signal: WeekSignal; note: ProfessionalNote | null; delay?: number }) {
  return (
    <section
      className="home-rise"
      style={{ animationDelay: `${delay}ms` }}
      aria-label={cartaTitle()}
    >
      <article
        className="carta-in home-card"
        style={{
          background: HT.white, border: `1px solid ${HT.line}`,
          borderRadius: HT.radius, boxShadow: HT.shadow,
        }}
      >
        <Label Icon={Envelope}>{cartaTitle()}</Label>
        <p className="home-letter" style={{
          margin: 0, fontWeight: 500, color: HT.ink,
          lineHeight: 1.5, fontFamily: HT.serif,
        }}>
          {cartaBody(childName, signal)}
        </p>
        <p style={{
          margin: '16px 0 0', fontSize: '16px', fontWeight: 400, color: HT.muted, fontFamily: HT.body,
        }}>
          {DRAGUI}, el dragón de {childName}
        </p>

        {note && (
          <div style={{ marginTop: '24px', paddingTop: '22px', borderTop: `1px solid ${HT.line}` }}>
            <Label Icon={ChatCircleText}>Su profesional te escribe</Label>
            <p style={{
              margin: 0, fontSize: '24px', fontWeight: 500, lineHeight: 1.5, color: HT.ink, fontFamily: HT.serif,
              whiteSpace: 'pre-wrap',
            }}>
              {note.text}
            </p>
            <p style={{ margin: '14px 0 0', fontSize: '16px', fontWeight: 400, color: HT.muted, fontFamily: HT.body }}>
              {note.author}{note.date ? ` · ${note.date}` : ''}
            </p>
          </div>
        )}
      </article>
    </section>
  )
}
