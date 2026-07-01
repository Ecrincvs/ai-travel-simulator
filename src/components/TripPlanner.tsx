import { useState, type FormEvent } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { TIER_LABELS } from '../lib/mockPlanner'
import { generateTripPlan } from '../services/tripPlannerService'
import { formatUSD } from '../lib/budget'
import {
  adaptPlan,
  WEATHER_META,
  WEATHER_ORDER,
  type SlotKey,
  type WeatherType,
} from '../lib/weather'
import { buildRouteStops, formatDuration } from '../lib/routePreview'
import { buildPlanText } from '../lib/planText'
import type { DayPlan, SavedPlan, TripPlan, TripTier } from '../types'
import {
  CompassIcon,
  MapPinIcon,
  CalendarIcon,
  WalletIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  RouteIcon,
  CarIcon,
  CloudRainIcon,
  BookmarkIcon,
} from './Icons'
import './TripPlanner.css'

const TIERS: TripTier[] = ['economy', 'standard', 'luxury']

interface TripPlannerProps {
  initialCity?: string
  /** When set, the planner opens showing this saved plan. */
  initialPlan?: SavedPlan
  onBack: () => void
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `plan-${performance.now().toString(36)}`
}

export function TripPlanner({
  initialCity = '',
  initialPlan,
  onBack,
}: TripPlannerProps) {
  const { theme, toggleTheme } = useTheme()
  const [city, setCity] = useState(initialPlan?.city ?? initialCity)
  const [daysStr, setDaysStr] = useState(String(initialPlan?.days.length ?? 4))
  const [budgetStr, setBudgetStr] = useState(String(initialPlan?.budget ?? 1500))
  const [tier, setTier] = useState<TripTier>(initialPlan?.tier ?? 'standard')
  const [plan, setPlan] = useState<TripPlan | null>(initialPlan ?? null)
  const [loading, setLoading] = useState(false)
  const [planSaved, setPlanSaved] = useState(Boolean(initialPlan))
  const [, setSavedPlans] = useLocalStorage<SavedPlan[]>('ats-plans', [])

  // Validation — surfaces warnings instead of silently correcting input.
  const days = Number(daysStr)
  const budget = Number(budgetStr)
  const cityValid = city.trim().length > 0
  const daysValid =
    daysStr.trim() !== '' && Number.isInteger(days) && days >= 1 && days <= 14
  const budgetValid =
    budgetStr.trim() !== '' &&
    Number.isFinite(budget) &&
    budget >= 0 &&
    budget <= 100000
  const canGenerate = cityValid && daysValid && budgetValid

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!canGenerate) return
    setLoading(true)
    setPlan(null)
    setPlanSaved(false)
    // Goes through the AI service layer (mock today; real provider later).
    // The brief delay keeps the "AI hazırlıyor…" feedback smooth.
    window.setTimeout(() => {
      generateTripPlan({ city, days, budget, tier })
        .then((result) => setPlan(result))
        .catch((err) => console.error('[TripPlanner] plan failed:', err))
        .finally(() => setLoading(false))
    }, 650)
  }

  const handleSave = () => {
    if (!plan) return
    const saved: SavedPlan = { ...plan, id: newId(), savedAt: Date.now() }
    setSavedPlans((prev) => [saved, ...prev])
    setPlanSaved(true)
  }

  return (
    <div className="tp">
      <header className="tp-nav">
        <div className="tp-nav-left">
          <button
            type="button"
            className="tp-back"
            onClick={onBack}
            aria-label="Geri dön"
          >
            ←
          </button>
          <div className="tp-brand">
            <span className="tp-brand-mark">
              <CompassIcon />
            </span>
            <span className="tp-brand-text">AI Travel Simulator</span>
          </div>
        </div>
        <button
          type="button"
          className="tp-theme-btn"
          onClick={toggleTheme}
          aria-label="Temayı değiştir"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <main className="tp-main">
        <div className="tp-head">
          <span className="tp-badge">
            <SparklesIcon width={16} height={16} />
            Trip Planner
          </span>
          <h1>Yapay zeka ile seyahatini planla</h1>
          <p>Bilgileri gir, saniyeler içinde gün gün bir program oluşturalım.</p>
        </div>

        <div className="tp-layout">
          {/* Form */}
          <form className="tp-form panel-surface" onSubmit={submit}>
            <label className="tp-field">
              <span className="tp-label">
                <MapPinIcon width={15} height={15} /> Gidilecek şehir
              </span>
              <input
                type="text"
                placeholder="Örn. İstanbul, Paris, Tokyo, Londra"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-invalid={!cityValid}
              />
              {!cityValid && (
                <span className="tp-warn">Bir şehir adı gir.</span>
              )}
            </label>

            <div className="tp-row">
              <label className="tp-field">
                <span className="tp-label">
                  <CalendarIcon width={15} height={15} /> Kaç gün
                </span>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={daysStr}
                  onChange={(e) => setDaysStr(e.target.value)}
                  aria-invalid={!daysValid}
                />
                {!daysValid && (
                  <span className="tp-warn">1–14 arası tam sayı gir.</span>
                )}
              </label>

              <label className="tp-field">
                <span className="tp-label">
                  <WalletIcon width={15} height={15} /> Toplam bütçe ($)
                </span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={budgetStr}
                  onChange={(e) => setBudgetStr(e.target.value)}
                  aria-invalid={!budgetValid}
                />
                {!budgetValid ? (
                  <span className="tp-warn">Geçerli bir bütçe gir (0+).</span>
                ) : (
                  budget === 0 && (
                    <span className="tp-note-soft">
                      Bütçe 0 — maliyet karşılaştırması yapılmaz.
                    </span>
                  )
                )}
              </label>
            </div>

            <div className="tp-field">
              <span className="tp-label">Seyahat tipi</span>
              <div className="tp-segmented">
                {TIERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={tier === t ? 'is-active' : ''}
                    onClick={() => setTier(t)}
                  >
                    {TIER_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="tp-submit"
              disabled={loading || !canGenerate}
            >
              <SparklesIcon width={17} height={17} />
              {loading ? 'Plan oluşturuluyor...' : 'AI Plan Oluştur'}
            </button>
          </form>

          {/* Results */}
          <section className="tp-results">
            {!plan && !loading && (
              <div className="tp-placeholder panel-surface">
                <span className="tp-placeholder-icon">
                  <RouteIcon width={30} height={30} />
                </span>
                <h3>Planın burada görünecek</h3>
                <p>
                  Formu doldurup <strong>AI Plan Oluştur</strong>’a bas; gün gün
                  program, maliyet ve öneriler burada listelensin.
                </p>
              </div>
            )}

            {loading && (
              <div className="tp-placeholder panel-surface">
                <span className="tp-spinner" aria-hidden="true" />
                <h3>Yapay zeka planını hazırlıyor…</h3>
                <p>{city} için en iyi rotayı kuruyoruz.</p>
              </div>
            )}

            {plan && !loading && (
              <PlanResult plan={plan} saved={planSaved} onSave={handleSave} />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

/* ---------------------------------------------------------------- */

function PlanResult({
  plan,
  saved,
  onSave,
}: {
  plan: TripPlan
  saved: boolean
  onSave: () => void
}) {
  return (
    <div className="tp-plan">
      {/* Cost hero + save */}
      <div className="tp-cost">
        <div className="tp-cost-top">
          <span className="tp-cost-city">
            {plan.city} · {plan.days.length} gün · {TIER_LABELS[plan.tier]}
          </span>
          <button
            type="button"
            className={`tp-save ${saved ? 'is-saved' : ''}`}
            onClick={onSave}
            disabled={saved}
          >
            <BookmarkIcon width={16} height={16} />
            {saved ? 'Kaydedildi' : 'Planı Kaydet'}
          </button>
        </div>
        <div className="tp-cost-figures">
          <div className="tp-cost-main">
            <span className="tp-cost-label">Tahmini toplam maliyet</span>
            <span className="tp-cost-value">{formatUSD(plan.estimatedTotal)}</span>
          </div>
          <div className="tp-cost-daily">
            <span className="tp-cost-daily-value">
              {formatUSD(plan.dailyCost)}
            </span>
            <span className="tp-cost-daily-label">günlük ortalama</span>
          </div>
        </div>
        {plan.budget > 0 && (
          <div
            className={`tp-budget-note ${plan.withinBudget ? 'is-ok' : 'is-over'}`}
          >
            {plan.withinBudget
              ? `✓ ${formatUSD(plan.budget)} bütçene uygun · ${formatUSD(
                  plan.budget - plan.estimatedTotal,
                )} artıyor`
              : `⚠ Bütçeyi ${formatUSD(
                  plan.estimatedTotal - plan.budget,
                )} aşıyor`}
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="tp-info-grid">
        <div className="tp-info-card">
          <div className="tp-info-head">
            <span className="tp-info-icon tp-icon-transport">
              <CarIcon width={18} height={18} />
            </span>
            <h4>Toplu Taşıma Önerisi</h4>
          </div>
          <p>{plan.transport}</p>
        </div>
        <div className="tp-info-card">
          <div className="tp-info-head">
            <span className="tp-info-icon tp-icon-season">
              <CalendarIcon width={18} height={18} />
            </span>
            <h4>En Uygun Ziyaret Dönemi</h4>
          </div>
          <p>{plan.bestSeason}</p>
        </div>
      </div>

      {/* Day by day */}
      <div className="tp-days-head">
        <RouteIcon width={18} height={18} />
        <h3>Gün Gün Program</h3>
      </div>
      <div className="tp-days">
        {plan.days.map((d) => (
          <DayCard key={d.day} day={d} />
        ))}
      </div>

      {/* Route preview module */}
      <RoutePreview plan={plan} />

      {/* Weather scenario module */}
      <WeatherModule plan={plan} />

      {/* Summary + export */}
      <TripSummary plan={plan} />
    </div>
  )
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

function TripSummary({ plan }: { plan: TripPlan }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const ok = await copyText(buildPlanText(plan))
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  const stats = [
    { label: 'Şehir', value: plan.city },
    { label: 'Toplam Gün', value: `${plan.days.length} gün` },
    { label: 'Seyahat Tipi', value: TIER_LABELS[plan.tier] },
    { label: 'Bütçe', value: plan.budget > 0 ? formatUSD(plan.budget) : '—' },
    { label: 'Tahmini Maliyet', value: formatUSD(plan.estimatedTotal) },
  ]

  return (
    <div className="tp-recap">
      <div className="tp-recap-head">
        <span className="tp-recap-icon">🧳</span>
        <div>
          <h3>Seyahat Özeti</h3>
          <p>Planı metin olarak kopyala veya dışa aktar.</p>
        </div>
      </div>

      <div className="tp-recap-grid">
        {stats.map((s) => (
          <div className="tp-recap-stat" key={s.label}>
            <span className="tp-recap-label">{s.label}</span>
            <span className="tp-recap-value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="tp-recap-actions">
        <button
          type="button"
          className={`tp-copy ${copied ? 'is-copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? '✓ Kopyalandı' : '📋 Planı Kopyala'}
        </button>
        <button
          type="button"
          className="tp-export"
          disabled
          title="Bu özellik yakında eklenecek"
        >
          PDF’e Aktar
          <span className="tp-soon">Yakında</span>
        </button>
      </div>
    </div>
  )
}

// Fixed marker positions (percent of the placeholder box) for the 3 daily stops.
const ROUTE_POSITIONS: [number, number][] = [
  [16, 72],
  [50, 28],
  [84, 64],
]

function RoutePreview({ plan }: { plan: TripPlan }) {
  const [selectedDay, setSelectedDay] = useState(1)
  const activeDay = Math.min(selectedDay, plan.days.length)
  const day = plan.days[activeDay - 1]
  const stops = buildRouteStops(day)
  const totalMin = stops.reduce((sum, s) => sum + s.durationMin, 0)

  return (
    <div className="tp-route">
      <div className="tp-route-head">
        <span className="tp-route-icon">
          <MapPinIcon width={20} height={20} />
        </span>
        <div>
          <h3>Rota Önizleme</h3>
          <p>Bir gün seç; durakları sırayla ve harita üzerinde gör.</p>
        </div>
      </div>

      <div className="tp-route-days">
        {plan.days.map((d) => (
          <button
            key={d.day}
            type="button"
            className={`tp-route-day ${activeDay === d.day ? 'is-active' : ''}`}
            onClick={() => setSelectedDay(d.day)}
          >
            {d.day}. Gün
          </button>
        ))}
      </div>

      <div className="tp-route-body">
        <div className="tp-route-left">
          <ol className="tp-route-list">
            {stops.map((s) => (
              <li className="tp-route-stop" key={s.order}>
                <span className="tp-route-num">{s.order}</span>
                <div className="tp-route-stop-main">
                  <div className="tp-route-stop-top">
                    <span className="tp-route-slot">{s.slot}</span>
                    <span className="tp-route-transport">
                      {s.transportEmoji} {s.transportLabel}
                    </span>
                  </div>
                  <p className="tp-route-title">{s.title}</p>
                  <span className="tp-route-duration">
                    ⏱ Tahmini {formatDuration(s.durationMin)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
          <div className="tp-route-total">
            Tahmini günlük süre: <strong>{formatDuration(totalMin)}</strong>
          </div>
        </div>

        <div
          className="tp-route-map"
          role="img"
          aria-label="Rota harita önizlemesi (placeholder)"
        >
          <div className="tp-route-map-grid" aria-hidden="true" />
          <svg
            className="tp-route-map-line"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              points={ROUTE_POSITIONS.map((p) => p.join(',')).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
          </svg>
          {stops.map((s, i) => (
            <span
              key={s.order}
              className="tp-route-pin"
              style={{
                left: `${ROUTE_POSITIONS[i][0]}%`,
                top: `${ROUTE_POSITIONS[i][1]}%`,
              }}
            >
              {s.order}
            </span>
          ))}
          <span className="tp-route-map-badge">
            🗺️ Google Maps entegrasyonu için hazır alan
          </span>
        </div>
      </div>
    </div>
  )
}

function WeatherModule({ plan }: { plan: TripPlan }) {
  const [selected, setSelected] = useState<WeatherType>('sunny')
  const [applied, setApplied] = useState<WeatherType | null>(null)

  const adaptation = applied ? adaptPlan(plan, applied) : null
  const accent = WEATHER_META[selected].accent

  return (
    <div
      className="tp-weather"
      style={{ ['--w' as string]: WEATHER_META[applied ?? selected].accent }}
    >
      <div className="tp-weather-head">
        <span className="tp-weather-icon">
          <CloudRainIcon width={20} height={20} />
        </span>
        <div>
          <h3>Hava Durumu Senaryosu</h3>
          <p>Hava durumunu seç, plan önerileri ona göre güncellensin.</p>
        </div>
      </div>

      <div className="tp-weather-options">
        {WEATHER_ORDER.map((w) => {
          const meta = WEATHER_META[w]
          return (
            <button
              key={w}
              type="button"
              className={`tp-weather-opt ${selected === w ? 'is-active' : ''}`}
              style={{ ['--w' as string]: meta.accent }}
              onClick={() => setSelected(w)}
            >
              <span className="tp-weather-emoji">{meta.emoji}</span>
              <span className="tp-weather-label">{meta.label}</span>
              <span className="tp-weather-summary">{meta.summary}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="tp-weather-apply"
        style={{ background: accent }}
        onClick={() => setApplied(selected)}
      >
        {WEATHER_META[selected].emoji} Hava durumuna göre planı güncelle
      </button>

      {adaptation && (
        <div className="tp-weather-result">
          <div className="tp-weather-note">
            <strong>
              {WEATHER_META[adaptation.weather].emoji}{' '}
              {WEATHER_META[adaptation.weather].label} plan
            </strong>
            <span>{adaptation.note}</span>
          </div>

          <ul className="tp-weather-tips">
            {adaptation.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <div className="tp-weather-days">
            {adaptation.days.map((d) => (
              <DayCard key={d.day} day={d} emphasize={adaptation.emphasize} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DayCard({
  day,
  emphasize = [],
}: {
  day: DayPlan
  emphasize?: SlotKey[]
}) {
  const slots: { key: SlotKey; label: string; text: string }[] = [
    { key: 'morning', label: 'Sabah', text: day.morning },
    { key: 'noon', label: 'Öğlen', text: day.noon },
    { key: 'evening', label: 'Akşam', text: day.evening },
  ]
  const hasEmphasis = emphasize.length > 0
  return (
    <article className="tp-day">
      <div className="tp-day-badge">{day.day}. Gün</div>
      <div className="tp-day-slots">
        {slots.map((s) => {
          const emph = emphasize.includes(s.key)
          const cls = [
            'tp-slot-block',
            `tp-slot-${s.key}`,
            hasEmphasis && emph ? 'is-emph' : '',
            hasEmphasis && !emph ? 'is-muted' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <div className={cls} key={s.key}>
              <span className="tp-slot-tag">{s.label}</span>
              <p>{s.text}</p>
            </div>
          )
        })}
      </div>
    </article>
  )
}
