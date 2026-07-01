import { useState, type FormEvent } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getFeaturedCities, searchCities } from '../data/cityRepository'
import type { City } from '../types'
import { formatUSD } from '../lib/budget'
import {
  CompassIcon,
  SearchIcon,
  StarIcon,
  SparklesIcon,
  RouteIcon,
  WalletIcon,
  CloudRainIcon,
  BookmarkIcon,
  SunIcon,
  MoonIcon,
} from './Icons'
import './HomePage.css'

// Fallback gradients for cities without an authored one (e.g. search results).
const GRADIENT_PALETTE = [
  'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
  'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
]

function gradientFor(city: City): string {
  if (city.gradient) return city.gradient
  let hash = 0
  for (const ch of city.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return GRADIENT_PALETTE[hash % GRADIENT_PALETTE.length]
}

function descriptionFor(city: City): string {
  return city.description ?? `${city.country} · ${city.tags.join(' · ')}`
}

type FeatureAction = 'planner' | 'budget'

const FEATURES: {
  icon: typeof RouteIcon
  title: string
  text: string
  accent: string
  action: FeatureAction
}[] = [
  {
    icon: RouteIcon,
    title: 'Günlük Rota Oluşturma',
    text: 'Her gün için saat saat gezilecek yerleri otomatik planla.',
    accent: '#6366f1',
    action: 'planner',
  },
  {
    icon: WalletIcon,
    title: 'Bütçe Hesaplama',
    text: 'Konaklama, yemek, ulaşım ve aktivite maliyetini anında tahmin et.',
    accent: '#10b981',
    action: 'budget',
  },
  {
    icon: CloudRainIcon,
    title: 'Yağmur Olursa Alternatif Plan',
    text: 'Hava bozarsa kapalı mekan seçenekleriyle planını uyarla.',
    accent: '#0ea5e9',
    action: 'planner',
  },
]

interface HomePageProps {
  onPlan: (city?: string) => void
  onOpenSaved: () => void
  onOpenBudget: () => void
}

export function HomePage({ onPlan, onOpenSaved, onOpenBudget }: HomePageProps) {
  const { theme, toggleTheme } = useTheme()
  const [query, setQuery] = useState('')

  const q = query.trim()
  const visibleCities = q ? searchCities(q) : getFeaturedCities()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onPlan(query.trim())
  }

  const runFeature = (action: FeatureAction) =>
    action === 'budget' ? onOpenBudget() : onPlan()

  return (
    <div className="home">
      <header className="home-nav">
        <div className="home-brand">
          <span className="home-brand-mark">
            <CompassIcon />
          </span>
          <span className="home-brand-text">AI Travel Simulator</span>
        </div>
        <div className="home-nav-actions">
          <button
            type="button"
            className="home-saved-btn"
            onClick={onOpenBudget}
          >
            <WalletIcon width={17} height={17} />
            <span>Bütçe Hesaplayıcı</span>
          </button>
          <button
            type="button"
            className="home-saved-btn"
            onClick={onOpenSaved}
          >
            <BookmarkIcon width={17} height={17} />
            <span>Kayıtlı Planlar</span>
          </button>
          <button
            type="button"
            className="home-theme-btn"
            onClick={toggleTheme}
            aria-label="Temayı değiştir"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <main className="home-main">
        {/* Hero */}
        <section className="home-hero">
          <span className="home-badge">
            <SparklesIcon width={16} height={16} />
            Yapay zeka destekli seyahat planlayıcı
          </span>
          <h1 className="home-title">Nereye gitmek istiyorsun?</h1>
          <p className="home-subtitle">
            Bir şehir yaz; rota, bütçe ve planı senin için hazırlayalım.
          </p>

          <form className="home-search" onSubmit={submit}>
            <SearchIcon className="home-search-icon" />
            <input
              type="text"
              placeholder="Örn. Tokyo, Paris, Londra, İstanbul..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Gitmek istediğin şehir"
            />
            <button type="submit" className="home-search-btn">
              Keşfet
            </button>
          </form>
        </section>

        {/* Popüler şehirler */}
        <section className="home-section">
          <div className="home-section-head">
            <h2>Popüler Şehirler</h2>
            <p>İlham veren destinasyonlar</p>
          </div>

          {visibleCities.length === 0 ? (
            <div className="home-empty">
              <span className="home-empty-emoji">🔍</span>
              <p>“{query}” için sonuç bulunamadı</p>
              <span>Şehir ya da ülke adını kontrol et veya tüm şehirleri gör.</span>
              <button
                type="button"
                className="home-empty-btn"
                onClick={() => setQuery('')}
              >
                Aramayı temizle
              </button>
            </div>
          ) : (
            <div className="home-cities">
              {visibleCities.map((city) => (
                <article className="home-city" key={city.id}>
                  <div
                    className="home-city-banner"
                    style={{ background: gradientFor(city) }}
                  >
                    <span className="home-city-emoji">{city.emoji}</span>
                    <span className="home-city-rating">
                      <StarIcon width={13} height={13} />
                      {city.rating ?? 4.7}
                    </span>
                  </div>
                  <div className="home-city-body">
                    <div className="home-city-head">
                      <h3>{city.name}</h3>
                      <span>{city.country}</span>
                    </div>
                    <p className="home-city-desc">{descriptionFor(city)}</p>
                    <div className="home-city-foot">
                      <span className="home-city-price">
                        {formatUSD(city.dailyCost)}
                        <small>/gün</small>
                      </span>
                      <button
                        type="button"
                        className="home-city-btn"
                        onClick={() => onPlan(city.name)}
                      >
                        Planla
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Özellik kartları */}
        <section className="home-section">
          <div className="home-section-head">
            <h2>Neler Yapabilirsin?</h2>
            <p>AI ile seyahat planlamanın üç akıllı yolu</p>
          </div>

          <div className="home-features">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <button
                  type="button"
                  className="home-feature"
                  key={f.title}
                  onClick={() => runFeature(f.action)}
                >
                  <span
                    className="home-feature-icon"
                    style={{ color: f.accent }}
                  >
                    <Icon width={24} height={24} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                  <span className="home-feature-cta">Aç →</span>
                </button>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <span>✈️ AI Travel Simulator</span>
        <span>Hayalindeki rotayı planla · {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}
