import type { DayPlan } from '../types'

export interface RouteStop {
  order: number
  slot: string
  title: string
  /** Estimated time spent at this stop, in minutes */
  durationMin: number
  /** How you reach this stop from the previous one */
  transportLabel: string
  transportEmoji: string
}

const SLOTS: { key: keyof Pick<DayPlan, 'morning' | 'noon' | 'evening'>; label: string; dur: number }[] = [
  { key: 'morning', label: 'Sabah', dur: 150 },
  { key: 'noon', label: 'Öğlen', dur: 90 },
  { key: 'evening', label: 'Akşam', dur: 120 },
]

const MODES = [
  { emoji: '🚶', label: 'Yürüyüş' },
  { emoji: '🚇', label: 'Metro' },
  { emoji: '🚋', label: 'Tramvay' },
  { emoji: '🚌', label: 'Otobüs' },
  { emoji: '🚕', label: 'Taksi' },
]

/**
 * Build an ordered stop list for a single day. Mock: the three daily slots
 * become stops 1-3, with deterministic (day-derived) transport modes and
 * estimated durations. No maps/API involved.
 */
export function buildRouteStops(day: DayPlan): RouteStop[] {
  return SLOTS.map((s, i) => {
    const title = day[s.key]
    if (i === 0) {
      return {
        order: 1,
        slot: s.label,
        title,
        durationMin: s.dur,
        transportLabel: 'Başlangıç',
        transportEmoji: '📍',
      }
    }
    const mode = MODES[(day.day + i) % MODES.length]
    return {
      order: i + 1,
      slot: s.label,
      title,
      durationMin: s.dur,
      transportLabel: mode.label,
      transportEmoji: mode.emoji,
    }
  })
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} dk`
  if (m === 0) return `${h} sa`
  return `${h} sa ${m} dk`
}
