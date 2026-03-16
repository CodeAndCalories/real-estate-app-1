'use client'

import { useState, useMemo } from 'react'
import { Property } from '@/app/finder/page'
import { getScoreLabel } from '@/lib/utils/scoreProperty'

type Props = {
  data: Property[]
  onPinClick: (p: Property) => void
  savedKeys: Set<string>
}

// Approximate US positions as percentages (x = west→east, y = north→south)
const CITY_COORDS: Record<string, { x: number; y: number }> = {
  'miami':          { x: 76, y: 93 },
  'los angeles':    { x: 11, y: 60 },
  'dallas':         { x: 48, y: 65 },
  'phoenix':        { x: 22, y: 62 },
  'atlanta':        { x: 69, y: 61 },
  'chicago':        { x: 63, y: 29 },
  'cleveland':      { x: 73, y: 30 },
  'new york':       { x: 86, y: 33 },
  // Phoenix metro
  'scottsdale':     { x: 22.8, y: 61.8 },
  'tempe':          { x: 22.2, y: 62.5 },
  'mesa':           { x: 23.0, y: 62.8 },
  'chandler':       { x: 22.5, y: 63.4 },
  'gilbert':        { x: 23.2, y: 63.2 },
  'glendale':       { x: 21.2, y: 62.0 },
  'peoria':         { x: 20.8, y: 61.5 },
  'avondale':       { x: 20.5, y: 62.6 },
  'goodyear':       { x: 20.0, y: 62.8 },
  'cave creek':     { x: 22.4, y: 60.5 },
  'fountain hills': { x: 23.5, y: 61.4 },
  'anthem':         { x: 21.5, y: 60.2 },
}

const MAIN_CITY_LABELS: Record<string, { x: number; y: number }> = {
  'Miami':       { x: 76,  y: 93 },
  'Los Angeles': { x: 11,  y: 60 },
  'Dallas':      { x: 48,  y: 65 },
  'Phoenix':     { x: 22,  y: 62 },
  'Atlanta':     { x: 69,  y: 61 },
  'Chicago':     { x: 63,  y: 29 },
  'Cleveland':   { x: 73,  y: 30 },
  'New York':    { x: 86,  y: 33 },
}

function clusterColorClass(maxScore: number): string {
  if (maxScore >= 80) return 'bg-green-500 border-green-300 text-white'
  if (maxScore >= 60) return 'bg-yellow-400 border-yellow-300 text-gray-900'
  return 'bg-red-500 border-red-300 text-white'
}

function pinColorClass(score: number): string {
  if (score >= 80) return 'bg-green-500 border-green-200'
  if (score >= 60) return 'bg-yellow-400 border-yellow-200'
  return 'bg-red-500 border-red-200'
}

export default function MapView({ data, onPinClick, savedKeys }: Props) {
  const [expandedCity, setExpandedCity] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{
    p: Property
    pinX: number
    pinY: number
  } | null>(null)
  const [clusterTooltip, setClusterTooltip] = useState<{
    cityKey: string
    cityName: string
    count: number
    maxScore: number
    x: number
    y: number
  } | null>(null)

  // Group properties by city
  const cityGroups = useMemo(() => {
    const groups: Record<string, Property[]> = {}
    for (const p of data) {
      const key = p.city.toLowerCase()
      if (!CITY_COORDS[key]) continue
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    }
    return groups
  }, [data])

  // Individual pins for the expanded city (golden-angle spiral)
  const expandedPins = useMemo(() => {
    if (!expandedCity) return []
    const props = cityGroups[expandedCity] ?? []
    const base = CITY_COORDS[expandedCity]
    return props.map((p, idx) => {
      const angle = (idx * 137.508) % 360
      const r = idx === 0 ? 0 : Math.min(1.2 + Math.floor(idx / 6) * 1.4, 5.5)
      const x = base.x + r * Math.cos((angle * Math.PI) / 180)
      const y = base.y + r * Math.sin((angle * Math.PI) / 180)
      return { p, x, y }
    })
  }, [expandedCity, cityGroups])

  const unmappedCount = data.filter((p) => !CITY_COORDS[p.city.toLowerCase()]).length

  const tooltipLeft = tooltip
    ? tooltip.pinX > 62 ? `${tooltip.pinX - 26}%` : `${tooltip.pinX + 2}%`
    : '0'
  const tooltipTop = tooltip
    ? tooltip.pinY > 72 ? `${tooltip.pinY - 22}%` : `${tooltip.pinY - 2}%`
    : '0'

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Map View — Approximate City Positions
        </span>
        {expandedCity && (
          <button
            onClick={() => { setExpandedCity(null); setTooltip(null) }}
            className="ml-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2"
          >
            ← All Cities
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" /> Hot Lead
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400" /> Strong / Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" /> Low Priority
          </span>
        </div>
      </div>

      <div
        className="relative w-full select-none"
        style={{ paddingBottom: '44%', background: 'linear-gradient(160deg, #e8f4f8 0%, #ddeef6 50%, #d0e8f0 100%)' }}
        onClick={(e) => {
          if (expandedCity && !(e.target as HTMLElement).closest('[data-pin]')) {
            setExpandedCity(null)
            setTooltip(null)
          }
        }}
      >
        <div className="absolute inset-0">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[#c8dde8] text-5xl font-black tracking-[0.3em] uppercase select-none">
              USA
            </span>
          </div>

          {/* City name labels */}
          {Object.entries(MAIN_CITY_LABELS).map(([city, pos]) => (
            <div
              key={city}
              className="absolute pointer-events-none"
              style={{ left: `${pos.x}%`, top: `${pos.y + 4}%`, transform: 'translateX(-50%)' }}
            >
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                {city}
              </span>
            </div>
          ))}

          {/* Cluster circles (collapsed state) */}
          {!expandedCity && Object.entries(cityGroups).map(([cityKey, props]) => {
            const coords = CITY_COORDS[cityKey]
            if (!coords) return null
            const maxScore = Math.max(...props.map((p) => p.opportunity_score ?? 0))
            const count = props.length
            const size = count > 50 ? 38 : count > 20 ? 34 : count > 10 ? 30 : 26
            const cityName = props[0].city
            return (
              <div
                key={cityKey}
                data-pin="true"
                className="absolute cursor-pointer"
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: clusterTooltip?.cityKey === cityKey ? 20 : 10,
                }}
                onClick={() => { setExpandedCity(cityKey); setClusterTooltip(null) }}
                onMouseEnter={() => setClusterTooltip({ cityKey, cityName, count, maxScore, x: coords.x, y: coords.y })}
                onMouseLeave={() => setClusterTooltip(null)}
              >
                <div
                  className={`rounded-full border-2 flex items-center justify-center font-bold shadow-md hover:scale-110 transition-transform ${clusterColorClass(maxScore)}`}
                  style={{ width: size, height: size, fontSize: size > 32 ? 11 : 10 }}
                >
                  {count}
                </div>
              </div>
            )
          })}

          {/* Individual pins (expanded state) */}
          {expandedCity && expandedPins.map(({ p, x, y }, i) => {
            const score = p.opportunity_score ?? 0
            const isSaved = savedKeys.has(`${p.address}||${p.city}`)
            return (
              <div
                key={i}
                data-pin="true"
                className="absolute cursor-pointer"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: tooltip?.p === p ? 20 : 10,
                }}
                onClick={() => onPinClick(p)}
                onMouseEnter={() => setTooltip({ p, pinX: x, pinY: y })}
                onMouseLeave={() => setTooltip(null)}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 border-white shadow-md transition-transform hover:scale-150 ${pinColorClass(score)}`}
                />
                {isSaved && (
                  <span className="absolute -top-1.5 -right-1.5 text-[8px] leading-none text-yellow-500">
                    ★
                  </span>
                )}
              </div>
            )
          })}

          {/* Cluster hover tooltip */}
          {clusterTooltip && !expandedCity && (() => {
            const { cityName, count, maxScore, x, y } = clusterTooltip
            const left = x > 62 ? `${x - 18}%` : `${x + 2}%`
            const top  = y > 72 ? `${y - 16}%` : `${y - 2}%`
            const scoreLabel =
              maxScore >= 80 ? 'Hot Lead' :
              maxScore >= 60 ? 'Strong' : 'Moderate'
            const scoreCls =
              maxScore >= 80 ? 'bg-green-100 text-green-800' :
              maxScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-600'
            return (
              <div
                className="absolute z-30 bg-white border border-gray-200 rounded-lg shadow-xl p-2.5 pointer-events-none"
                style={{ left, top, minWidth: '160px' }}
              >
                <p className="font-bold text-gray-900 text-xs mb-1">{cityName}</p>
                <div className="flex items-center justify-between gap-3 text-[11px] text-gray-500 mb-1.5">
                  <span>{count} signal{count !== 1 ? 's' : ''}</span>
                  <span className={`px-1.5 py-0.5 rounded font-semibold ${scoreCls}`}>
                    {maxScore} · {scoreLabel}
                  </span>
                </div>
                <p className="text-[10px] text-blue-500">Click to expand →</p>
              </div>
            )
          })()}

          {/* Pin tooltip */}
          {tooltip && (
            <div
              className="absolute z-30 bg-white border border-gray-200 rounded-lg shadow-xl p-2.5 pointer-events-none"
              style={{ left: tooltipLeft, top: tooltipTop, minWidth: '180px', maxWidth: '210px' }}
            >
              <p className="font-semibold text-gray-900 text-xs truncate">{tooltip.p.address}</p>
              <p className="text-gray-500 text-[11px] mb-1.5">{tooltip.p.city}, {tooltip.p.zip}</p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    (tooltip.p.opportunity_score ?? 0) >= 80
                      ? 'bg-green-100 text-green-800'
                      : (tooltip.p.opportunity_score ?? 0) >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {tooltip.p.opportunity_score ?? 0}
                </span>
                <span className="text-[11px] text-gray-500">
                  {getScoreLabel(tooltip.p.opportunity_score ?? 0)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 truncate">{tooltip.p.lead_type}</p>
              <p className="text-[10px] text-blue-500 mt-1">Click to view details →</p>
            </div>
          )}

          {/* Expanded city hint */}
          {expandedCity && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="bg-white/80 text-gray-600 text-[11px] font-medium px-3 py-1 rounded-full border border-gray-200 shadow-sm whitespace-nowrap">
                {expandedPins.length} signal{expandedPins.length !== 1 ? 's' : ''} in{' '}
                {expandedPins[0]?.p.city ?? expandedCity} — click map to collapse
              </span>
            </div>
          )}
        </div>
      </div>

      {unmappedCount > 0 && (
        <p className="px-4 py-2 text-[11px] text-gray-400 border-t border-gray-100">
          {unmappedCount} properties not shown (city not mapped)
        </p>
      )}
    </div>
  )
}
