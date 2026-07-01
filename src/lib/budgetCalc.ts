import type { BudgetEstimate, BudgetVerdict, TripTier } from '../types'
import { computeCost, resolveCityDailyCost } from './costModel'

export interface EstimateInput {
  city: string
  days: number
  people: number
  budget: number
  tier: TripTier
}

function verdictFor(budget: number, total: number): BudgetVerdict {
  if (budget <= 0) return 'risky'
  if (budget >= total) return 'ok'
  if (budget >= total * 0.85) return 'tight'
  return 'risky'
}

/**
 * Budget estimate — delegates the math to the shared `costModel` so the numbers
 * match the Trip Planner for the same city/days/tier. City cost is now factored
 * in (empty/unknown city falls back to the default daily). No network / AI.
 */
export function estimateBudget(input: EstimateInput): BudgetEstimate {
  const cost = computeCost({
    cityDailyCost: resolveCityDailyCost(input.city),
    days: input.days,
    tier: input.tier,
    people: input.people,
  })
  const budget = Math.max(0, Math.round(input.budget) || 0)

  return {
    estimatedTotal: cost.estimatedTotal,
    dailyAverage: cost.dailyTotal,
    perPerson: cost.perPerson,
    accommodation: cost.accommodation,
    food: cost.food,
    activities: cost.activities,
    transport: cost.transport,
    verdict: verdictFor(budget, cost.estimatedTotal),
    diff: budget - cost.estimatedTotal,
  }
}

export const VERDICT_META: Record<
  BudgetVerdict,
  { label: string; color: string }
> = {
  ok: { label: 'Bütçen yeterli', color: '#10b981' },
  tight: { label: 'Bütçen sınırda', color: '#f59e0b' },
  risky: { label: 'Bütçe riskli', color: '#f87171' },
}
