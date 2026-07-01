import type { TripPlan } from '../types'
import { TIER_LABELS } from './mockPlanner'
import { formatUSD } from './budget'

/** Serialize a plan to a shareable plain-text block (for clipboard / export). */
export function buildPlanText(plan: TripPlan): string {
  const lines: string[] = []

  lines.push(`✈️  ${plan.city} Seyahat Planı`)
  lines.push(
    `${plan.days.length} gün · ${TIER_LABELS[plan.tier]} · Tahmini ${formatUSD(
      plan.estimatedTotal,
    )}`,
  )
  lines.push('')

  lines.push('📅  GÜN GÜN PROGRAM')
  for (const d of plan.days) {
    lines.push(`${d.day}. Gün`)
    lines.push(`   • Sabah: ${d.morning}`)
    lines.push(`   • Öğlen: ${d.noon}`)
    lines.push(`   • Akşam: ${d.evening}`)
  }
  lines.push('')

  lines.push('💰  BÜTÇE')
  if (plan.budget > 0) {
    lines.push(`   • Belirlenen bütçe: ${formatUSD(plan.budget)}`)
  }
  lines.push(`   • Tahmini toplam maliyet: ${formatUSD(plan.estimatedTotal)}`)
  lines.push(`   • Günlük ortalama: ${formatUSD(plan.dailyCost)}`)
  lines.push('')

  lines.push(`🚌  Toplu taşıma: ${plan.transport}`)
  lines.push(`📆  En uygun dönem: ${plan.bestSeason}`)
  lines.push('')

  lines.push('🌧️  YAĞMUR ALTERNATİFLERİ')
  for (const r of plan.rainyPlan) lines.push(`   • ${r}`)
  lines.push('')

  lines.push('— AI Travel Simulator ile oluşturuldu')

  return lines.join('\n')
}
