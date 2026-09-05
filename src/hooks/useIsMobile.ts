import { useEffect, useState } from 'react'

const MOBILE_QUERY = '(pointer: coarse)'

/**
 * Detects touch-primary devices (phones/tablets) via `(pointer: coarse)`.
 * Used to show the on-screen D-pad and pause button only on mobile.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(MOBILE_QUERY).matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
