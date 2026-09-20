// Enfocar el mundo de {Nombre} — personalización real (Phase 3).
//
// El terapeuta: (1) elige áreas de foco, (2) escribe una nota de contexto (no se
// parsea en v1; se guarda), (3) ve juegos recomendados de forma determinista
// sobre las etiquetas y (4) fija un set de énfasis que se persiste en el niño.
// Sin claims: cada juego se justifica con "Trabaja {área}, en {lugar}."
//
// Los juegos fijados llegan a la familia como "una cosa para hoy".
//
// Color: marcar un área o fijar un juego es elegir, y elegir va en azul, igual
// que los chips del Informe. El amarillo queda para la acción de la tarjeta,
// Guardar enfoque.

import { useEffect, useMemo, useState } from 'react'
import { Target, PushPin, MapPin, GameController } from '@phosphor-icons/react'
import { DT, FIELD } from './deskTokens'
import { Button, Card, EmptyState, FieldLabel, SectionTitle, ToggleChip } from './deskUI'
import { SKILL_ORDER, SKILL_LABELS } from './labels'
import { recommendGames, type RecommendResult } from './recommendGames'
import { loadChildFocus, saveChildFocus } from './childFocus'

const MAX_SHOWN = 10

export default function EnfocarMundo({
  childName, isReal, storeId, onAreasChange,
}: {
  childName: string
  isReal: boolean
  storeId: string
  // Las áreas marcadas, hacia arriba: los Objetivos del Plan cuelgan de ellas
  // y tienen que verlas al momento, no sólo al guardar.
  onAreasChange?: (areas: string[]) => void
}) {
  const recommendChildId = isReal ? storeId : null

  const [loaded, setLoaded] = useState(false)
  const [areas, setAreas] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [emphasis, setEmphasis] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Recomendación cacheada por clave (áreas + niño), para no resetear estado de
  // forma síncrona dentro del efecto.
  const [rec, setRec] = useState<{ key: string; result: RecommendResult } | null>(null)
  const areasKey = useMemo(() => [...areas].sort().join(',') + '|' + storeId, [areas, storeId])

  // Cargar el enfoque persistido al montar.
  useEffect(() => {
    let cancelled = false
    loadChildFocus(isReal, storeId).then(f => {
      if (cancelled) return
      setAreas(f.areas); setNote(f.note); setEmphasis(new Set(f.emphasis)); setLoaded(true)
    })
    return () => { cancelled = true }
  }, [isReal, storeId])

  // Avisar de las áreas marcadas a quien cuelgue de ellas.
  useEffect(() => { onAreasChange?.(areas) }, [areas, onAreasChange])

  // Recalcular recomendaciones cuando cambian las áreas.
  useEffect(() => {
    if (areas.length === 0) return
    let cancelled = false
    recommendGames(areas, recommendChildId).then(result => {
      if (!cancelled) setRec({ key: areasKey, result })
    })
    return () => { cancelled = true }
  }, [areasKey, areas, recommendChildId])

  const recReady = rec !== null && rec.key === areasKey
  const recLoading = areas.length > 0 && !recReady

  function toggleArea(slug: string) {
    setAreas(prev => prev.includes(slug) ? prev.filter(a => a !== slug) : [...prev, slug])
  }
  function togglePin(id: string) {
    setEmphasis(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  async function handleSave() {
    setSaving(true)
    const res = await saveChildFocus(isReal, storeId, { areas, note, emphasis: [...emphasis] })
    setSaving(false)
    // Al guardar, el terapeuta sabe que el énfasis ya llega a la familia (sin
    // números ni claims). Solo cuando hay juegos fijados: un guardado vacío no
    // alimenta "una cosa para hoy" (la familia ve el lugar del día).
    setToast(!res.ok
      ? 'No se pudo guardar. Vuelve a intentarlo.'
      : emphasis.size > 0
        ? 'Guardado. La familia ya lo ve.'
        : 'Guardado.')
    setTimeout(() => setToast(null), 3600)
  }

  const items = recReady ? rec!.result.items : []
  const shown = items.slice(0, MAX_SHOWN)

  return (
    <Card>
      <SectionTitle Icon={Target}>Enfocar el mundo de {childName}</SectionTitle>

      {/* Áreas de foco */}
      <FieldLabel>Áreas de foco</FieldLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {SKILL_ORDER.map(slug => (
          <ToggleChip key={slug} on={areas.includes(slug)} onClick={() => toggleArea(slug)}>
            {SKILL_LABELS[slug]}
          </ToggleChip>
        ))}
      </div>

      {/* Nota de contexto */}
      <FieldLabel>Nota</FieldLabel>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder={`Dificultades, objetivos o intereses de ${childName}.`}
        aria-label="Nota de contexto"
        rows={3}
        style={{ ...FIELD, resize: 'vertical', maxHeight: '200px', marginBottom: '20px' }}
      />

      {/* Juegos sugeridos */}
      <FieldLabel>Juegos sugeridos</FieldLabel>
      {areas.length === 0 ? (
        <EmptyState Icon={Target} title="Marca un área para ver sus juegos" compact />
      ) : recLoading ? (
        <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Buscando juegos…</p>
      ) : items.length === 0 ? (
        <EmptyState Icon={GameController} title="Todavía no tenemos juegos para esas áreas" compact />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {shown.map(g => {
            const pinned = emphasis.has(g.id)
            return (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                borderRadius: DT.radiusSm, background: DT.cream,
                border: `1px solid ${pinned ? DT.azulTintLine : DT.lineSoft}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: DT.ink, fontFamily: DT.display }}>{g.title}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: DT.muted, fontFamily: DT.body, display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                    <MapPin size={13} weight="regular" color={DT.azulInk} /> {g.rationale}
                  </p>
                </div>
                <ToggleChip on={pinned} onClick={() => togglePin(g.id)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <PushPin size={15} weight="regular" />
                    {pinned ? 'Fijado' : 'Fijar'}
                  </span>
                </ToggleChip>
              </div>
            )
          })}
          {items.length > MAX_SHOWN && (
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: DT.muted, fontFamily: DT.body }}>
              y {items.length - MAX_SHOWN} juego{items.length - MAX_SHOWN === 1 ? '' : 's'} más.
            </p>
          )}
        </div>
      )}

      {/* Guardar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '22px', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={handleSave} disabled={saving || !loaded}>
          {saving ? 'Guardando…' : 'Guardar enfoque'}
        </Button>
        <span style={{ fontSize: '13px', color: DT.muted, fontFamily: DT.body }}>
          {emphasis.size > 0 ? `${emphasis.size} juego${emphasis.size === 1 ? '' : 's'} fijado${emphasis.size === 1 ? '' : 's'}.` : 'Sin juegos fijados.'}
        </span>
        {toast && <span className="dk-fade" style={{ fontSize: '13px', fontWeight: 700, color: DT.azulInk, fontFamily: DT.body }}>{toast}</span>}
      </div>
    </Card>
  )
}
