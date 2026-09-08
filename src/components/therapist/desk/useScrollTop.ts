// Arrancar arriba del todo al cambiar de vista.
//
// El escritorio vive dentro de un contenedor con scroll propio, no en el body:
// al cambiar de pantalla, ese contenedor conserva su posición y la vista nueva
// aparece por la mitad o por el final. Esto sube el contenedor que de verdad
// scrollea, buscándolo hacia arriba desde el nodo que se pasa.

import { useEffect, type RefObject } from 'react'

export function useScrollTop(dep: unknown, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    let node: HTMLElement | null = el
    while (node) {
      const overflowY = window.getComputedStyle(node).overflowY
      if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
        // scrollTo y no scrollTop = 0: asignar sobre un nodo que viene de una
        // ref hace saltar la regla de inmutabilidad, y esto no muta props.
        node.scrollTo({ top: 0 })
        break
      }
      node = node.parentElement
    }
    window.scrollTo(0, 0)
  }, [dep, ref])
}
