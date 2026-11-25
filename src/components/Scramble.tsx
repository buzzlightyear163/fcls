import { useEffect, useState } from 'react'
import { cn } from '../lib/format'
import { noiseChar } from '../lib/random'

/**
 * Text som "avkodas" från brustecken (port av referensens beteende).
 * Startar när splashen försvunnit (html.no-splash).
 */
export function Scramble({
  text,
  className,
  delay = 0,
  duration = 900,
}: {
  text: string
  className?: string
  delay?: number
  duration?: number
}) {
  const [shown, setShown] = useState<string | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let start = 0
    const chars = [...text].map((ch, i) => ({ ch, revealAt: (i / Math.max(1, text.length)) * 0.55 + 0.45 * Math.random() }))
    const frame = (t: number) => {
      if (!start) start = t + delay
      const p = (t - start) / duration
      if (p >= 1) {
        setShown(null)
        return
      }
      setShown(chars.map(({ ch, revealAt }) => (ch === ' ' || p > revealAt ? ch : noiseChar())).join(''))
      raf = requestAnimationFrame(frame)
    }
    const run = () => {
      setShown(text.replace(/\S/g, noiseChar))
      raf = requestAnimationFrame(frame)
    }
    const root = document.documentElement
    let mo: MutationObserver | null = null
    if (root.classList.contains('no-splash')) run()
    else {
      mo = new MutationObserver(() => {
        if (root.classList.contains('no-splash')) {
          mo?.disconnect()
          run()
        }
      })
      mo.observe(root, { attributes: true, attributeFilter: ['class'] })
    }
    return () => {
      mo?.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [text, delay, duration])

  return (
    <span className={cn('relative inline-block whitespace-nowrap', className)}>
      <span className={shown === null ? undefined : 'opacity-0'}>{text}</span>
      {shown !== null && (
        <span aria-hidden="true" className="absolute inset-0 overflow-hidden">
          {shown}
        </span>
      )}
    </span>
  )
}
