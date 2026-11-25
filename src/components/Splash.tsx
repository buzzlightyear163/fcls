import { useEffect, useRef, useState } from 'react'
import { useMarket } from '../hooks/market'
import { brand } from '../data/brand'
import { noiseChar } from '../lib/random'
import { GrainField } from './GrainField'
import { BrandMark, Wordmark } from './primitives'

const KEY = 'fcls.splash.v1'
const FRAME = 1000 / 30

type Ch = { char: string; noise: boolean; lead: boolean }
const toChars = (n: number): Ch[] =>
  String(n)
    .padStart(3, '0')
    .split('')
    .map((c, i) => ({ char: c, noise: false, lead: i < 3 - String(n).length }))

/** 001% → 100% med brus, samma rytm som referensen */
function Count({ done }: { done: boolean }) {
  const [chars, setChars] = useState<Ch[]>(() => toChars(1))
  const doneRef = useRef(done)
  doneRef.current = done

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    const changed = [-99, -99, -99]
    let raf = 0
    let lastT = 0
    let frame = 0
    let val = 1
    let prev = 1
    let hit100 = -1
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (t - lastT < FRAME) return
      lastT = t
      frame++
      if (doneRef.current) val += Math.max(3, (100 - val) * 0.4)
      else {
        const target = 1 + 98 * (1 - Math.exp(-(t - t0) / 1100))
        if (Math.random() < 0.7) val += (target - val) * (0.08 + 0.2 * Math.random())
      }
      val = Math.min(doneRef.current ? 100 : 99, val)
      const n = Math.max(1, Math.floor(val))
      const a = String(prev).padStart(3, '0')
      const b = String(n).padStart(3, '0')
      for (let i = 0; i < 3; i++) if (a[i] !== b[i]) changed[i] = frame
      prev = n
      if (n === 100 && hit100 < 0) hit100 = frame
      const base = toChars(n)
      if (reduced || (hit100 >= 0 && frame - hit100 > 5)) {
        setChars(base)
        if (n === 100) cancelAnimationFrame(raf)
        return
      }
      setChars(
        base.map((c, i) =>
          hit100 >= 0 || (changed[i] === frame && Math.random() < 0.35) || Math.random() < (c.lead ? 0.02 : 0.06)
            ? { ...c, char: noiseChar(), noise: true }
            : c,
        ),
      )
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="splash-count" aria-hidden="true">
      {chars.map((c, i) => (
        <span key={i} className={'splash-count-char' + (c.lead && !c.noise ? ' is-lead' : '') + (c.noise ? ' is-noise' : '')}>
          {c.char}
        </span>
      ))}
      <span className="splash-count-pct">%</span>
    </div>
  )
}

export function Splash() {
  const { status } = useMarket()
  const [phase, setPhase] = useState<'show' | 'leaving' | 'gone'>(() =>
    document.documentElement.classList.contains('no-splash') ? 'gone' : 'show',
  )
  const leaveRef = useRef<() => void>(() => {})
  const minDone = useRef(false)
  const statusRef = useRef(status)
  statusRef.current = status

  useEffect(() => {
    if (phase !== 'show') return
    let left = false
    const timers: number[] = []
    const leave = () => {
      if (left) return
      left = true
      setPhase('leaving')
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {
        /* ignore */
      }
      timers.push(
        window.setTimeout(() => {
          document.documentElement.classList.add('no-splash')
          setPhase('gone')
        }, 820),
      )
    }
    leaveRef.current = leave
    timers.push(
      window.setTimeout(() => {
        minDone.current = true
        if (statusRef.current !== 'loading') leave()
      }, 900),
    )
    timers.push(window.setTimeout(leave, 3000))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (status !== 'loading' && minDone.current) leaveRef.current()
  }, [status])

  if (phase === 'gone') return null
  return (
    <div id="splash" className={phase === 'leaving' ? 'splash splash-leave' : 'splash'}>
      <div className="splash-shade" aria-hidden="true" />
      <GrainField splash />
      <div className="splash-lockup" role="status" aria-label={`Loading ${brand.name}`}>
        <div className="splash-brand">
          <BrandMark className="splash-mark" />
          <Wordmark className="splash-wordmark" />
        </div>
        <Count done={phase === 'leaving'} />
      </div>
      <button type="button" className="splash-skip" disabled={phase === 'leaving'} onClick={() => leaveRef.current()}>
        Enter
      </button>
    </div>
  )
}
