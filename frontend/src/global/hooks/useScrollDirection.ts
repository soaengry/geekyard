import { useEffect, useRef, useState } from 'react'

type ScrollDirection = 'up' | 'down'

export const useScrollDirection = (threshold = 10) => {
  const [direction, setDirection] = useState<ScrollDirection>('up')
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const diff = currentY - lastScrollY.current

      if (Math.abs(diff) < threshold) return

      setDirection(diff > 0 ? 'down' : 'up')
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return direction
}
