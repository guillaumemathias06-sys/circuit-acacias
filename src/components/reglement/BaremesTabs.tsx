'use client'

import { useState } from 'react'

interface Row {
  id: string
  position_min: number
  position_max: number
  points: number
}

interface Scale {
  id: string
  name: string
  rows: Row[]
}

export function BaremesTabs({ scales }: { scales: Scale[] }) {
  const [activeId, setActiveId] = useState(scales[0]?.id)
  const active = scales.find((s) => s.id === activeId) ?? scales[0]
  const rows = (active?.rows ?? []).sort((a, b) => a.position_min - b.position_min)

  return (
    <div>
      <div className="inline-flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {scales.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active?.id === s.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {rows.map((row, i) => (
            <div
              key={row.id}
              className={`px-5 py-4 text-center ${i % 2 === 1 ? 'sm:border-l' : ''} border-b border-gray-50 ${
                (i + 1) % 4 !== 0 ? 'sm:border-r' : ''
              } border-gray-50`}
            >
              <p className="text-xs text-gray-400 mb-1">
                {row.position_min === row.position_max ? `${row.position_min}e` : `${row.position_min}e–${row.position_max}e`}
              </p>
              <p className="text-xl font-black text-gray-900">{row.points}</p>
              <p className="text-xs text-gray-400">pts</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
