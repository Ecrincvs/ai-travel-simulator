/** Local-time date helpers for trip planning (no timezone drift). */

function isoOf(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseISO(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

/** Today as YYYY-MM-DD in local time — used for the date input `min`. */
export function todayISODate(): string {
  return isoOf(new Date())
}

/** The ISO date `offset` days after `startISO` (empty string if invalid). */
export function dayDateISO(startISO: string, offset: number): string {
  const d = parseISO(startISO)
  if (!d) return ''
  d.setDate(d.getDate() + offset)
  return isoOf(d)
}

const LONG = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const MONTH = new Intl.DateTimeFormat('tr-TR', { month: 'long' })

/** "10 Ağustos 2026" */
export function formatTripDate(iso: string): string {
  const d = parseISO(iso)
  return d ? LONG.format(d) : ''
}

/** Compact date range across `days` days, e.g. "10 – 12 Ağustos 2026". */
export function formatTripRange(startISO: string, days: number): string {
  const start = parseISO(startISO)
  if (!start) return ''
  const end = new Date(start)
  end.setDate(end.getDate() + Math.max(0, Math.round(days) - 1))

  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()

  if (sameMonth) {
    return `${start.getDate()} – ${end.getDate()} ${MONTH.format(start)} ${start.getFullYear()}`
  }
  if (sameYear) {
    return `${start.getDate()} ${MONTH.format(start)} – ${end.getDate()} ${MONTH.format(end)} ${start.getFullYear()}`
  }
  return `${LONG.format(start)} – ${LONG.format(end)}`
}
