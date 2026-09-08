// Informe del período: el mismo dato contado para dos audiencias, revisado y
// firmado por el logopeda, y exportado con la impresión del navegador.
//
// Qué es de verdad y qué no:
//   - el cuerpo sale de las partidas reales del período, y si no hay, lo dice;
//   - el comentario es del logopeda: arranca con un borrador descriptivo y él
//     lo reescribe. Su voz, su firma, su responsabilidad;
//   - exportar es window.print con un CSS de impresión dedicado. Sin backend,
//     sin envío de correo, sin promesas;
//   - lo único que sigue siendo mockup es el pulido con el copiloto, que es
//     opcional y no bloquea nada.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Printer, Copy, FloppyDisk, Sparkle, Check } from '@phosphor-icons/react'
import { DT } from './deskTokens'
import { Card, SectionLabel } from './deskUI'
import { loadChildFocus } from './childFocus'
import {
  fromLocalHistory, rangeFor, rangeLabel, statsFor, localIso,
  type DayRange, type InformeSession, type PeriodId,
} from './informeData'
import { buildBlocks, draftComment, toPlainText, type Version } from './informeText'
import { loadInforme, saveInforme } from './informeStore'

const LEGAL = 'Dracs no es un dispositivo médico. No valora ni diagnostica: el logopeda revisa y firma todo.'

const PERIODS: { id: PeriodId; label: string }[] = [
  { id: 'mes', label: 'Este mes' },
  { id: 'cuatro', label: 'Últimas 4 semanas' },
  { id: 'rango', label: 'Rango de fechas' },
]

const VERSIONS: { id: Version; label: string; hint: string }[] = [
  { id: 'familia', label: 'Para la familia', hint: 'En claro, sin cifras ni jerga.' },
  { id: 'entorno', label: 'Para el entorno', hint: 'Sobria y con los números, para un centro o un seguro.' },
]

// CSS de impresión: al imprimir solo queda el documento. Se oculta por
// visibility y no por display para no descolocar el layout de la página.
const PRINT_CSS = `
.inf-chip { transition: background 0.14s ease, border-color 0.14s ease; }
@media print {
  body * { visibility: hidden !important; }
  .inf-doc, .inf-doc * { visibility: visible !important; }
  .inf-doc {
    position: absolute !important; left: 0 !important; top: 0 !important;
    width: 100% !important; margin: 0 !important; padding: 0 !important;
    border: none !important; box-shadow: none !important; border-radius: 0 !important;
    background: #FFFFFF !important;
  }
  .no-print { display: none !important; }
  /* La app vive dentro de contenedores con scroll: al imprimir tienen que
     soltar la altura para que el informe no se corte en una pantalla. */
  html, body, #root { height: auto !important; overflow: visible !important; }
  @page { margin: 16mm; }
}
@media (prefers-reduced-motion: reduce) {
  .inf-chip { transition: none !important; }
}
`

function longDate(d: Date): string {
  const M = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${d.getDate()} de ${M[d.getMonth()]} de ${d.getFullYear()}`
}

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      className="inf-chip"
      onClick={onClick}
      aria-pressed={on}
      style={{
        padding: '8px 14px', minHeight: '38px', borderRadius: '999px', cursor: 'pointer',
        border: `1px solid ${on ? DT.azul : DT.line}`,
        background: on ? DT.azul : DT.cream,
        color: on ? DT.cream : DT.ink,
        fontSize: '13px', fontWeight: 700, fontFamily: DT.body,
      }}
    >
      {children}
    </button>
  )
}

// Acción del informe. Van las cuatro juntas arriba del documento, como los
// botones de copiar de un bloque de código: icono, nombre y confirmación en el
// mismo sitio, para que se vea sobre qué actúan.
function DocAction({ Icon, label, done, onRun, primary }: {
  Icon: typeof Printer
  label: string
  done?: string
  onRun: () => void | Promise<void>
  primary?: boolean
}) {
  const [flash, setFlash] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  async function run() {
    await onRun()
    if (!done) return
    setFlash(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setFlash(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={run}
      aria-label={label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '7px',
        height: '36px', padding: '0 13px', borderRadius: DT.radiusSm,
        border: primary ? 'none' : `1px solid ${DT.line}`,
        background: flash ? DT.azulTint : primary ? DT.yellow : DT.cream,
        color: DT.ink, fontSize: '13px', fontWeight: 700, fontFamily: DT.body,
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {flash ? <Check size={16} weight="regular" /> : <Icon size={16} weight="regular" />}
      {flash ? done : label}
    </button>
  )
}


interface Props {
  childName: string          // nombre de pila, para el texto
  fullName: string
  age: number
  isReal: boolean
  storeId: string
  therapistId?: string
  therapistName: string
  // Partidas con fecha en cuenta real.
  realSessions: InformeSession[]
  // Historial de la carpeta abierta en la demo.
  demoHistory: { date: string; total: number; correct: number; minutes?: number }[]
  // Distribución por área solo cuando hay juegos etiquetados de verdad.
  areas: { label: string; pct: number }[]
  onToast: (msg: string) => void
}

export default function Informe({
  childName, fullName, age, isReal, storeId, therapistId, therapistName,
  realSessions, demoHistory, areas, onToast,
}: Props) {
  const [periodId, setPeriodId] = useState<PeriodId>('mes')
  const [custom, setCustom] = useState<DayRange>(() => rangeFor('cuatro'))
  const [version, setVersion] = useState<Version>('familia')
  // El texto propio del logopeda. `null` significa que todavía no ha escrito:
  // mientras tanto se muestra el borrador derivado de los datos, que se rehace
  // solo al cambiar de período o de versión. En cuanto escribe, mandan sus
  // palabras y el borrador ya no vuelve a pisarlas.
  const [ownComment, setOwnComment] = useState<string | null>(null)
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState('')

  // Las partidas del período: de Supabase en cuenta real, y del historial de
  // la carpeta abierta en la demo.
  const sessions: InformeSession[] = useMemo(
    () => (isReal ? realSessions : fromLocalHistory(demoHistory)),
    [isReal, realSessions, demoHistory],
  )

  const range = useMemo(() => rangeFor(periodId, custom), [periodId, custom])
  const stats = useMemo(() => statsFor(sessions, range), [sessions, range])

  const input = useMemo(
    () => ({ childName, stats, areas, focusAreas }),
    [childName, stats, areas, focusAreas],
  )
  const blocks = useMemo(() => buildBlocks(version, input), [version, input])
  const draft = useMemo(() => draftComment(version, input), [version, input])
  const comment = ownComment ?? draft

  // Áreas de foco vigentes del Plan.
  useEffect(() => {
    let cancelled = false
    loadChildFocus(isReal, storeId).then(f => {
      if (!cancelled) setFocusAreas(f.areas)
    })
    return () => { cancelled = true }
  }, [isReal, storeId])

  // Lo último guardado: período, versión y comentario.
  useEffect(() => {
    let cancelled = false
    loadInforme(isReal, storeId).then(saved => {
      if (cancelled) return
      if (saved) {
        setPeriodId(saved.periodId)
        if (saved.periodId === 'rango') setCustom({ from: saved.from, to: saved.to })
        setVersion(saved.version)
        if (saved.comment.trim()) setOwnComment(saved.comment)
        setSavedAt(saved.savedAt)
      }
      setLoaded(true)
    })
    return () => { cancelled = true }
  }, [isReal, storeId])

  // La versión de la familia se ve cálida (bloques en crema, más aire); la del
  // entorno, sobria (etiquetas chicas y texto corrido).
  const warm = version === 'familia'
  const title = warm ? 'Informe de seguimiento' : 'Informe de seguimiento del período'
  const childLine = `${fullName}, ${age} años`
  const periodLine = `Período: ${rangeLabel(range)}`
  const signature = `${therapistName} · ${longDate(new Date())}`

  async function handleSave() {
    // Antes de que termine de cargar lo guardado, guardar escribiría el
    // borrador derivado encima del comentario que ya había.
    if (!loaded || saving) return
    setSaving(true)
    const res = await saveInforme(isReal, storeId, {
      periodId, from: range.from, to: range.to, version, comment,
      savedAt: new Date().toISOString(),
    }, therapistId)
    setSaving(false)
    if (!res.ok) { onToast('No se pudo guardar el informe. Prueba otra vez.'); return }
    setSavedAt(new Date().toISOString())
    onToast(res.stored === 'base' ? 'Informe guardado.' : 'Informe guardado en este navegador.')
  }

  async function handleCopy() {
    const text = toPlainText({ title, childLine, periodLine, blocks, comment, signature, legal: LEGAL })
    try {
      await navigator.clipboard.writeText(text)
      onToast('Informe copiado al portapapeles.')
    } catch {
      onToast('El navegador no dejó copiar. Selecciona el texto y cópialo a mano.')
    }
  }

  // Enganche opcional con el copiloto. Sigue siendo un mockup y no bloquea
  // nada: el informe ya está redactado sin él.
  function handleAskDracs() {
    // Le pasamos las líneas ya derivadas del período abierto: el copiloto no
    // tiene acceso a este paciente, así que sin esto hablaría de memoria.
    const summary = blocks
      .flatMap(b => b.lines)
      .filter(l => !/^\d/.test(l))
      .slice(0, 3)
    window.dispatchEvent(new CustomEvent('dracs-copilot-open', {
      detail: { intent: 'redacta', childName, summary },
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <style>{PRINT_CSS}</style>

      {/* ── Controles ───────────────────────────────────────────── */}
      <Card className="no-print">
        <SectionLabel>Período</SectionLabel>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {PERIODS.map(p => (
            <Chip key={p.id} on={periodId === p.id} onClick={() => setPeriodId(p.id)}>{p.label}</Chip>
          ))}
        </div>

        {periodId === 'rango' && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {([['from', 'Desde'], ['to', 'Hasta']] as const).map(([field, label]) => (
              <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: DT.muted, fontFamily: DT.body }}>{label}</span>
                <input
                  type="date"
                  value={custom[field]}
                  max={localIso(new Date())}
                  onChange={e => setCustom(prev => ({ ...prev, [field]: e.target.value }))}
                  style={{
                    height: '40px', padding: '0 12px', borderRadius: DT.radiusSm,
                    border: `1px solid ${DT.line}`, background: DT.cream, color: DT.ink,
                    fontSize: '14px', fontFamily: DT.body, outline: 'none',
                  }}
                />
              </label>
            ))}
          </div>
        )}

        <SectionLabel>Versión</SectionLabel>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {VERSIONS.map(v => (
            <Chip key={v.id} on={version === v.id} onClick={() => setVersion(v.id)}>{v.label}</Chip>
          ))}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: '13px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.55 }}>
          {VERSIONS.find(v => v.id === version)?.hint}
        </p>
      </Card>

      {/* ── Comentario del logopeda ─────────────────────────────── */}
      <Card className="no-print">
        <SectionLabel>Tu comentario</SectionLabel>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.55 }}>
          Ajústalo con tus palabras.
        </p>
        <textarea
          value={comment}
          onChange={e => setOwnComment(e.target.value)}
          rows={5}
          aria-label="Comentario del logopeda para el informe"
          style={{
            width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: DT.radiusSm,
            border: `1px solid ${DT.line}`, background: DT.cream, color: DT.ink, fontSize: '14px',
            fontFamily: DT.body, resize: 'vertical', maxHeight: '320px', outline: 'none', lineHeight: 1.6,
          }}
        />
      </Card>

      {/* ── El documento ────────────────────────────────────────── */}
      {/* Esto es lo que se imprime y lo que se copia: encabezado del niño,
          cuerpo desde los datos, comentario firmado y el aviso al pie. Las
          cuatro acciones viven aquí arriba, sobre el documento al que aplican. */}
      <Card className="inf-doc">
        <div className="no-print" style={{
          display: 'flex', gap: '7px', flexWrap: 'wrap', justifyContent: 'flex-end', marginBottom: '14px',
        }}>
          <DocAction Icon={Sparkle} label="Redactar con Dracs" done="Se lo pedí" onRun={handleAskDracs} />
          <DocAction Icon={Copy} label="Copiar" done="Copiado" onRun={handleCopy} />
          <DocAction Icon={Printer} label="Imprimir" onRun={() => window.print()} />
          <DocAction Icon={FloppyDisk} label={saving ? 'Guardando…' : 'Guardar'} done="Guardado" onRun={handleSave} primary />
        </div>

        <header style={{ borderBottom: `1px solid ${DT.line}`, paddingBottom: '14px', marginBottom: '18px' }}>
          <p style={{
            margin: 0, fontSize: '20px', fontWeight: 700, color: DT.ink,
            fontFamily: DT.display, lineHeight: 1.25,
          }}>
            {title}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '14px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>
            {childLine}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: DT.muted, fontFamily: DT.body }}>
            {periodLine}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: DT.muted, fontFamily: DT.body }}>
            {version === 'familia' ? 'Versión para la familia' : 'Versión para el entorno'}
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: warm ? '18px' : '16px' }}>
          {blocks.map(b => (
            <section key={b.title}>
              <p style={{
                margin: '0 0 7px',
                fontSize: warm ? '15px' : '11px',
                fontWeight: warm ? 700 : 800,
                letterSpacing: warm ? 'normal' : '0.06em',
                textTransform: warm ? 'none' : 'uppercase',
                color: warm ? DT.ink : DT.faint,
                fontFamily: warm ? DT.display : DT.body,
              }}>
                {b.title}
              </p>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '5px',
                padding: warm ? '12px 14px' : 0,
                background: warm ? DT.cream : 'transparent',
                border: warm ? `1px solid ${DT.line}` : 'none',
                borderRadius: warm ? DT.radiusSm : 0,
              }}>
                {b.lines.map((l, i) => (
                  <p key={i} style={{
                    margin: 0, fontSize: warm ? '14.5px' : '13.5px',
                    lineHeight: warm ? 1.65 : 1.55,
                    color: DT.ink, fontFamily: DT.body,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {l}
                  </p>
                ))}
              </div>
            </section>
          ))}

          {comment.trim() && (
            <section>
              <p style={{
                margin: '0 0 7px',
                fontSize: warm ? '15px' : '11px',
                fontWeight: warm ? 700 : 800,
                letterSpacing: warm ? 'normal' : '0.06em',
                textTransform: warm ? 'none' : 'uppercase',
                color: warm ? DT.ink : DT.faint,
                fontFamily: warm ? DT.display : DT.body,
              }}>
                Comentario del logopeda
              </p>
              <p style={{
                margin: 0, whiteSpace: 'pre-wrap', fontSize: warm ? '14.5px' : '13.5px',
                lineHeight: 1.65, color: DT.ink, fontFamily: DT.body,
              }}>
                {comment.trim()}
              </p>
            </section>
          )}
        </div>

        <footer style={{ marginTop: '22px', paddingTop: '14px', borderTop: `1px solid ${DT.line}` }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>
            {signature}
          </p>
          <p style={{ margin: '10px 0 0', fontSize: '11px', fontWeight: 600, lineHeight: 1.5, color: DT.faint, fontFamily: DT.body }}>
            {LEGAL}
          </p>
          {savedAt && (
            <p className="no-print" style={{ margin: '10px 0 0', fontSize: '12px', color: DT.faint, fontFamily: DT.body }}>
              Guardado el {longDate(new Date(savedAt))}.
            </p>
          )}
        </footer>
      </Card>
    </div>
  )
}
