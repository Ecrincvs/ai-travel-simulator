/**
 * A destination record. This is the canonical schema shared by every screen
 * (home cards, planner, budget hints). It is intentionally flat and
 * serializable so the static dataset in `data/cities.ts` can later be replaced
 * by a remote API returning the same shape — swap the repository in
 * `data/cityRepository.ts`, not the callers.
 */
export interface City {
  id: string
  name: string
  country: string
  emoji: string
  /** Average daily budget per person in USD (standard travel style) */
  dailyCost: number
  /** Best time to visit, human-readable */
  bestSeason: string
  /** Recommended local transport, human-readable */
  transport: string
  /** 10-15 signature activities used to build day-by-day plans */
  activities: string[]
  /** Indoor / bad-weather alternatives */
  rainyAlternatives: string[]
  /** Short keywords used for search + card chips */
  tags: string[]
  // ---- optional presentation fields (used by home cards) ----
  rating?: number
  /** Short teaser used on cards */
  description?: string
  /** Background gradient used on the city card */
  gradient?: string
}

export type TripTier = 'economy' | 'standard' | 'luxury'

export interface DayPlan {
  day: number
  morning: string
  noon: string
  evening: string
}

export interface TripPlan {
  city: string
  tier: TripTier
  days: DayPlan[]
  /** AI estimated total cost in USD */
  estimatedTotal: number
  dailyCost: number
  /** User-provided budget for comparison */
  budget: number
  withinBudget: boolean
  transport: string
  bestSeason: string
  /** Indoor / bad-weather backup suggestions */
  rainyPlan: string[]
}

export interface SavedPlan extends TripPlan {
  id: string
  savedAt: number
}

export type BudgetVerdict = 'ok' | 'tight' | 'risky'

export interface BudgetEstimate {
  estimatedTotal: number
  /** Total cost divided by number of days */
  dailyAverage: number
  /** Total cost divided by number of people */
  perPerson: number
  accommodation: number
  food: number
  transport: number
  activities: number
  verdict: BudgetVerdict
  /** budget - estimatedTotal (positive = surplus) */
  diff: number
}

