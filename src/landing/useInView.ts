import { useEffect, useRef, useState } from 'react'

// Devuelve [ref, visible]. `once`: queda en true la primera vez que entra.
export function useInView<T extends Element>(opts: { once?: boolean; threshold?: number } = {}) {
  const { once = false, threshold = 0.3 } = opts
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        if (once) obs.disconnect()
      } else if (!once) {
        setInView(false)
      }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [once, threshold])
  return [ref, inView] as const
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}
