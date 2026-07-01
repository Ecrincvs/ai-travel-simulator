import { useMemo, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { estimateBudget, VERDICT_META } from '../lib/budgetCalc'
import { formatUSD } from '../lib/budget'
import { TIER_LABELS } from '../lib/mockPlanner'
import type { TripTier } from '../types'
import {
  CompassIcon,
  SunIcon,
  MoonIcon,
  WalletIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  BedIcon,
  UtensilsIcon,
  CarIcon,
  TicketIcon,
} from './Icons'
import './BudgetCalculatorPage.css'

const TIERS: TripTier[] = ['economy', 'standard', 'luxury']

interface BudgetCalculatorPageProps {
  onBack: () => void
}

export function BudgetCalculatorPage({ onBack }: BudgetCalculatorPageProps) {
  const { theme, toggleTheme } = useTheme()
  const [city, setCity] = useState('')
  const [daysStr, setDaysStr] = useState('4')
  const [peopleStr, setPeopleStr] = useState('2')
  const [budgetStr, setBudgetStr] = useState('2000')
  const [tier, setTier] = useState<TripTier>('standard')

  const days = Number(daysStr)
  const people = Number(peopleStr)
  const budget = Number(budgetStr)
  const daysValid =
    daysStr.trim() !== '' && Number.isInteger(days) && days >= 1 && days <= 30
  const peopleValid =
    peopleStr.trim() !== '' &&
    Number.isInteger(people) &&
    people >= 1 &&
    people <= 20
  const budgetValid =
    budgetStr.trim() !== '' &&
    Number.isFinite(budget) &&
    budget >= 0 &&
    budget <= 1000000

  // estimateBudget clamps internally, so the panel stays valid while the user
  // is mid-typing; the inline warnings tell them what to fix.
  const est = useMemo(
    () => estimateBudget({ city, days, people, budget, tier }),
    [city, days, people, budget, tier],
  )

  const categories = [
    { label: 'Konaklama', value: est.accommodation, icon: <BedIcon width={17} height={17} />, color: '#8b5cf6' },
    { label: 'Yemek', value: est.food, icon: <UtensilsIcon width={17} height={17} />, color: '#ec4899' },
    { label: 'Aktivite', value: est.activities, icon: <TicketIcon width={17} height={17} />, color: '#f59e0b' },
    { label: 'Ulaşım', value: est.transport, icon: <CarIcon width={17} height={17} />, color: '#10b981' },
  ]

  const verdict = VERDICT_META[est.verdict]
  const verdictMessage =
    est.verdict === 'ok'
      ? `Bütçen bu seyahat için yeterli. Yaklaşık ${formatUSD(est.diff)} pay kalıyor.`
      : est.verdict === 'tight'
        ? `Bütçen sınırda. Tahmini maliyete çok yakınsın, beklenmedik masraflara dikkat et.`
        : budget <= 0
          ? 'Bir bütçe gir; tahmini maliyet ile karşılaştıralım.'
          : `Bütçe riskli. Tahmini maliyet bütçeni ${formatUSD(-est.diff)} aşıyor.`

  return (
    <div className="bc">
      <header className="bc-nav">
        <div className="bc-nav-left">
          <button
            type="button"
            className="bc-back"
            onClick={onBack}
            aria-label="Ana sayfaya dön"
          >
            ←
          </button>
          <div className="bc-brand">
            <span className="bc-brand-mark">
              <CompassIcon />
            </span>
            <span className="bc-brand-text">AI Travel Simulator</span>
          </div>
        </div>
        <button
          type="button"
          className="bc-theme-btn"
          onClick={toggleTheme}
          aria-label="Temayı değiştir"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <main className="bc-main">
        <div className="bc-head">
          <span className="bc-badge">
            <WalletIcon width={16} height={16} />
            Budget Calculator
          </span>
          <h1>Seyahat bütçeni hesapla</h1>
          <p>Bilgileri gir; günlük, kişi başı ve kategori bazlı tahminleri gör.</p>
        </div>

        <div className="bc-layout">
          {/* Form */}
          <form className="bc-form" onSubmit={(e) => e.preventDefault()}>
            <label className="bc-field">
              <span className="bc-label">
                <MapPinIcon width={15} height={15} /> Şehir
              </span>
              <input
                type="text"
                placeholder="Örn. İstanbul, Paris, Tokyo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>

            <div className="bc-row">
              <label className="bc-field">
                <span className="bc-label">
                  <CalendarIcon width={15} height={15} /> Gün sayısı
                </span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={daysStr}
                  onChange={(e) => setDaysStr(e.target.value)}
                  aria-invalid={!daysValid}
                />
                {!daysValid && (
                  <span className="bc-warn">1–30 arası tam sayı gir.</span>
                )}
              </label>
              <label className="bc-field">
                <span className="bc-label">
                  <UsersIcon width={15} height={15} /> Kişi sayısı
                </span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={peopleStr}
                  onChange={(e) => setPeopleStr(e.target.value)}
                  aria-invalid={!peopleValid}
                />
                {!peopleValid && (
                  <span className="bc-warn">1–20 arası tam sayı gir.</span>
                )}
              </label>
            </div>

            <label className="bc-field">
              <span className="bc-label">
                <WalletIcon width={15} height={15} /> Toplam bütçe ($)
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={budgetStr}
                onChange={(e) => setBudgetStr(e.target.value)}
                aria-invalid={!budgetValid}
              />
              {!budgetValid && (
                <span className="bc-warn">Geçerli bir bütçe gir (0+).</span>
              )}
            </label>

            <div className="bc-field">
              <span className="bc-label">Seyahat tipi</span>
              <div className="bc-segmented">
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
          </form>

          {/* Results */}
          <section className="bc-results">
            <div className="bc-summary">
              <div className="bc-summary-sub">
                {city.trim() || 'Seyahat'} · {daysValid ? days : '—'} gün ·{' '}
                {peopleValid ? people : '—'} kişi · {TIER_LABELS[tier]}
              </div>
              <div className="bc-summary-figures">
                <div className="bc-figure">
                  <span className="bc-figure-label">Günlük ortalama bütçe</span>
                  <span className="bc-figure-value">
                    {formatUSD(est.dailyAverage)}
                  </span>
                </div>
                <div className="bc-figure">
                  <span className="bc-figure-label">Kişi başı maliyet</span>
                  <span className="bc-figure-value">
                    {formatUSD(est.perPerson)}
                  </span>
                </div>
              </div>
              <div className="bc-summary-total">
                <span>Tahmini toplam maliyet</span>
                <strong>{formatUSD(est.estimatedTotal)}</strong>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bc-breakdown">
              <h3 className="bc-section-title">Harcama Kırılımı</h3>
              <ul className="bc-cat-list">
                {categories.map((c) => {
                  const pct = est.estimatedTotal
                    ? Math.round((c.value / est.estimatedTotal) * 100)
                    : 0
                  return (
                    <li className="bc-cat" key={c.label}>
                      <span className="bc-cat-icon" style={{ color: c.color }}>
                        {c.icon}
                      </span>
                      <div className="bc-cat-main">
                        <div className="bc-cat-top">
                          <span>{c.label}</span>
                          <strong>
                            {formatUSD(c.value)} <em>· %{pct}</em>
                          </strong>
                        </div>
                        <div className="bc-bar">
                          <span
                            style={{ width: `${pct}%`, background: c.color }}
                          />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Verdict */}
            <div
              className={`bc-verdict bc-verdict-${est.verdict}`}
              style={{ ['--v' as string]: verdict.color }}
            >
              <span className="bc-verdict-dot" />
              <div>
                <p className="bc-verdict-title">{verdict.label}</p>
                <p className="bc-verdict-text">{verdictMessage}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
