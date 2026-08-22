// Enfocar el mundo de {Nombre} — personalización real (Phase 3).
//
// El terapeuta: (1) elige áreas de foco, (2) escribe una nota de contexto (no se
// parsea en v1; se guarda), (3) ve juegos recomendados de forma determinista
// sobre las etiquetas y (4) fija un set de énfasis que se persiste en el niño.
// Sin claims: cada juego se justifica con "Trabaja {área}, en {lugar}."
//
// Aún NO se conecta al mundo del niño ni a la familia: eso es el paso siguiente.

import { useEffect, useMemo, useState } from 'react'
import { Target, PushPin, MapPin } from '@phosphor-icons/react'
import { DT } from './deskTokens'
import { Card, SectionLabel } from './deskUI'
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
    setToast(res.ok
      ? 'Enfoque guardado.'
      : 'No se pudo guardar. ¿Aplicaste la migración 011?')
    setTimeout(() => setToast(null), 3200)
  }

  const items = recReady ? rec!.result.items : []
  const shown = items.slice(0, MAX_SHOWN)

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '4px' }}>
        <Target size={20} weight="duotone" color={DT.azul} />
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: DT.ink, fontFamily: DT.display }}>
          Enfocar el mundo de {childName}
        </h3>
      </div>
      <p style={{ margin: '0 0 18px', fontSize: '14px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.55 }}>
        Elegí las áreas a priorizar y, si querés, dejá una nota de contexto. Verás juegos que trabajan esas áreas y podés fijar un énfasis para {childName}.
      </p>

      {/* Áreas de foco */}
      <SectionLabel>Áreas de foco</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {SKILL_ORDER.map(slug => {
          const on = areas.includes(slug)
          return (
            <button
              key={slug}
              onClick={() => toggleArea(slug)}
              style={{
                padding: '8px 13px', minHeight: '40px', borderRadius: '999px', cursor: 'pointer',
                border: on ? `1px solid ${DT.azul}` : `1px solid ${DT.line}`,
                background: on ? DT.azul : DT.white,
                color: on ? DT.cream : DT.ink,
                fontSize: '13px', fontWeight: 700, fontFamily: DT.body, transition: 'all 0.14s ease',
              }}
            >
              {SKILL_LABELS[slug]}
            </button>
          )
        })}
      </div>

      {/* Nota de contexto */}
      <SectionLabel>Nota de contexto (opcional)</SectionLabel>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder={`Dificultades, objetivos o intereses de ${childName}. Se guarda como contexto; por ahora no cambia las sugerencias.`}
        rows={3}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: DT.radiusSm,
          border: `1.5px solid ${DT.line}`, background: DT.white, color: DT.ink, fontSize: '14px',
          fontFamily: DT.body, resize: 'vertical', maxHeight: '200px', outline: 'none', lineHeight: 1.6, marginBottom: '20px',
        }}
      />

      {/* Juegos sugeridos */}
      <SectionLabel>Juegos sugeridos</SectionLabel>
      {areas.length === 0 ? (
        <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.6 }}>
          Elegí una o más áreas arriba para ver juegos sugeridos para {childName}.
        </p>
      ) : recLoading ? (
        <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Buscando juegos…</p>
      ) : recReady && !rec!.result.available ? (
        <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.6 }}>
          Todavía no podemos sugerir juegos: falta clasificar los juegos por área. Aparecerán en cuanto se aplique el etiquetado.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Áreas elegidas sin juegos */}
          {recReady && rec!.result.emptyAreas.map(a => (
            <p key={a} style={{ margin: 0, fontSize: '13px', color: DT.muted, fontFamily: DT.body }}>
              Todavía no tenemos juegos para <strong style={{ color: DT.ink, fontWeight: 700 }}>{SKILL_LABELS[a] ?? a}</strong>.
            </p>
          ))}

          {shown.map(g => {
            const pinned = emphasis.has(g.id)
            return (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                borderRadius: DT.radiusSm, background: pinned ? '#FDF4D6' : DT.cream,
                border: `1px solid ${pinned ? DT.yellow : DT.line}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>{g.title}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: DT.muted, fontFamily: DT.body, display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                    <MapPin size={13} weight="duotone" color={DT.azul} /> {g.rationale}
                  </p>
                </div>
                <button
                  onClick={() => togglePin(g.id)}
                  aria-pressed={pinned}
                  title={pinned ? 'Quitar del énfasis' : 'Fijar al énfasis'}
                  style={{
                    flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px',
                    height: '38px', padding: '0 13px', borderRadius: DT.radiusSm, cursor: 'pointer',
                    border: pinned ? 'none' : `1px solid ${DT.line}`,
                    background: pinned ? DT.yellow : DT.white, color: DT.ink,
                    fontSize: '13px', fontWeight: 700, fontFamily: DT.body,
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
          style={{
            padding: '11px 22px', borderRadius: DT.radiusSm, border: 'none',
            background: DT.yellow, color: DT.ink, fontSize: '14px', fontWeight: 700, fontFamily: DT.body,
            cursor: saving ? 'default' : 'pointer', opacity: saving || !loaded ? 0.55 : 1,
          }}
        >
          {saving ? 'Guardando…' : 'Guardar enfoque'}
        </button>
        <span style={{ fontSize: '13px', color: DT.muted, fontFamily: DT.body }}>
          {emphasis.size > 0 ? `${emphasis.size} juego${emphasis.size === 1 ? '' : 's'} en el énfasis.` : 'Sin juegos fijados todavía.'}
        </span>
        {toast && <span style={{ fontSize: '13px', fontWeight: 700, color: DT.azul, fontFamily: DT.body }}>{toast}</span>}
      </div>
    </Card>
  )
}
