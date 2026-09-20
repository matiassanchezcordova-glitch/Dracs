// Ajuste de dificultad — el rango de nivel del niño, editable desde la Carpeta.
//
// Reusa el nivel que ya existe (child_assignments, lo mismo que lee
// getCurrentLevel y lo mismo que ve la familia). No es una valoración: es el
// rango con el que el terapeuta decide trabajar, y se guarda tal cual.
//
// Honestidad: hoy este rango es el nivel registrado del niño. La partida del
// niño todavía se arma con su propio nivel de juego, así que la línea del pie
// dice qué hace y qué no, sin prometer lo que aún no pasa.
//
// El nivel vive sólo aquí: ni la identidad de la Carpeta lo repite ni esta
// tarjeta lo dibuja dos veces. Dos steppers y su botón.

import { useEffect, useState } from 'react'
import { Minus, Plus, SlidersHorizontal } from '@phosphor-icons/react'
import { DT } from './deskTokens'
import { Button, Card, FieldLabel, IconButton, SectionTitle } from './deskUI'
import { LEVEL_MAX, LEVEL_MIN, clampLevel, loadChildLevel, saveChildLevel, type ChildLevel } from './childLevel'

function Stepper({ label, value, onChange, disabled, min, max }: {
  label: string
  value: number
  onChange: (v: number) => void
  disabled: boolean
  min: number
  max: number
}) {
  const canDown = !disabled && value > min
  const canUp = !disabled && value < max

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '9px 12px', borderRadius: DT.radiusSm,
      background: DT.cream, border: `1px solid ${DT.line}`,
    }}>
      <span style={{
        minWidth: '62px', fontSize: '13px', fontWeight: 800, color: DT.ink, fontFamily: DT.body,
      }}>
        {label}
      </span>
      <IconButton Icon={Minus} label={`Bajar ${label.toLowerCase()}`} onClick={() => canDown && onChange(value - 1)} disabled={!canDown} />
      <span
        aria-live="polite"
        style={{
          minWidth: '26px', textAlign: 'center', fontSize: '17px', fontWeight: 800,
          color: DT.ink, fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      <IconButton Icon={Plus} label={`Subir ${label.toLowerCase()}`} onClick={() => canUp && onChange(value + 1)} disabled={!canUp} />
    </div>
  )
}

export default function AjusteDificultad({
  isReal, storeId, userId, initial,
}: {
  isReal: boolean
  storeId: string
  userId?: string
  initial: ChildLevel | null
}) {
  const [level, setLevel] = useState<ChildLevel>(initial ?? { min: LEVEL_MIN, max: LEVEL_MAX })
  const [saved, setSaved] = useState<ChildLevel | null>(initial)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Lo guardado manda sobre lo que traía la tarjeta: si no hay nada guardado se
  // queda el valor que ya mostraba la Carpeta.
  useEffect(() => {
    let cancelled = false
    loadChildLevel(isReal, storeId).then(stored => {
      if (cancelled) return
      if (stored) { setLevel(stored); setSaved(stored) }
      setLoaded(true)
    })
    return () => { cancelled = true }
  }, [isReal, storeId])

  function change(next: Partial<ChildLevel>) {
    setLevel(prev => clampLevel({ ...prev, ...next }))
  }

  async function handleSave() {
    setSaving(true)
    const res = await saveChildLevel(isReal, storeId, level, userId)
    setSaving(false)
    if (res.ok) {
      setSaved(level)
      setToast('Guardado.')
    } else {
      setToast('No se pudo guardar. Vuelve a intentarlo.')
    }
    setTimeout(() => setToast(null), 3600)
  }

  const dirty = !saved || saved.min !== level.min || saved.max !== level.max
  const blocked = !loaded || saving

  return (
    <Card>
      <SectionTitle Icon={SlidersHorizontal}>Dificultad</SectionTitle>

      <FieldLabel>Nivel, del {LEVEL_MIN} al {LEVEL_MAX}</FieldLabel>
      <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <Stepper label="Mínimo" value={level.min} onChange={v => change({ min: v })} disabled={blocked} min={LEVEL_MIN} max={level.max} />
        <Stepper label="Máximo" value={level.max} onChange={v => change({ max: v })} disabled={blocked} min={level.min} max={LEVEL_MAX} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={handleSave} disabled={blocked || !dirty}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
        {toast && (
          <span className="dk-fade" style={{ fontSize: '13px', fontWeight: 700, color: DT.azulInk, fontFamily: DT.body }}>{toast}</span>
        )}
      </div>

      <p style={{
        margin: '14px 0 0', fontSize: '12px', fontWeight: 600, lineHeight: 1.5,
        color: DT.muted, fontFamily: DT.body,
      }}>
        La familia ve este nivel. Todavía no cambia los juegos del niño.
      </p>
    </Card>
  )
}
