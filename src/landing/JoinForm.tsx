import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Formulario "Quiero sumarme". Guarda en la tabla leads_logopedas
// (migración 016). Si la tabla todavía no existe o falla la red, no se pierde
// nada: se ofrece el mismo mensaje armado para mandarlo por correo.

const WORKPLACES = [
  'CDIAP',
  'Centro privado',
  'Colegio o CREDA',
  'Por mi cuenta',
  'Otro',
]

const WAYS = [
  { id: 'probar', label: 'Probar la demo y darte mi opinión' },
  { id: 'piloto', label: 'Usar Dracs con algunos pacientes en el primer piloto' },
  { id: 'equipo', label: 'Sumarme al equipo como perfil clínico' },
]

type Status = 'idle' | 'sending' | 'done' | 'error'

function readRef(): string | null {
  try {
    return new URLSearchParams(window.location.search).get('ref')
  } catch {
    return null
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
    const email = String(data.get('email') ?? '').trim()
    const lugar = String(data.get('lugar') ?? '')
    const ciudad = String(data.get('ciudad') ?? '').trim()
    const edades = String(data.get('edades') ?? '').trim()
    const participacion = data.getAll('participacion').map(String)
    const comentario = String(data.get('comentario') ?? '').trim()

    setName(nombre.split(' ')[0] || nombre)
    setMailBody(
      [
        `Nombre: ${nombre}`,
        `Correo: ${email}`,
        `Dónde trabajo: ${lugar}`,
        `Ciudad: ${ciudad}`,
        `Edades: ${edades}`,
        `Cómo quiero participar: ${participacion.join(', ')}`,
        comentario ? `Comentario: ${comentario}` : '',
      ].filter(Boolean).join('\n'),
    )
    setStatus('sending')

    const { error } = await supabase.from('leads_logopedas').insert({
      nombre,
      email,
      lugar_trabajo: lugar || null,
      ciudad: ciudad || null,
      edades: edades || null,
      participacion,
      comentario: comentario || null,
      origen: readRef(),
    })

    if (error) {
      console.error('[leads_logopedas]', error.message)
      setStatus('error')
      return
    }
    form.reset()
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className="lp-form lp-form__done" role="status">
        <p className="lp-sub">Gracias, {name}.</p>
        <p className="lp-body">
          Te escribimos en menos de 48 horas. Mientras tanto, puedes recorrer la demo como logopeda.
        </p>
        <div className="lp-actions">
          <Link className="lp-btn lp-btn--ghost" to="/demo?como=logopeda">Probar la demo</Link>
        </div>
      </div>
    )
  }

  const mailto = `mailto:dracs@dracs.health?subject=${encodeURIComponent('Quiero sumarme a Dracs')}&body=${encodeURIComponent(mailBody)}`

  return (
    <form className="lp-form" onSubmit={handleSubmit} noValidate={false}>
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
          <label htmlFor="lp-lugar">Dónde trabajas</label>
          <select className="lp-input" id="lp-lugar" name="lugar" required defaultValue="">
            <option value="" disabled>Elige una opción</option>
            {WORKPLACES.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="lp-field">
          <label htmlFor="lp-ciudad">Ciudad</label>
          <input className="lp-input" id="lp-ciudad" name="ciudad" autoComplete="address-level2" maxLength={80} />
        </div>
      </div>

      <div className="lp-field">
        <label htmlFor="lp-edades">Edades con las que trabajas</label>
        <input className="lp-input" id="lp-edades" name="edades" placeholder="Por ejemplo, de 3 a 8 años" maxLength={80} />
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
          Acepto que Dracs guarde estos datos para contactarme. <Link to="/privacidad">Privacidad</Link>
        </span>
      </label>

      {status === 'error' && (
        <p className="lp-form__error" role="alert">
          No pudimos guardar tu mensaje. Puedes enviarlo por correo con un clic:{' '}
          <a href={mailto}>escribir a dracs@dracs.health</a>.
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
