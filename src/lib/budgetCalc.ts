import type { BudgetEstimate, BudgetVerdict, TripTier } from '../types'
import { TIER_DAILY_BASE } from './mockPlanner'

/** Category split of the estimated total. Sums to 1. */
const SPLIT = {
  accommodation: 0.4,
  food: 0.3,
  activities: 0.18,
  transport: 0.12,
}

export interface EstimateInput {
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
 * Mock budget estimator. Uses the same per-person daily base as the planner so
 * the two screens stay consistent. No network / AI involved.
 */
export function estimateBudget(input: EstimateInput): BudgetEstimate {
  const days = Math.max(1, Math.round(input.days) || 1)
  const people = Math.max(1, Math.round(input.people) || 1)
  const budget = Math.max(0, Math.round(input.budget) || 0)

  const estimatedTotal = TIER_DAILY_BASE[input.tier] * days * people

  return {
    estimatedTotal,
    dailyAverage: Math.round(estimatedTotal / days),
    perPerson: Math.round(estimatedTotal / people),
    accommodation: Math.round(estimatedTotal * SPLIT.accommodation),
    food: Math.round(estimatedTotal * SPLIT.food),
    activities: Math.round(estimatedTotal * SPLIT.activities),
    transport: Math.round(estimatedTotal * SPLIT.transport),
    verdict: verdictFor(budget, estimatedTotal),
    diff: budget - estimatedTotal,
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
