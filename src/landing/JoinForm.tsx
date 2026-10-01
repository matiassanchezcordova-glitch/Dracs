import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

// Formulario "Quiero sumarme". Cada envío llega como correo a dracs@dracs.health
// a través de FormSubmit (formsubmit.co), sin backend propio.
//
// La primera vez que alguien lo envía, FormSubmit manda a dracs@dracs.health un
// correo con el botón "Activate Form". Hasta que se active, el formulario
// ofrece mandar el mismo mensaje con el programa de correo de quien escribe.
// No se pierde nada.

const INBOX = 'dracs@dracs.health'
const ENDPOINT = `https://formsubmit.co/ajax/${INBOX}`

const PROFESSIONS = [
  'Logopedia',
  'Psicología',
  'Terapia ocupacional',
  'Fisioterapia',
  'Educación especial',
  'Otra',
]

const WORKPLACES = [
  'CDIAP o atención temprana',
  'Centro privado',
  'Colegio o CREDA',
  'Por mi cuenta',
  'Otro',
]

const WAYS = [
  { id: 'Probar la demo y opinar', label: 'Probar la demo y darte mi opinión' },
  { id: 'Primer piloto', label: 'Usar Dracs con algunos pacientes en el primer piloto' },
  { id: 'Equipo', label: 'Sumarme al equipo como perfil clínico' },
]

type Status = 'idle' | 'sending' | 'done' | 'error'

function readRef(): string {
  try {
    return new URLSearchParams(window.location.search).get('ref') ?? ''
  } catch {
    return ''
  }
}

export default function JoinForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [name, setName] = useState('')
  const [mailBody, setMailBody] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const nombre = String(data.get('nombre') ?? '').trim()
    const fields: Record<string, string> = {
      'Nombre': nombre,
      'Correo': String(data.get('email') ?? '').trim(),
      'Profesión': String(data.get('profesion') ?? ''),
      'Dónde trabaja': String(data.get('lugar') ?? ''),
      'Ciudad': String(data.get('ciudad') ?? '').trim(),
      'Edades': String(data.get('edades') ?? '').trim(),
      'Cómo quiere participar': data.getAll('participacion').map(String).join(', '),
      'Comentario': String(data.get('comentario') ?? '').trim(),
    }
    const ref = readRef()
    if (ref) fields['Origen'] = ref

    setName(nombre.split(' ')[0] || nombre)
    setMailBody(Object.entries(fields).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n'))
    setStatus('sending')

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...fields,
          _subject: `Dracs · ${nombre} quiere sumarse`,
          _replyto: fields['Correo'],
          _template: 'table',
          _captcha: 'false',
        }),
      })
      const json = await res.json().catch(() => null) as { success?: string | boolean } | null
      const ok = res.ok && json && String(json.success) === 'true'
      if (!ok) throw new Error('envío no confirmado')
      form.reset()
      setStatus('done')
    } catch (err) {
      console.error('[sumarme]', err)
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="lp-form lp-form__done" role="status">
        <p className="lp-sub">Gracias, {name}.</p>
        <p className="lp-p">
          Te escribimos en menos de 48 horas. Mientras tanto, puedes recorrer la demo.
        </p>
        <div className="lp-actions">
          <Link className="lp-btn lp-btn--ghost" to="/demo?como=profesional">Probar la demo</Link>
        </div>
      </div>
    )
  }

  const mailto = `mailto:${INBOX}?subject=${encodeURIComponent('Quiero sumarme a Dracs')}&body=${encodeURIComponent(mailBody)}`

  return (
    <form className="lp-form" onSubmit={handleSubmit}>
      <div className="lp-field lp-field--row">
        <div className="lp-field">
          <label htmlFor="lp-nombre">Nombre</label>
          <input className="lp-input" id="lp-nombre" name="nombre" autoComplete="name" required maxLength={120} />
        </div>
        <div className="lp-field">
          <label htmlFor="lp-email">Correo</label>
          <input className="lp-input" id="lp-email" name="email" type="email" autoComplete="email" required maxLength={200} />
        </div>
      </div>

      <div className="lp-field lp-field--row">
        <div className="lp-field">
          <label htmlFor="lp-profesion">Profesión</label>
          <select className="lp-input" id="lp-profesion" name="profesion" required defaultValue="">
            <option value="" disabled>Elige una opción</option>
            {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="lp-field">
          <label htmlFor="lp-lugar">Dónde trabajas</label>
          <select className="lp-input" id="lp-lugar" name="lugar" required defaultValue="">
            <option value="" disabled>Elige una opción</option>
            {WORKPLACES.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>

      <div className="lp-field lp-field--row">
        <div className="lp-field">
          <label htmlFor="lp-ciudad">Ciudad</label>
          <input className="lp-input" id="lp-ciudad" name="ciudad" autoComplete="address-level2" maxLength={80} />
        </div>
        <div className="lp-field">
          <label htmlFor="lp-edades">Edades con las que trabajas</label>
          <input className="lp-input" id="lp-edades" name="edades" placeholder="Por ejemplo, de 3 a 8 años" maxLength={80} />
        </div>
      </div>

      <fieldset className="lp-field">
        <legend>Cómo quieres participar</legend>
        <div className="lp-checks">
          {WAYS.map(w => (
            <label key={w.id} className="lp-check">
              <input type="checkbox" name="participacion" value={w.id} />
              <span>{w.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="lp-field">
        <label htmlFor="lp-comentario">
          Algo que quieras contarnos <span className="lp-optional">(opcional)</span>
        </label>
        <textarea className="lp-input" id="lp-comentario" name="comentario" maxLength={2000} />
      </div>

      <label className="lp-check lp-check--consent">
        <input type="checkbox" name="consent" required />
        <span>
          Acepto que Dracs use estos datos para contactarme. <Link to="/privacidad">Privacidad</Link>
        </span>
      </label>

      {status === 'error' && (
        <p className="lp-form__error" role="alert">
          No pudimos enviarlo. Puedes mandarlo desde tu correo con un clic:{' '}
          <a href={mailto}>escribir a {INBOX}</a>.
        </p>
      )}

      <div className="lp-actions">
        <button className="lp-btn lp-btn--primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </form>
  )
}
