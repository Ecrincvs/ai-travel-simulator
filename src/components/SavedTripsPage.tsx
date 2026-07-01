import { useTheme } from '../context/ThemeContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { TIER_LABELS } from '../lib/mockPlanner'
import { formatUSD } from '../lib/budget'
import type { SavedPlan } from '../types'
import {
  CompassIcon,
  SunIcon,
  MoonIcon,
  BookmarkIcon,
  TrashIcon,
  CalendarIcon,
  WalletIcon,
  MapPinIcon,
  RouteIcon,
  SparklesIcon,
} from './Icons'
import './SavedTripsPage.css'

interface SavedTripsPageProps {
  onBack: () => void
  onOpen: (plan: SavedPlan) => void
  onNew: () => void
}

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function SavedTripsPage({ onBack, onOpen, onNew }: SavedTripsPageProps) {
  const { theme, toggleTheme } = useTheme()
  const [plans, setPlans] = useLocalStorage<SavedPlan[]>('ats-plans', [])

  const handleDelete = (id: string) =>
    setPlans((prev) => prev.filter((p) => p.id !== id))

  return (
    <div className="st">
      <header className="st-nav">
        <div className="st-nav-left">
          <button
            type="button"
            className="st-back"
            onClick={onBack}
            aria-label="Ana sayfaya dön"
          >
            ←
          </button>
          <div className="st-brand">
            <span className="st-brand-mark">
              <CompassIcon />
            </span>
            <span className="st-brand-text">AI Travel Simulator</span>
          </div>
        </div>
        <button
          type="button"
          className="st-theme-btn"
          onClick={toggleTheme}
          aria-label="Temayı değiştir"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <main className="st-main">
        <div className="st-head">
          <div>
            <span className="st-badge">
              <BookmarkIcon width={16} height={16} />
              Saved Trips
            </span>
            <h1>Kaydedilen Planların</h1>
            <p>
              {plans.length > 0
                ? `${plans.length} plan kaydedildi. Tekrar açmak için bir karta dokun.`
                : 'Oluşturduğun planları burada saklayabilirsin.'}
            </p>
          </div>
          {plans.length > 0 && (
            <button type="button" className="st-new-btn" onClick={onNew}>
              <SparklesIcon width={16} height={16} />
              Yeni Plan
            </button>
          )}
        </div>

        {plans.length === 0 ? (
          <div className="st-empty">
            <span className="st-empty-icon">
              <RouteIcon width={34} height={34} />
            </span>
            <h2>Henüz kayıtlı plan yok</h2>
            <p>
              Bir seyahat planı oluştur ve <strong>“Planı Kaydet”</strong> ile
              buraya ekle. Kaydettiğin planlar cihazında saklanır.
            </p>
            <button type="button" className="st-empty-btn" onClick={onNew}>
              <SparklesIcon width={17} height={17} />
              İlk Planını Oluştur
            </button>
          </div>
        ) : (
          <div className="st-grid">
            {plans.map((plan) => (
              <article
                className="st-card"
                key={plan.id}
                onClick={() => onOpen(plan)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpen(plan)
                  }
                }}
              >
                <div className="st-card-top">
                  <div className="st-card-title">
                    <MapPinIcon width={16} height={16} />
                    <h3>{plan.city}</h3>
                  </div>
                  <button
                    type="button"
                    className="st-card-del"
                    aria-label="Planı sil"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(plan.id)
                    }}
                  >
                    <TrashIcon width={16} height={16} />
                  </button>
                </div>

                <span className="st-tier">{TIER_LABELS[plan.tier]}</span>

                <div className="st-meta">
                  <div className="st-meta-row">
                    <span className="st-meta-label">
                      <CalendarIcon width={14} height={14} /> Gün sayısı
                    </span>
                    <span className="st-meta-value">{plan.days.length} gün</span>
                  </div>
                  <div className="st-meta-row">
                    <span className="st-meta-label">
                      <WalletIcon width={14} height={14} /> Bütçe
                    </span>
                    <span className="st-meta-value">
                      {plan.budget > 0 ? formatUSD(plan.budget) : '—'}
                    </span>
                  </div>
                  <div className="st-meta-row">
                    <span className="st-meta-label">Tahmini maliyet</span>
                    <span className="st-meta-value st-meta-cost">
                      {formatUSD(plan.estimatedTotal)}
                    </span>
                  </div>
                </div>

                <div className="st-card-foot">
                  <span className="st-date">{formatDate(plan.savedAt)}</span>
                  <span className="st-open">Planı aç →</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
