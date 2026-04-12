'use client'

// ─── Monthly Bar Chart ────────────────────────────────────────────────────────
type MonthlyBar = { label: string; income: number; expenses: number }

export function MonthlyBarChart({ data }: { data: MonthlyBar[] }) {
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expenses]), 100)
  const H = 140
  const bw = 14
  const gap = 3
  const groupW = bw * 2 + gap + 18
  const W = data.length * groupW + 8
  const abbrev = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`

  return (
    <div>
      <div className="flex gap-4 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500 inline-block" />Revenue</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400 inline-block" />Expenses</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75, 1].map(p => (
          <line key={p} x1="0" y1={H - p * H} x2={W} y2={H - p * H} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {data.map((d, i) => {
          const x = i * groupW + 4
          const incH = Math.max((d.income / maxVal) * H, d.income > 0 ? 3 : 0)
          const expH = Math.max((d.expenses / maxVal) * H, d.expenses > 0 ? 3 : 0)
          return (
            <g key={i}>
              <rect x={x} y={H - incH} width={bw} height={incH} fill="#22c55e" rx="2" opacity="0.85">
                <title>Revenue: {abbrev(d.income)}</title>
              </rect>
              <rect x={x + bw + gap} y={H - expH} width={bw} height={expH} fill="#f87171" rx="2" opacity="0.85">
                <title>Expenses: {abbrev(d.expenses)}</title>
              </rect>
              <text x={x + bw} y={H + 16} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
type DonutSlice = { label: string; value: number; color: string }

export function DonutChart({ data, size = 140 }: { data: DonutSlice[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <div className="flex items-center justify-center h-36 text-gray-300 text-sm">No data</div>

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const ir = size * 0.24
  let cumAngle = -Math.PI / 2

  const slices = data.map(d => {
    const angle = (d.value / total) * 2 * Math.PI
    const start = cumAngle
    cumAngle += angle
    return { ...d, startAngle: start, endAngle: cumAngle }
  })

  const arc = (startA: number, endA: number, outerR: number, innerR: number) => {
    const x1o = cx + outerR * Math.cos(startA)
    const y1o = cy + outerR * Math.sin(startA)
    const x2o = cx + outerR * Math.cos(endA)
    const y2o = cy + outerR * Math.sin(endA)
    const x1i = cx + innerR * Math.cos(endA)
    const y1i = cy + innerR * Math.sin(endA)
    const x2i = cx + innerR * Math.cos(startA)
    const y2i = cy + innerR * Math.sin(startA)
    const large = endA - startA > Math.PI ? 1 : 0
    return `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${large} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 ${large} 0 ${x2i} ${y2i} Z`
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {slices.map((s, i) => (
        <path key={i} d={arc(s.startAngle, s.endAngle, r, ir)} fill={s.color} opacity="0.9">
          <title>{s.label}: ${s.value.toLocaleString()} ({((s.value / total) * 100).toFixed(0)}%)</title>
        </path>
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#374151" fontWeight="700">
        ${(total / 1000).toFixed(0)}k
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#9ca3af">total</text>
    </svg>
  )
}

// ─── Cash Flow Line Chart ─────────────────────────────────────────────────────
type CashPoint = { label: string; net: number }

export function CashFlowLine({ data }: { data: CashPoint[] }) {
  const H = 100
  const W = 300
  const vals = data.map(d => d.net)
  const min = Math.min(...vals, 0)
  const max = Math.max(...vals, 0)
  const range = max - min || 1
  const padY = H * 0.1

  const toY = (v: number) => padY + (1 - (v - min) / range) * (H - padY * 2)
  const stepX = W / Math.max(data.length - 1, 1)

  const points = data.map((d, i) => `${i * stepX},${toY(d.net)}`).join(' ')
  const area = `0,${toY(0)} ` + points + ` ${(data.length - 1) * stepX},${toY(0)}`
  const zeroY = toY(0)

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" preserveAspectRatio="none">
      <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 2" />
      <polygon points={area} fill="#0F4C81" opacity="0.08" />
      <polyline points={points} fill="none" stroke="#0F4C81" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={i * stepX} cy={toY(d.net)} r="3" fill={d.net >= 0 ? '#22c55e' : '#ef4444'} />
          <text x={i * stepX} y={H + 16} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
export function Sparkline({ values, color = '#0F4C81' }: { values: number[]; color?: string }) {
  const H = 32
  const W = 80
  const max = Math.max(...values, 1)
  const step = W / Math.max(values.length - 1, 1)
  const pts = values.map((v, i) => `${i * step},${H - (v / max) * H}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}
