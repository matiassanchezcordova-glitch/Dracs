import { useEffect, useState } from 'react'

const MOBILE_MAX = 480

function read(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches
}

// Reactive viewport <= 480px detector.
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(read)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`)
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
