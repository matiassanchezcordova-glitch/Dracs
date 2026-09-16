// Enfocar el mundo de {Nombre} — personalización real (Phase 3).
//
// El terapeuta: (1) elige áreas de foco, (2) escribe una nota de contexto (no se
// parsea en v1; se guarda), (3) ve juegos recomendados de forma determinista
// sobre las etiquetas y (4) fija un set de énfasis que se persiste en el niño.
// Sin claims: cada juego se justifica con "Trabaja {área}, en {lugar}."
//
// Aún NO se conecta al mundo del niño ni a la familia: eso es el paso siguiente.

import { useEffect, useMemo, useState } from 'react'
import { Target, PushPin, MapPin, GameController } from '@phosphor-icons/react'
import { DT } from './deskTokens'
import { Card, EmptyState, FieldLabel, SectionTitle } from './deskUI'
import { SKILL_ORDER, SKILL_LABELS } from './labels'
import { recommendGames, type RecommendResult } from './recommendGames'
import { loadChildFocus, saveChildFocus } from './childFocus'

const MAX_SHOWN = 10

export default function EnfocarMundo({
  childName, isReal, storeId,
}: { childName: string; isReal: boolean; storeId: string }) {
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
        ? 'Guardado. En casa aparecerá en "una cosa para hoy".'
        : 'Enfoque guardado.')
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
        {SKILL_ORDER.map(slug => {
          const on = areas.includes(slug)
          return (
            <button
              key={slug}
              onClick={() => toggleArea(slug)}
              className="dk-press dk-focus"
              style={{
                padding: '8px 14px', minHeight: '40px', borderRadius: '999px', cursor: 'pointer',
                border: on ? `1px solid ${DT.azul}` : `1px solid ${DT.line}`,
                // Sin seleccionar va en crema: blanco sobre la card blanca no
                // se leería como botón.
                background: on ? DT.azul : DT.cream,
                color: on ? DT.cream : DT.ink,
                fontSize: '13px', fontWeight: 700, fontFamily: DT.body,
                boxShadow: on ? '0 2px 6px rgba(91,136,150,0.28)' : 'none',
              }}
            >
              {SKILL_LABELS[slug]}
            </button>
          )
        })}
      </div>

      {/* Nota de contexto */}
      <FieldLabel>Nota de contexto (opcional)</FieldLabel>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder={`Dificultades, objetivos o intereses de ${childName}.`}
        rows={3}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: DT.radiusSm,
          border: `1px solid ${DT.line}`, background: DT.cream, color: DT.ink, fontSize: '14px',
          fontFamily: DT.body, resize: 'vertical', maxHeight: '200px', outline: 'none', lineHeight: 1.6, marginBottom: '20px',
        }}
      />

      {/* Juegos sugeridos */}
      <FieldLabel>Juegos sugeridos</FieldLabel>
      {areas.length === 0 ? (
        <EmptyState Icon={Target} title="Elige un área y verás juegos" compact>
          En cuanto marques una arriba, aquí salen los juegos que la trabajan, cada
          uno con el lugar donde pasa.
        </EmptyState>
      ) : recLoading ? (
        <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Buscando juegos…</p>
      ) : items.length === 0 ? (
        <EmptyState Icon={GameController} title="Sin juegos para esas áreas" compact>
          Prueba a marcar otra área: el catálogo crece con cada mundo nuevo.
        </EmptyState>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {shown.map(g => {
            const pinned = emphasis.has(g.id)
            return (
              <div key={g.id} className="dk-press" style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                borderRadius: DT.radiusSm, background: pinned ? DT.yellowTint : DT.cream,
                border: `1px solid ${pinned ? DT.yellowTintLine : DT.line}`,
              }}>
                <span aria-hidden style={{
                  width: '34px', height: '34px', flexShrink: 0, borderRadius: '11px',
                  background: pinned ? DT.white : DT.azulTint,
                  border: `1px solid ${pinned ? DT.yellowTintLine : DT.azulTintLine}`,
                  color: pinned ? DT.mostazaInk : DT.azulInk,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GameController size={17} weight="regular" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: DT.ink, fontFamily: DT.display }}>{g.title}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: DT.muted, fontFamily: DT.body, display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                    <MapPin size={13} weight="regular" color={DT.azul} /> {g.rationale}
                  </p>
                </div>
                <button
                  onClick={() => togglePin(g.id)}
                  aria-pressed={pinned}
                  title={pinned ? 'Quitar del énfasis' : 'Fijar al énfasis'}
                  className="dk-press dk-focus"
                  style={{
                    flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px',
                    height: '38px', padding: '0 13px', borderRadius: DT.radiusSm, cursor: 'pointer',
                    border: pinned ? 'none' : `1px solid ${DT.line}`,
                    background: pinned ? DT.yellow : DT.white, color: DT.ink,
                    fontSize: '13px', fontWeight: 700, fontFamily: DT.body,
                    boxShadow: pinned ? '0 1px 2px rgba(51,48,42,0.10), 0 5px 12px rgba(247,195,28,0.26)' : DT.shadowSoft,
                  }}
                >
                  <PushPin size={15} weight={pinned ? 'fill' : 'regular'} />
                  {pinned ? 'Fijado' : 'Fijar'}
                </button>
              </div>
            )
          })}
          {items.length > MAX_SHOWN && (
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: DT.muted, fontFamily: DT.body }}>
              y {items.length - MAX_SHOWN} juego{items.length - MAX_SHOWN === 1 ? '' : 's'} más que también encajan.
            </p>
          )}
        </div>
      )}

      {/* Guardar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '22px', flexWrap: 'wrap' }}>
        <button
          onClick={handleSave}
          disabled={saving || !loaded}
          className="dk-press dk-focus"
          style={{
            padding: '12px 22px', borderRadius: DT.radiusSm, border: 'none',
            background: DT.yellow, color: DT.ink, fontSize: '14px', fontWeight: 700, fontFamily: DT.display,
            cursor: saving ? 'default' : 'pointer', opacity: saving || !loaded ? 0.55 : 1,
            boxShadow: saving || !loaded ? 'none' : '0 1px 2px rgba(51,48,42,0.10), 0 6px 14px rgba(247,195,28,0.28)',
          }}
        >
          {saving ? 'Guardando…' : 'Guardar enfoque'}
        </button>
        <span style={{ fontSize: '13px', color: DT.muted, fontFamily: DT.body }}>
          {emphasis.size > 0 ? `${emphasis.size} juego${emphasis.size === 1 ? '' : 's'} en el énfasis.` : 'Sin juegos fijados todavía.'}
        </span>
        {toast && <span className="dk-fade" style={{ fontSize: '13px', fontWeight: 700, color: DT.azulInk, fontFamily: DT.body }}>{toast}</span>}
      </div>
    </Card>
  )
}
