import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { type Patient } from '../../data/patients'

interface Props {
  patient: Patient
}

/** Custom tooltip for the chart */
function ChartTooltip(props: Record<string, unknown>) {
  const { active, payload, label } = props as {
    active?: boolean
    payload?: { value: number }[]
    label?: string
  }
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: 0, fontSize: '15px', color: '#0EA5E9', fontWeight: 700 }}>
        {payload[0].value}%
      </p>
    </div>
  )
}

/** Small stat card */
function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: 'positive' | 'negative' | 'neutral'
}) {
  const valueColor =
    highlight === 'positive'
      ? '#22C55E'
      : highlight === 'negative'
        ? '#F87171'
        : '#0F172A'

  return (
    <div
      className="flex flex-col gap-1 px-5 py-4 flex-1"
      style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', minWidth: '0' }}
    >
      <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '22px', color: valueColor, fontWeight: 700, lineHeight: 1.1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export default function PatientDetail({ patient: p }: Props) {
  const pct = p.metrics.progressPct
  const progressLabel = `${pct > 0 ? '+' : ''}${pct}%`
  const progressHighlight: 'positive' | 'negative' | 'neutral' =
    pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral'

  return (
    <div className="flex flex-col gap-6 px-8 py-6" style={{ minHeight: '100%' }}>
      {/* ── Patient header ──────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#F0F9FF',
            fontSize: '36px',
          }}
        >
          {p.avatar}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#0F172A', fontWeight: 700 }}>
            {p.name}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
            {p.age} años · {p.condition} · {p.area}
          </p>
        </div>
      </div>

      {/* ── Metrics row ─────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <MetricCard
          label="Sesiones esta semana"
          value={`${p.metrics.sessionsThisWeek}/${p.metrics.sessionsTarget}`}
          sub={p.metrics.sessionsThisWeek >= p.metrics.sessionsTarget ? '✅ Objetivo cumplido' : 'En progreso'}
          highlight={p.metrics.sessionsThisWeek >= p.metrics.sessionsTarget ? 'positive' : 'neutral'}
        />
        <MetricCard
          label="Duración media"
          value={`${p.metrics.avgDuration} min`}
          sub="por sesión"
        />
        <MetricCard
          label={`Progreso · ${p.area.split(' ')[0]}`}
          value={progressLabel}
          sub="vs. 4 semanas atrás"
          highlight={progressHighlight}
        />
      </div>

      {/* ── Progress chart ──────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #F1F5F9',
          padding: '20px 20px 12px',
        }}
      >
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
          Progreso semanal (% aciertos)
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={p.weeklyProgress} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}
            />
            <YAxis
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Poppins, sans-serif' }}
              tickFormatter={v => `${v}%`}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#E0F2FE', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#0EA5E9"
              strokeWidth={2.5}
              dot={{ fill: '#0EA5E9', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#0EA5E9', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent sessions ─────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #F1F5F9',
          overflow: 'hidden',
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #F8FAFC' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
            Últimas sesiones
          </p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC' }}>
              {['Fecha', 'Duración', 'Ejercicios', 'Aciertos'].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '8px 20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    color: '#94A3B8',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.recentSessions.map((s, i) => (
              <tr
                key={i}
                style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : 'none' }}
              >
                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#0F172A', fontWeight: 500 }}>
                  {s.date}
                </td>
                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#64748B' }}>
                  {s.duration} min
                </td>
                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#64748B' }}>
                  {s.exercises}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <AccuracyBadge value={s.accuracy} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Notes ───────────────────────────────────────────────────── */}
      {p.notes && (
        <div
          style={{
            backgroundColor: '#FFFBEB',
            borderRadius: '12px',
            border: '1px solid #FEF3C7',
            padding: '12px 16px',
          }}
        >
          <p style={{ margin: 0, fontSize: '12px', color: '#92400E', fontWeight: 500 }}>
            📝 {p.notes}
          </p>
        </div>
      )}

      {/* ── Action buttons ──────────────────────────────────────────── */}
      <div className="flex gap-3 pb-2">
        <button
          style={{
            flex: 1,
            padding: '11px 20px',
            borderRadius: '12px',
            border: '1.5px solid #E2E8F0',
            backgroundColor: '#ffffff',
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>
            Ajustar objetivos
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#94A3B8',
              backgroundColor: '#F1F5F9',
              borderRadius: '6px',
              padding: '2px 7px',
              letterSpacing: '0.04em',
            }}
          >
            PRÓXIMAMENTE
          </span>
        </button>

        <button
          onClick={() => alert('Informe generado correctamente ✓')}
          style={{
            flex: 1,
            padding: '11px 20px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#0EA5E9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'Poppins, sans-serif',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600 }}>
            ↓ Descargar informe
          </span>
        </button>
      </div>
    </div>
  )
}

function AccuracyBadge({ value }: { value: number }) {
  const color = value >= 80 ? '#22C55E' : value >= 60 ? '#FBBF24' : '#F87171'
  const bg = value >= 80 ? '#F0FDF4' : value >= 60 ? '#FFFBEB' : '#FFF1F2'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 9px',
        borderRadius: '20px',
        backgroundColor: bg,
        color,
        fontSize: '12px',
        fontWeight: 700,
      }}
    >
      {value}%
    </span>
  )
}
