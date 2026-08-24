// Casa de la Familia — una sola superficie cálida, en columna, con todo a mano
// (§2). No es un dashboard: es abrir la puerta de casa. Sin pestañas, sin menús
// profundos. La familia sólo ve progreso emocional; nunca métricas (§0, §6).

import { ClipboardText, CaretLeft } from '@phosphor-icons/react'
import { useAuth } from '../../../context/AuthContext'
import { useTherapist } from '../../../context/TherapistContext'
import { HT, COLUMN_MAX } from './homeStyles'
import { useFamilyWeek } from './useFamilyWeek'
import HomeSkeleton from './HomeSkeleton'
import LaPuerta from './LaPuerta'
import CartaDeLaSemana from './CartaDeLaSemana'
import UnaCosaParaHoy from './UnaCosaParaHoy'
import ElRecorrido from './ElRecorrido'
import DraguiAssistant from './DraguiAssistant'
import Continuidad from './Continuidad'

interface Props {
  onNavigateToJugar: () => void            // el mundo entero (continuidad)
  onNavigateToPlace: (placeId: string) => void  // un lugar concreto (una cosa para hoy)
  onNavigateToTerapeuta: () => void
}

// Contenedor con scroll cálido propio (el <main> del shell recorta overflow).
function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div className="casa-home" style={{
      fontFamily: HT.body, width: '100%', flex: 1, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px 56px',
    }}>
      {children}
    </div>
  )
}

export default function CasaDeLaFamilia({ onNavigateToJugar, onNavigateToPlace, onNavigateToTerapeuta }: Props) {
  const { profile } = useAuth()
  const { selectedPatientId } = useTherapist()
  const isTherapist = profile?.role === 'therapist'

  const { loading, childName, signal, isTherapistPreview, emphasisGames, journey } = useFamilyWeek()

  // Terapeuta que llega a la casa sin paciente elegido: lo guiamos de vuelta.
  if (isTherapist && !selectedPatientId) {
    return (
      <Surface>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', gap: '16px', padding: '40px 24px',
        }}>
          <ClipboardText size={44} weight="duotone" color={HT.blue} />
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: HT.ink, fontFamily: HT.display }}>
            Elige un paciente
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: HT.muted, maxWidth: '360px', lineHeight: 1.6 }}>
            Vuelve al panel clínico y selecciona un paciente para ver su casa de familia.
          </p>
          <button
            onClick={onNavigateToTerapeuta}
            style={{
              marginTop: '4px', height: '44px', padding: '0 24px', borderRadius: '12px', border: 'none',
              background: HT.blue, color: HT.white, fontSize: '15px', fontWeight: 700, fontFamily: HT.display, cursor: 'pointer',
            }}
          >
            Ir al panel
          </button>
        </div>
      </Surface>
    )
  }

  if (loading) {
    return <Surface><HomeSkeleton /></Surface>
  }

  return (
    <Surface>
      <div style={{ width: '100%', maxWidth: COLUMN_MAX, display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Franja de vista terapeuta (previsualiza lo que ve la familia). */}
        {isTherapistPreview && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
            background: HT.blueTint, borderRadius: '12px', padding: '10px 14px',
            border: `1px solid rgba(91,136,150,0.25)`,
          }}>
            <button
              onClick={onNavigateToTerapeuta}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '13px', fontWeight: 700, color: HT.muted, fontFamily: HT.body,
              }}
            >
              <CaretLeft size={13} weight="bold" />
              Volver al panel
            </button>
            <div style={{ width: '1px', height: '14px', background: '#D3DDE0', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: HT.ink, fontFamily: HT.body }}>
              Viendo la casa de <strong>{childName}</strong>
            </span>
            <span style={{
              marginLeft: 'auto', background: HT.blue, color: HT.white, flexShrink: 0,
              fontSize: '11px', fontWeight: 700, fontFamily: HT.body, padding: '3px 10px', borderRadius: '20px',
            }}>
              Vista terapeuta
            </span>
          </div>
        )}

        <LaPuerta childName={childName} signal={signal} />
        <CartaDeLaSemana childName={childName} signal={signal} delay={80} />
        {/* El recorrido va después de la carta (que cuenta la semana) y antes
            del CTA: primero "cómo va", después "por dónde anduvo", y recién
            entonces "qué hacemos hoy". */}
        <ElRecorrido childName={childName} journey={journey} delay={160} />
        <UnaCosaParaHoy childName={childName} emphasisGames={emphasisGames} onOpenPlace={onNavigateToPlace} delay={240} />
        <DraguiAssistant childName={childName} delay={320} />
        <Continuidad childName={childName} onOpenWorld={onNavigateToJugar} delay={400} />
      </div>
    </Surface>
  )
}
