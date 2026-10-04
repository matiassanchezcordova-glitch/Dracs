// Informe del período: el mismo dato contado para dos audiencias, revisado y
// firmado por el profesional, y exportado con la impresión del navegador.
//
// Qué es de verdad y qué no:
//   - el cuerpo sale de las partidas reales del período, y si no hay, lo dice;
//   - el comentario es del profesional: arranca con un borrador descriptivo y él
//     lo reescribe ahí mismo, dentro del documento, que es donde se lee. Así
//     el texto sale una sola vez en pantalla. Su voz, su firma;
//   - exportar es window.print con un CSS de impresión dedicado. Sin backend,
//     sin envío de correo, sin promesas;
//   - "Redactar con Dracs" abre el copiloto con las líneas del período. Es
//     opcional y no bloquea nada.

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Printer, Copy, FloppyDisk, Sparkle, Check, CalendarBlank,
} from '@phosphor-icons/react'
import { DT, FIELD } from './deskTokens'
import { Button, Card, FieldLabel, SectionTitle, ToggleChip } from './deskUI'
import { loadChildFocus } from './childFocus'
import {
  fromLocalHistory, rangeFor, rangeLabel, statsFor, localIso,
  type DayRange, type InformeSession, type PeriodId,
} from './informeData'
import { buildBlocks, draftComment, toPlainText, type Version } from './informeText'
import { loadInforme, saveInforme } from './informeStore'

const LEGAL = 'Dracs no es un dispositivo médico. No valora ni diagnostica: el profesional revisa y firma todo.'

const PERIODS: { id: PeriodId; label: string }[] = [
  { id: 'mes', label: 'Este mes' },
  { id: 'cuatro', label: 'Últimas 4 semanas' },
  { id: 'rango', label: 'Rango de fechas' },
]

const VERSIONS: { id: Version; label: string }[] = [
  { id: 'familia', label: 'Para la familia' },
  { id: 'entorno', label: 'Para el colegio o el seguro' },
]

// CSS de impresión: al imprimir solo queda el documento. Se oculta por
// visibility y no por display para no descolocar el layout de la página.
const PRINT_CSS = `
.print-only { display: none; }
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
  .print-only { display: block !important; }
  /* La app vive dentro de contenedores con scroll: al imprimir tienen que
     soltar la altura para que el informe no se corte en una pantalla. */
  html, body, #root { height: auto !important; overflow: visible !important; }
  @page { margin: 16mm; }
}
`

function longDate(d: Date): string {
  const M = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${d.getDate()} de ${M[d.getMonth()]} de ${d.getFullYear()}`
}

// Acción del informe. Van las cuatro juntas arriba del documento, sobre lo que
// actúan, y confirman en el mismo botón.
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
    <Button
      size="sm"
      variant={primary ? 'primary' : 'secondary'}
      Icon={flash ? Check : Icon}
      onClick={run}
      aria-label={label}
    >
      {flash ? done : label}
    </Button>
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
  // El texto propio del profesional. `null` significa que todavía no ha escrito:
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
  const title = 'Informe de seguimiento'
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
    <div className="dk-split dk-split--doc">
      <style>{PRINT_CSS}</style>

      {/* ── Controles ───────────────────────────────────────────── */}
      {/* A la izquierda y fijos al hacer scroll: el documento se lee entero a
          la derecha mientras se cambia el período o la versión. */}
      <Card className="no-print dk-sticky">
        <SectionTitle Icon={CalendarBlank}>Período</SectionTitle>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {PERIODS.map(p => (
            <ToggleChip key={p.id} on={periodId === p.id} onClick={() => setPeriodId(p.id)}>{p.label}</ToggleChip>
          ))}
        </div>

        {periodId === 'rango' && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {([['from', 'Desde'], ['to', 'Hasta']] as const).map(([field, label]) => (
              <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: DT.ink, fontFamily: DT.body }}>{label}</span>
                <input
                  type="date"
                  value={custom[field]}
                  max={localIso(new Date())}
                  onChange={e => setCustom(prev => ({ ...prev, [field]: e.target.value }))}
                  style={{ ...FIELD, height: '44px', padding: '0 12px', width: 'auto', fontWeight: 400 }}
                />
              </label>
            ))}
          </div>
        )}

        <FieldLabel>Versión</FieldLabel>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {VERSIONS.map(v => (
            <ToggleChip key={v.id} on={version === v.id} onClick={() => setVersion(v.id)}>{v.label}</ToggleChip>
          ))}
        </div>
      </Card>

      {/* ── El documento ────────────────────────────────────────── */}
      {/* Esto es lo que se imprime y lo que se copia: encabezado del niño,
          cuerpo desde los datos, comentario firmado y el aviso al pie. El
          comentario se escribe aquí mismo; al imprimir queda como texto. */}
      <Card className="inf-doc" style={{ padding: '28px 32px' }}>
        <div className="no-print" style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', marginBottom: '18px',
        }}>
          <DocAction Icon={Sparkle} label="Redactar con Dracs" done="Se lo pedí" onRun={handleAskDracs} />
          <DocAction Icon={Copy} label="Copiar" done="Copiado" onRun={handleCopy} />
          <DocAction Icon={Printer} label="Imprimir" onRun={() => window.print()} />
          <DocAction Icon={FloppyDisk} label={saving ? 'Guardando…' : 'Guardar'} done="Guardado" onRun={handleSave} primary />
        </div>

        <header style={{ borderBottom: `1px solid ${DT.line}`, paddingBottom: '18px', marginBottom: '22px' }}>
          {/* Membrete: el dragón de la marca sobre el título, como en la web. */}
          <img
            src="/landing/dragon.webp" alt="Dracs" width={30} height={39}
            style={{ display: 'block', width: '30px', height: 'auto', marginBottom: '14px' }}
          />
          <p style={{
            margin: 0, fontSize: '40px', fontWeight: 500, color: DT.ink, letterSpacing: '-0.01em',
            fontFamily: DT.serif, lineHeight: 1.15,
          }}>
            {title}
          </p>
          <p style={{ margin: '10px 0 0', fontSize: '16px', fontWeight: 600, color: DT.ink, fontFamily: DT.body }}>
            {childLine}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>
            {periodLine} · {VERSIONS.find(v => v.id === version)?.label}
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: warm ? '22px' : '18px' }}>
          {blocks.map(b => (
            <section key={b.title}>
              <p style={{
                margin: '0 0 8px',
                fontSize: warm ? '19px' : '12px',
                fontWeight: warm ? 500 : 600,
                letterSpacing: warm ? '-0.005em' : '0.06em',
                textTransform: warm ? 'none' : 'uppercase',
                color: warm ? DT.ink : DT.muted,
                fontFamily: warm ? DT.serif : DT.body,
              }}>
                {b.title}
              </p>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '5px',
                padding: warm ? '14px 16px' : 0,
                background: warm ? DT.cream : 'transparent',
                borderRadius: warm ? DT.radiusSm : 0,
              }}>
                {b.lines.map((l, i) => (
                  <p key={i} style={{
                    margin: 0, fontSize: warm ? '16px' : '14.5px',
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

          <section className={comment.trim() ? undefined : 'no-print'}>
              <p style={{
                margin: '0 0 8px',
                fontSize: warm ? '19px' : '12px',
                fontWeight: warm ? 500 : 600,
                letterSpacing: warm ? '-0.005em' : '0.06em',
                textTransform: warm ? 'none' : 'uppercase',
                color: warm ? DT.ink : DT.muted,
                fontFamily: warm ? DT.serif : DT.body,
              }}>
                Comentario del profesional
              </p>
              <textarea
                className="no-print"
                value={comment}
                onChange={e => setOwnComment(e.target.value)}
                rows={5}
                aria-label="Comentario del profesional"
                style={{ ...FIELD, resize: 'vertical', maxHeight: '320px', fontSize: warm ? '16px' : '14.5px' }}
              />
              <p className="print-only" style={{
                margin: 0, whiteSpace: 'pre-wrap', fontSize: warm ? '14.5px' : '13.5px',
                lineHeight: 1.65, color: DT.ink, fontFamily: DT.body,
              }}>
                {comment.trim()}
              </p>
            </section>
        </div>

        <footer style={{ marginTop: '22px', paddingTop: '14px', borderTop: `1px solid ${DT.line}` }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: DT.ink, fontFamily: DT.body }}>
            {signature}
          </p>
          <p style={{ margin: '10px 0 0', fontSize: '14px', fontWeight: 400, lineHeight: 1.5, color: DT.muted, fontFamily: DT.body }}>
            {LEGAL}
          </p>
          {savedAt && (
            <p className="no-print" style={{ margin: '10px 0 0', fontSize: '14px', color: DT.faint, fontFamily: DT.body }}>
              Guardado el {longDate(new Date(savedAt))}.
            </p>
          )}
        </footer>
      </Card>
    </div>
  )
}
