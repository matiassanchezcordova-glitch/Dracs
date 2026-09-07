// Ajuste de dificultad — el rango de nivel del niño, editable desde la Carpeta.
//
// Reusa el nivel que ya existe (child_assignments, lo mismo que lee
// getCurrentLevel y lo mismo que ve la familia). No es una valoración: es el
// rango con el que el terapeuta decide trabajar, y se guarda tal cual.
//
// Honestidad: hoy este rango es el nivel registrado del niño. La sesión del
// niño todavía se arma con su propio nivel de juego, así que la línea del pie
// dice qué hace y qué no, sin prometer lo que aún no pasa.

import { useEffect, useState } from 'react'
import { Minus, Plus, SlidersHorizontal } from '@phosphor-icons/react'
import { DT } from './deskTokens'
import { Card, SectionLabel } from './deskUI'
import { LEVEL_MAX, LEVEL_MIN, clampLevel, loadChildLevel, saveChildLevel, type ChildLevel } from './childLevel'

const STEPS = [1, 2, 3, 4, 5]

function Stepper({ label, value, onChange, disabled, min, max }: {
  label: string
  value: number
  onChange: (v: number) => void
  disabled: boolean
  min: number
  max: number
}) {
  const btn = (enabled: boolean): React.CSSProperties => ({
    width: '34px', height: '34px', borderRadius: DT.radiusSm, flexShrink: 0,
    border: `1px solid ${DT.line}`, background: DT.white, color: enabled ? DT.ink : DT.faint,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0.5,
  })
  const canDown = !disabled && value > min
  const canUp = !disabled && value < max

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{
        minWidth: '62px', fontSize: '13px', fontWeight: 700, color: DT.muted, fontFamily: DT.body,
      }}>
        {label}
      </span>
      <button
        type="button"
        onClick={() => canDown && onChange(value - 1)}
        disabled={!canDown}
        aria-label={`Bajar ${label.toLowerCase()}`}
        style={btn(canDown)}
      >
        <Minus size={15} weight="regular" />
      </button>
      <span
        aria-live="polite"
        style={{
          minWidth: '26px', textAlign: 'center', fontSize: '17px', fontWeight: 800,
          color: DT.ink, fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => canUp && onChange(value + 1)}
        disabled={!canUp}
        aria-label={`Subir ${label.toLowerCase()}`}
        style={btn(canUp)}
      >
        <Plus size={15} weight="regular" />
      </button>
    </div>
  )
}

export default function AjusteDificultad({
  childName, isReal, storeId, userId, initial, onLevel,
}: {
  childName: string
  isReal: boolean
  storeId: string
  userId?: string
  initial: ChildLevel | null
  // Se llama al cargar lo guardado y al guardar: el chip de nivel de la
  // identidad tiene que decir siempre lo mismo que este control.
  onLevel: (level: ChildLevel) => void
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
      if (stored) { setLevel(stored); setSaved(stored); onLevel(stored) }
      setLoaded(true)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      onLevel(level)
      setToast('Nivel guardado.')
    } else {
      setToast('No se pudo guardar el nivel. Vuelve a intentarlo.')
    }
    setTimeout(() => setToast(null), 3600)
  }

  const dirty = !saved || saved.min !== level.min || saved.max !== level.max
  const blocked = !loaded || saving

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '4px' }}>
        <SlidersHorizontal size={20} weight="regular" color={DT.azul} />
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: DT.ink, fontFamily: DT.display }}>
          Ajuste de dificultad
        </h3>
      </div>
      <p style={{ margin: '0 0 18px', fontSize: '14px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.55 }}>
        El rango de nivel con el que trabajas con {childName}. Súbelo si se le queda
        corto, bájalo si se atasca.
      </p>

      <SectionLabel>Nivel del 1 al 5</SectionLabel>
      {/* Los 5 escalones, con el rango elegido en color: la misma cifra que los
          steppers de abajo, dibujada. */}
      <div
        role="img"
        aria-label={`Nivel ${level.min} a ${level.max} de ${LEVEL_MAX}`}
        style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}
      >
        {STEPS.map(step => {
          const on = step >= level.min && step <= level.max
          return (
            <div key={step} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ height: '8px', borderRadius: '999px', background: on ? DT.azul : DT.arena }} />
              <p style={{
                margin: '5px 0 0', textAlign: 'center', fontSize: '11px', fontWeight: 700,
                color: on ? DT.ink : DT.faint, fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
              }}>
                {step}
              </p>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <Stepper label="Mínimo" value={level.min} onChange={v => change({ min: v })} disabled={blocked} min={LEVEL_MIN} max={level.max} />
        <Stepper label="Máximo" value={level.max} onChange={v => change({ max: v })} disabled={blocked} min={level.min} max={LEVEL_MAX} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={blocked || !dirty}
          style={{
            padding: '11px 22px', borderRadius: DT.radiusSm, border: 'none',
            background: DT.yellow, color: DT.ink, fontSize: '14px', fontWeight: 700, fontFamily: DT.body,
            cursor: blocked || !dirty ? 'default' : 'pointer',
            opacity: blocked || !dirty ? 0.55 : 1,
          }}
        >
          {saving ? 'Guardando…' : 'Guardar nivel'}
        </button>
        {toast && (
          <span style={{ fontSize: '13px', fontWeight: 700, color: DT.azul, fontFamily: DT.body }}>{toast}</span>
        )}
      </div>

      <p style={{
        margin: '14px 0 0', fontSize: '12px', fontWeight: 600, lineHeight: 1.5,
        color: DT.faint, fontFamily: DT.body,
      }}>
        Queda guardado como el nivel de {childName}: es el que ves arriba y el que
        ve la familia. Todavía no elige por sí solo los juegos de su sesión.
      </p>
    </Card>
  )
}
