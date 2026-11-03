import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'
import { KOMPETENSI_SHORT, type Kompetensi } from '../types'

export function RadarKompetensi({ data }: { data: Record<string, { benar: number; total: number }> }) {
  const chartData = Object.entries(KOMPETENSI_SHORT).map(([full, short]) => {
    const d = data[full as Kompetensi]
    const pct = d && d.total > 0 ? Math.round((d.benar / d.total) * 100) : 0
    return { kompetensi: short, akurasi: pct }
  })
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={chartData} outerRadius="75%">
        <PolarGrid stroke="var(--border-subtle)" />
        <PolarAngleAxis dataKey="kompetensi" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
        <Radar name="Akurasi" dataKey="akurasi" stroke="var(--color-navy-600)" fill="var(--color-navy-600)" fillOpacity={0.35} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function BarBreakdown({ data, label }: { data: Record<string, { benar: number; total: number }>; label: string }) {
  const chartData = Object.entries(data).map(([name, d]) => ({
    name,
    akurasi: d.total > 0 ? Math.round((d.benar / d.total) * 100) : 0,
  }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <Tooltip
          formatter={(v) => [`${v}%`, label]}
          contentStyle={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            fontSize: 12,
          }}
          labelStyle={{ color: 'var(--text-primary)' }}
        />
        <Bar dataKey="akurasi" fill="var(--color-gold-500)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TrendLine({ data }: { data: { name: string; skor: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            fontSize: 12,
          }}
          labelStyle={{ color: 'var(--text-primary)' }}
        />
        <Line
          type="monotone"
          dataKey="skor"
          stroke="var(--color-navy-600)"
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--color-navy-600)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
