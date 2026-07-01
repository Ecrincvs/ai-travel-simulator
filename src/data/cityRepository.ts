import type { City } from '../types'
import { CITIES } from './cities'

/**
 * City data access layer — the ONLY place the app reads destination data from.
 *
 * Today it serves the static array in `cities.ts`. To move to a real backend
 * later, reimplement these functions to call an API (and, if you want true
 * async, switch the signatures to return Promises and `await` at the call
 * sites). The `City` shape returned stays identical, so screens don't change.
 */

const FEATURED_IDS = ['tokyo', 'paris', 'london', 'istanbul']

const norm = (s: string) => s.trim().toLocaleLowerCase('tr')

export function getAllCities(): City[] {
  return CITIES
}

/** The curated set shown on the home page by default. */
export function getFeaturedCities(): City[] {
  const byId = new Map(CITIES.map((c) => [c.id, c]))
  return FEATURED_IDS.map((id) => byId.get(id)).filter(
    (c): c is City => Boolean(c),
  )
}

/** Exact-then-partial name match; used by the planner to resolve a typed city. */
export function findCityByName(name: string): City | undefined {
  const q = norm(name)
  if (!q) return undefined
  return (
    CITIES.find((c) => norm(c.name) === q) ??
    CITIES.find((c) => norm(c.name).includes(q))
  )
}

export function getCityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id)
}

/**
 * Free-text search. Name/country matches take priority; tag matches are only
 * used as a fallback so e.g. "Roma" returns Rome, not every "Romantik" city.
 */
export function searchCities(query: string): City[] {
  const q = norm(query)
  if (!q) return CITIES
  const byNameCountry = CITIES.filter(
    (c) => norm(c.name).includes(q) || norm(c.country).includes(q),
  )
  if (byNameCountry.length > 0) return byNameCountry
  return CITIES.filter((c) => c.tags.some((t) => norm(t).includes(q)))
}
