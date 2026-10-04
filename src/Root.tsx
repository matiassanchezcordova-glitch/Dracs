import { useLayoutEffect } from 'react'
import { BrowserRouter, useLocation, useNavigationType } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './router'

// Cada página nueva arranca arriba, sin animar el scroll. Si el enlace trae un
// ancla (/#sumarme), se baja directo a esa sección. Al volver atrás o adelante
// con el navegador (POP) no se toca nada: el navegador restaura donde estabas.
function ScrollManager() {
  const { pathname, search, hash } = useLocation()
  const navType = useNavigationType()

  useLayoutEffect(() => {
    if (navType === 'POP') return
    if (hash) {
      let tries = 0
      const go = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (el) { el.scrollIntoView({ behavior: 'instant', block: 'start' }); return }
        if (tries++ < 30) requestAnimationFrame(go)
      }
      go()
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, search, hash, navType])

  return null
}

export default function Root() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
