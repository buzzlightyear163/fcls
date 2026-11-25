import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ColorType,
  CrosshairMode,
  PriceScaleMode,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import { INTERVALS, toCandles, type Candle, type Trade } from '../lib/trades'
import { cn } from '../lib/format'
import { I } from './primitives'

const UP = 'rgb(52, 211, 120)'
const DOWN = 'rgb(255, 77, 94)'
const seg = (on: boolean) =>
  cn(
    'grid h-6 min-w-6 place-items-center rounded px-1.5 text-[11px] font-medium transition-colors focus-visible:outline-1 focus-visible:outline-primary',
    on ? 'bg-neutral-750 text-foreground shadow-sm' : 'text-neutral-500 hover:text-neutral-200',
  )

const fmtV = (v: number) => (v >= 1000 ? v.toFixed(0) : v >= 1 ? v.toFixed(3) : v.toPrecision(4))

export function TokenChart({ symbol, trades, solUsd }: { symbol: string; trades: Trade[]; solUsd: number }) {
  const box = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi>()
  const mainRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'>>()
  const volRef = useRef<ISeriesApi<'Histogram'>>()
  const [iv, setIv] = useState(1) // 5s
  const [metric, setMetric] = useState<'MCap' | 'Price'>('MCap')
  const [cur, setCur] = useState<'SOL' | 'USD'>('SOL')
  const [style, setStyle] = useState<'candles' | 'line'>('candles')
  const [vol, setVol] = useState(true)
  const [log, setLog] = useState(false)
  const [hover, setHover] = useState<Candle | null>(null)

  const candles = useMemo(() => {
    const k = cur === 'USD' ? solUsd : 1
    const val = (t: Trade) => (metric === 'MCap' ? t.mcSol : t.priceSol * 1e9) * k
    return toCandles(trades, INTERVALS[iv][1], val)
  }, [trades, iv, metric, cur, solUsd])
  const candlesRef = useRef<Candle[]>(candles)
  candlesRef.current = candles
  const last = candles[candles.length - 1]
  const shown = hover ?? last

  // Skapa chart en gång
  useEffect(() => {
    if (!box.current) return
    const chart = createChart(box.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgb(96,112,140)',
        fontFamily: "'Geist Variable', Arial, sans-serif",
        fontSize: 11,
        attributionLogo: false,
      },
      grid: { vertLines: { color: 'rgba(159,216,255,0.04)' }, horzLines: { color: 'rgba(159,216,255,0.04)' } },
      rightPriceScale: { borderColor: 'rgb(21,31,49)', scaleMargins: { top: 0.12, bottom: 0.08 } },
      timeScale: { borderColor: 'rgb(21,31,49)', timeVisible: true, secondsVisible: true, rightOffset: 6, barSpacing: 14 },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(159,216,255,0.35)', labelBackgroundColor: 'rgb(29,40,60)' },
        horzLine: { color: 'rgba(159,216,255,0.35)', labelBackgroundColor: 'rgb(98,172,232)' },
      },
    })
    chartRef.current = chart
    chart.subscribeCrosshairMove((p) => {
      if (!p.time || !mainRef.current) return setHover(null)
      const d = p.seriesData.get(mainRef.current) as { time: number } | undefined
      if (!d) return setHover(null)
      setHover(candlesRef.current.find((c) => c.time === d.time) ?? null)
    })
    return () => {
      chart.remove()
      chartRef.current = undefined
      mainRef.current = undefined
      volRef.current = undefined
    }
  }, [])

  // Serier
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    if (mainRef.current) chart.removeSeries(mainRef.current)
    if (volRef.current) chart.removeSeries(volRef.current)
    volRef.current = undefined
    const pf = { type: 'custom' as const, minMove: 0.000001, formatter: fmtV }
    if (style === 'candles') {
      const s = chart.addCandlestickSeries({
        upColor: UP,
        downColor: DOWN,
        borderVisible: false,
        wickUpColor: UP,
        wickDownColor: DOWN,
        priceFormat: pf,
        priceLineColor: 'rgb(255,77,94)',
        priceLineStyle: 2,
      })
      s.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close })))
      mainRef.current = s
    } else {
      const s = chart.addLineSeries({ color: 'rgb(159,216,255)', lineWidth: 2, priceFormat: pf })
      s.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.close })))
      mainRef.current = s
    }
    if (vol) {
      const v = chart.addHistogramSeries({ priceScaleId: '', priceFormat: { type: 'volume' }, lastValueVisible: false, priceLineVisible: false })
      v.priceScale().applyOptions({ scaleMargins: { top: 0.84, bottom: 0 } })
      v.setData(
        candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.volume, color: c.up ? 'rgba(52,211,120,0.35)' : 'rgba(255,77,94,0.35)' })),
      )
      volRef.current = v
    }
    chart.priceScale('right').applyOptions({ mode: log ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal })
    chart.timeScale().fitContent()
  }, [candles, style, vol, log])

  const zoom = (f: number) => {
    const ts = chartRef.current?.timeScale()
    const r = ts?.getVisibleLogicalRange()
    if (!ts || !r) return
    const mid = (r.from + r.to) / 2
    const half = ((r.to - r.from) / 2) * f
    ts.setVisibleLogicalRange({ from: mid - half, to: mid + half })
  }
  const chg = shown ? ((shown.close - shown.open) / (shown.open || 1)) * 100 : 0

  return (
    <section aria-label={`${symbol} interactive chart`} className="flex h-[420px] min-w-0 flex-col border-b border-neutral-850 sm:h-[480px] lg:h-[clamp(440px,62vh,680px)]">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-neutral-850 px-2">
        <div role="group" aria-label="Chart interval" className="no-scrollbar flex min-w-0 items-center overflow-x-auto">
          {INTERVALS.map(([k], i) => (
            <button
              key={k}
              type="button"
              onClick={() => setIv(i)}
              className={cn(
                'h-7 shrink-0 rounded-md px-2 font-mono text-[11px] font-medium transition-colors focus-visible:outline-1 focus-visible:outline-primary',
                iv === i ? 'bg-neutral-850 text-foreground' : 'text-neutral-500 hover:text-neutral-200',
              )}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <div role="group" aria-label="Chart metric" className="flex h-7 items-center rounded-md bg-neutral-900 p-0.5">
            {(['MCap', 'Price'] as const).map((m) => (
              <button key={m} type="button" className={seg(metric === m)} onClick={() => setMetric(m)}>
                {m}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Chart currency" className="flex h-7 items-center rounded-md bg-neutral-900 p-0.5">
            {(['SOL', 'USD'] as const).map((m) => (
              <button key={m} type="button" className={seg(cur === m)} onClick={() => setCur(m)}>
                {m}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Chart style" className="hidden h-7 items-center rounded-md bg-neutral-900 p-0.5 sm:flex">
            <button type="button" aria-label="Candles" title="Candles" className={seg(style === 'candles')} onClick={() => setStyle('candles')}>
              <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <rect x="2" y="4" width="3" height="6" rx="0.5" />
                <rect x="3.25" y="1.5" width="0.5" height="11" />
                <rect x="9" y="3" width="3" height="5" rx="0.5" />
                <rect x="10.25" y="1" width="0.5" height="10" />
              </svg>
            </button>
            <button type="button" aria-label="Line" title="Line" className={seg(style === 'line')} onClick={() => setStyle('line')}>
              <I icon="ph--chart-line-bold" className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="hidden h-7 items-center rounded-md bg-neutral-900 p-0.5 md:flex">
            <button
              type="button"
              title="Volume"
              onClick={() => setVol((v) => !v)}
              className={cn('h-6 rounded px-1.5 text-[11px] font-medium transition-colors', vol ? 'text-primary' : 'text-neutral-500 hover:text-neutral-200')}
            >
              Vol
            </button>
            <button
              type="button"
              title="Logarithmic scale"
              onClick={() => setLog((v) => !v)}
              className={cn('h-6 rounded px-1.5 text-[11px] font-medium transition-colors', log ? 'text-primary' : 'text-neutral-500 hover:text-neutral-200')}
            >
              Log
            </button>
          </div>
        </div>
      </div>
      <div
        role="img"
        aria-label={`Candlestick chart. Drag to pan, scroll or pinch to zoom. ${candles.length} recorded intervals.`}
        className="group relative min-h-[220px] flex-1"
      >
        <div ref={box} className="absolute inset-0" />
        {shown && (
          <div className="pointer-events-none absolute left-3 top-2.5 z-10 flex max-w-[calc(100%-5rem)] flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-[11px] tabular-nums text-neutral-500">
            <span className="hidden font-sans font-semibold text-neutral-300 sm:inline">
              ${symbol}{' '}
              <span className="font-normal text-neutral-500">
                · {metric} · {INTERVALS[iv][0]} · {cur}
              </span>
            </span>
            <span className="flex flex-wrap gap-x-2.5">
              {(['O', 'H', 'L', 'C'] as const).map((k) => (
                <span key={k}>
                  {k} <span className="text-neutral-200">{fmtV(shown[({ O: 'open', H: 'high', L: 'low', C: 'close' } as const)[k]])}</span>
                </span>
              ))}
              <span className={chg < 0 ? 'text-rose' : 'text-emerald'}>
                {chg >= 0 ? '+' : ''}
                {chg.toFixed(2)}%
              </span>
              <span>
                Vol <span className="text-neutral-200">{shown.volume.toPrecision(4)}</span>
              </span>
            </span>
          </div>
        )}
        <div className="absolute bottom-9 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-0.5 rounded-lg border border-neutral-800 bg-neutral-950/90 p-0.5 opacity-100 shadow-lg backdrop-blur transition-opacity focus-within:opacity-100 sm:flex has-hover:opacity-0 has-hover:group-hover:opacity-100">
          {(
            [
              ['Zoom out chart', 'ph--minus-bold', () => zoom(1.4)],
              ['Zoom in chart', 'ph--plus-bold', () => zoom(0.7)],
              ['Reset chart', 'ph--arrow-counter-clockwise', () => chartRef.current?.timeScale().fitContent()],
            ] as const
          ).map(([label, icon, fn]) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              title={label}
              onClick={fn}
              className="grid h-7 w-7 place-items-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-850 hover:text-foreground"
            >
              <I icon={icon} className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex h-7 shrink-0 items-center gap-3 border-t border-neutral-850 px-3 text-[10px] text-neutral-500">
        <span className="truncate">
          {candles.length} {INTERVALS[iv][0]} intervals with swaps
        </span>
        <span
          className="ml-auto inline-flex shrink-0 cursor-help items-center gap-1"
          title="Post-swap prices; only intervals with recorded swaps are shown. Market cap uses current verified supply, including older prices. Volume is recorded wallet SOL flow, including swap fees."
        >
          <I icon="ph--info" className="h-3 w-3" />
          <span className="hidden sm:inline">How this chart works</span>
        </span>
        <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer" className="shrink-0 hover:text-neutral-300">
          Charts by TradingView
        </a>
      </div>
    </section>
  )
}
