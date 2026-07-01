import type { TripPlan } from '../types'
import { generatePlan, type GeneratePlanInput } from '../lib/mockPlanner'

/** Input for a trip plan request — identical shape to the mock generator. */
export type TripPlanInput = GeneratePlanInput

interface AiConfig {
  enabled: boolean
  endpoint: string
  timeoutMs: number
}

function readConfig(): AiConfig {
  const env = import.meta.env
  return {
    enabled: env.VITE_AI_ENABLED === 'true',
    endpoint: (env.VITE_AI_ENDPOINT ?? '').trim(),
    timeoutMs: Number(env.VITE_AI_TIMEOUT_MS) || 12000,
  }
}

/** Cheap runtime guard so a malformed AI payload triggers the mock fallback. */
function looksLikeTripPlan(value: unknown): value is TripPlan {
  const p = value as TripPlan | null
  return Boolean(
    p &&
      typeof p.city === 'string' &&
      Array.isArray(p.days) &&
      typeof p.estimatedTotal === 'number' &&
      Array.isArray(p.rainyPlan),
  )
}

/**
 * Calls a backend proxy that produces the plan and returns it as a TripPlan
 * JSON. The proxy is where the provider (Claude / OpenAI) API key lives — the
 * browser must never hold it. Not wired to a real provider yet; this only
 * defines the contract the proxy must satisfy.
 */
async function generateWithProxy(
  input: TripPlanInput,
  cfg: AiConfig,
): Promise<TripPlan> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), cfg.timeoutMs)
  try {
    const res = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`AI endpoint responded ${res.status}`)
    const data: unknown = await res.json()
    if (!looksLikeTripPlan(data)) {
      throw new Error('AI response did not match the TripPlan shape')
    }
    return data
  } finally {
    window.clearTimeout(timer)
  }
}

/**
 * The single entry point the UI uses to produce a trip plan.
 *
 * Today it returns mock data from `mockPlanner`. To enable real AI later:
 *   1. Stand up a backend proxy that accepts this `TripPlanInput` and returns a
 *      `TripPlan` JSON (see `.env.example` and `docs`/README for env vars). The
 *      proxy holds the Claude/OpenAI key server-side.
 *   2. Set `VITE_AI_ENABLED=true` and `VITE_AI_ENDPOINT=<proxy url>`.
 *
 * Only THIS file changes when wiring a real provider. On ANY error (network,
 * timeout, bad shape, feature disabled) it falls back to the mock, so the UI
 * never breaks.
 */
export async function generateTripPlan(input: TripPlanInput): Promise<TripPlan> {
  const cfg = readConfig()
  if (cfg.enabled && cfg.endpoint) {
    try {
      return await generateWithProxy(input, cfg)
    } catch (err) {
      // Intentional soft-fail: log and fall through to the mock.
      console.warn('[tripPlannerService] AI failed, using mock fallback:', err)
    }
  }
  return generatePlan(input)
}
