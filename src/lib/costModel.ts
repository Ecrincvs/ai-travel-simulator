import type { TripTier } from '../types'
import { findCityByName } from '../data/cityRepository'

/**
 * Single source of truth for trip cost math, shared by the Trip Planner and the
 * Budget Calculator so the same city/days/tier always yields the same numbers.
 *
 * Model: every city carries an average daily budget per person (`dailyCost`);
 * the travel tier scales it, then it is multiplied by travelers and days.
 */

/** Multiplier applied to a city's per-person daily budget, by travel tier. */
export const TIER_MULT: Record<TripTier, number> = {
  economy: 0.7,
  standard: 1,
  luxury: 1.9,
}

/** Per-person daily budget used when the city is unknown / free-text. */
export const DEFAULT_CITY_DAILY = 90

/** Category split of the estimated total. Sums to 1. */
const SPLIT = {
  accommodation: 0.4,
  food: 0.3,
  activities: 0.18,
  transport: 0.12,
}

export interface CostInput {
  /** Average daily budget per person for the city (USD). */
  cityDailyCost: number
  days: number
  tier: TripTier
  /** Number of travelers (the planner uses 1). */
  people?: number
}

export interface CostBreakdown {
  /** One person, one day. */
  perPersonDaily: number
  /** All travelers, one day (= estimatedTotal / days). */
  dailyTotal: number
  /** Whole trip, all travelers. */
  estimatedTotal: number
  /** Whole trip, one person (= estimatedTotal / people). */
  perPerson: number
  accommodation: number
  food: number
  activities: number
  transport: number
}

/** Resolve a typed city name to its per-person daily budget. */
export function resolveCityDailyCost(cityName: string): number {
  return findCityByName(cityName)?.dailyCost ?? DEFAULT_CITY_DAILY
}

/**
 * Compute all cost figures from a resolved city daily cost. `perPersonDaily` is
 * rounded once, so every derived total is an exact integer with no drift
 * (dailyTotal × days === estimatedTotal === perPerson × people).
 */
export function computeCost(input: CostInput): CostBreakdown {
  const days = Math.max(1, Math.round(input.days) || 1)
  const people = Math.max(1, Math.round(input.people ?? 1) || 1)
  const cityDaily =
    input.cityDailyCost > 0 ? input.cityDailyCost : DEFAULT_CITY_DAILY

  const perPersonDaily = Math.round(cityDaily * TIER_MULT[input.tier])
  const estimatedTotal = perPersonDaily * people * days

  return {
    perPersonDaily,
    dailyTotal: perPersonDaily * people,
    estimatedTotal,
    perPerson: perPersonDaily * days,
    accommodation: Math.round(estimatedTotal * SPLIT.accommodation),
    food: Math.round(estimatedTotal * SPLIT.food),
    activities: Math.round(estimatedTotal * SPLIT.activities),
    transport: Math.round(estimatedTotal * SPLIT.transport),
  }
}
