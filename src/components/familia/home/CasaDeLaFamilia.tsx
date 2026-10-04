// Casa de la Familia — una sola superficie, en columna, con todo a mano (§2).
// No es un dashboard: es abrir la puerta de casa. Sin pestañas, sin menús
// profundos. La familia sólo ve progreso emocional; nunca métricas (§0, §6).
//
// Cinco piezas, en el orden en que se leen: quién (la puerta), cómo le fue (la
// carta, con lo que escribió su profesional), qué hacemos hoy (una sola cosa),
// por dónde anduvo (el recorrido) y lo que viene (Dragui, en vista previa).

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
import { useProfessionalNote } from './useProfessionalNote'

interface Props {
  onNavigateToJugar: () => void            // el mundo entero (hoy lo abre la barra, vista Niño)
  onNavigateToPlace: (placeId: string) => void  // un lugar concreto (una cosa para hoy)
  onNavigateToTerapeuta: () => void
}

// Contenedor con scroll propio (el <main> del shell recorta overflow).
function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div className="casa-home ax-sans" style={{
      fontFamily: HT.body, width: '100%', flex: 1, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {children}
    </div>
  )
}

export default function CasaDeLaFamilia({ onNavigateToPlace, onNavigateToTerapeuta }: Props) {
  const { profile } = useAuth()
  const { selectedPatientId } = useTherapist()
  const isTherapist = profile?.role === 'therapist'

  const { loading, childName, signal, isTherapistPreview, emphasisGames, journey } = useFamilyWeek()
  const note = useProfessionalNote(childName)

  // Terapeuta que llega a la casa sin paciente elegido: lo guiamos de vuelta.
  if (isTherapist && !selectedPatientId) {
    return (
      <Surface>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', gap: '16px', padding: '40px 24px',
        }}>
          <ClipboardText size={40} weight="regular" color={HT.blue} />
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: HT.ink, fontFamily: HT.serif }}>
            Elige un paciente
          </h2>
          <p style={{ margin: 0, fontSize: '16px', color: HT.muted, maxWidth: '380px', lineHeight: 1.6 }}>
            Vuelve a tu escritorio y abre la carpeta de un paciente para ver su casa de familia.
          </p>
          <button
            onClick={onNavigateToTerapeuta}
            style={{
              marginTop: '4px', height: '48px', padding: '0 24px', borderRadius: '12px', border: 'none',
              background: HT.yellow, color: HT.ink, fontSize: '16px', fontWeight: 600, fontFamily: HT.body, cursor: 'pointer',
            }}
          >
            Ir al escritorio
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
            background: HT.white, borderRadius: '12px', padding: '10px 14px',
            border: `1px solid ${HT.line}`,
          }}>
            <button
              onClick={onNavigateToTerapeuta}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '14px', fontWeight: 400, color: HT.muted, fontFamily: HT.body,
              }}
            >
              <CaretLeft size={14} weight="regular" />
              Volver al escritorio
            </button>
            <div style={{ width: '1px', height: '14px', background: HT.line, flexShrink: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: 400, color: HT.ink, fontFamily: HT.body }}>
              Viendo la casa de <strong style={{ fontWeight: 600 }}>{childName}</strong>
            </span>
            <span style={{
              marginLeft: 'auto', background: HT.night, color: HT.white, flexShrink: 0,
              fontSize: '14px', fontWeight: 400, fontFamily: HT.body, padding: '4px 12px', borderRadius: '999px',
            }}>
              Vista del profesional
            </span>
          </div>
        )}

        <LaPuerta childName={childName} signal={signal} />
        <CartaDeLaSemana childName={childName} signal={signal} note={note} delay={80} />
        {/* Después de "cómo le fue", la única cosa que hay que hacer. El
            recorrido queda debajo para quien quiera mirar más. */}
        <UnaCosaParaHoy childName={childName} emphasisGames={emphasisGames} onOpenPlace={onNavigateToPlace} delay={160} />
        <ElRecorrido childName={childName} journey={journey} delay={240} />
        <DraguiAssistant childName={childName} delay={320} />
      </div>
    </Surface>
  )
}
