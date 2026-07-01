import type { DayPlan, TravelPreference, TripPlan, TripTier } from '../types'
import { findCityByName } from '../data/cityRepository'
import { scoreActivity, preferenceNotes } from './preferences'

export const TIER_LABELS: Record<TripTier, string> = {
  economy: 'Ekonomik',
  standard: 'Standart',
  luxury: 'Lüks',
}

/**
 * Per-person daily spend baseline by tier. Kept for the standalone Budget
 * Calculator screen (city-independent estimate).
 */
export const TIER_DAILY_BASE: Record<TripTier, number> = {
  economy: 60,
  standard: 130,
  luxury: 280,
}

/** Multiplier applied to a city's average daily budget, by travel tier. */
const TIER_MULT: Record<TripTier, number> = {
  economy: 0.7,
  standard: 1,
  luxury: 1.9,
}

/** Fallback content when the typed city isn't in the database. */
const DEFAULT_CITY = {
  dailyCost: 90,
  transport:
    'Şehir içi toplu taşıma kartı al; metro / tramvay ve otobüs en ekonomik seçenek.',
  bestSeason: 'İlkbahar (Nisan–Haziran) ve erken sonbahar (Eylül–Ekim)',
  activities: [
    'Tarihi şehir merkezini ve meydanı gez',
    'Öne çıkan müze veya galeriyi ziyaret et',
    'Yerel pazarda kahvaltı ve keşif',
    'Panoramik bir noktada yürüyüş yap',
    'Yerel bir lokantada geleneksel yemek',
    'Sahil veya nehir kıyısında mola',
    'Popüler bir semtte café molası',
    'Şehrin simge yapısını gör',
    'Sokak lezzetleri turu yap',
    'Canlı bir mahallede gece atmosferi',
    'Yerel el sanatları alışverişi',
    'Gün batımı için manzaralı bir nokta',
  ],
  rainyAlternatives: [
    'Şehrin en büyük müzesini veya sanat galerisini gez',
    'Kapalı bir çarşı veya AVM’de alışveriş',
    'Sıcak bir içecek için şirin bir kafede mola',
    'Akvaryum, sinema veya kapalı bir mekan etkinliği',
  ],
}

function cyc(list: string[], i: number): string {
  const n = list.length
  return list[((i % n) + n) % n]
}

export interface GeneratePlanInput {
  city: string
  days: number
  budget: number
  tier: TripTier
  /** Trip start date as YYYY-MM-DD. */
  startDate?: string
  /** Optional travel preferences used to re-rank activities. */
  preferences?: TravelPreference[]
}

/**
 * Mock AI plan generator. Pulls the destination from the city repository and
 * slots its activities into morning / noon / evening across the trip. Swap this
 * one function for a real AI call later — the returned `TripPlan` shape is the
 * contract the UI depends on.
 */
export function generatePlan(input: GeneratePlanInput): TripPlan {
  const days = Math.max(1, Math.min(14, Math.round(input.days) || 1))
  const city = findCityByName(input.city)
  const source = city ?? DEFAULT_CITY
  const prefs = input.preferences ?? []

  // Re-rank the city's activities so preference-matching ones surface first
  // (stable: higher score first, original order as tiebreak).
  const acts =
    prefs.length > 0
      ? source.activities
          .map((a, i) => ({ a, i, s: scoreActivity(a, prefs) }))
          .sort((x, y) => y.s - x.s || x.i - y.i)
          .map((o) => o.a)
      : source.activities

  const dayPlans: DayPlan[] = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    morning: cyc(acts, i * 3),
    noon: cyc(acts, i * 3 + 1),
    evening: cyc(acts, i * 3 + 2),
  }))

  const dailyCost = Math.round(source.dailyCost * TIER_MULT[input.tier])
  const estimatedTotal = dailyCost * days
  const budget = Math.max(0, Math.round(input.budget) || 0)

  return {
    city: input.city.trim(),
    tier: input.tier,
    startDate: input.startDate,
    days: dayPlans,
    estimatedTotal,
    dailyCost,
    budget,
    withinBudget: budget === 0 ? true : estimatedTotal <= budget,
    transport: source.transport,
    bestSeason: source.bestSeason,
    rainyPlan: source.rainyAlternatives,
    preferences: prefs,
    preferenceNotes: preferenceNotes(prefs),
  }
}
