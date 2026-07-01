/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" to route planning through the AI proxy; anything else uses the mock. */
  readonly VITE_AI_ENABLED?: string
  /** URL of the backend proxy that returns a TripPlan JSON. */
  readonly VITE_AI_ENDPOINT?: string
  /** Milliseconds before the AI call aborts and falls back to the mock. */
  readonly VITE_AI_TIMEOUT_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
