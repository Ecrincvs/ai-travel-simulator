import type { DayPlan, TripPlan } from '../types'

export type WeatherType = 'sunny' | 'rainy' | 'cold' | 'hot'

export const WEATHER_ORDER: WeatherType[] = ['sunny', 'rainy', 'cold', 'hot']

export const WEATHER_META: Record<
  WeatherType,
  { label: string; emoji: string; accent: string; summary: string }
> = {
  sunny: {
    label: 'Güneşli',
    emoji: '☀️',
    accent: '#f59e0b',
    summary: 'Açık hava aktiviteleri için ideal.',
  },
  rainy: {
    label: 'Yağmurlu',
    emoji: '🌧️',
    accent: '#0ea5e9',
    summary: 'Kapalı mekan alternatiflerine geç.',
  },
  cold: {
    label: 'Soğuk',
    emoji: '❄️',
    accent: '#38bdf8',
    summary: 'İç mekan ağırlıklı, kısa yürüyüşler.',
  },
  hot: {
    label: 'Çok Sıcak',
    emoji: '🔥',
    accent: '#ef4444',
    summary: 'Sabah & akşam aktivitelerini öne çıkar.',
  },
}

export type SlotKey = 'morning' | 'noon' | 'evening'

export interface WeatherAdaptation {
  weather: WeatherType
  note: string
  tips: string[]
  days: DayPlan[]
  /** Slots to visually emphasize (e.g. morning & evening when it's very hot) */
  emphasize: SlotKey[]
}

const NOTES: Record<WeatherType, { note: string; tips: string[] }> = {
  sunny: {
    note: 'Hava güneşli — planın olduğu gibi açık hava için uygun.',
    tips: [
      'Güneş kremi ve şapka al',
      'Yanında su bulundur',
      'Açık hava aktivitelerinin tadını çıkar',
    ],
  },
  rainy: {
    note: 'Yağmurlu hava — gün boyu kapalı mekan alternatiflerine geçildi.',
    tips: [
      'Yanına şemsiye / yağmurluk al',
      'Müze ve kapalı mekanları tercih et',
      'Ulaşımda metro / tramvay kullan',
    ],
  },
  cold: {
    note: 'Soğuk hava — iç mekan ağırlıklı, aralarda kısa yürüyüşler.',
    tips: [
      'Kat kat giyin',
      'Kısa yürüyüşlerle ısın',
      'Sıcak içecek molaları ver',
    ],
  },
  hot: {
    note: 'Çok sıcak — sabah ve akşam aktiviteleri öne çıkarıldı, öğlen serinleme molası.',
    tips: [
      'Öğlen 12–16 arası gölgede / serinde kal',
      'Bol su iç',
      'Aktiviteleri sabah erken ve akşam serininde yap',
    ],
  },
}

function cyc(list: string[], i: number): string {
  const n = list.length
  return list[((i % n) + n) % n]
}

/**
 * Mock weather adaptation. Rewrites the day-by-day slots based on the chosen
 * scenario, reusing the plan's city-specific indoor pool. No network / AI.
 */
export function adaptPlan(plan: TripPlan, weather: WeatherType): WeatherAdaptation {
  const indoor = plan.rainyPlan.length
    ? plan.rainyPlan
    : ['Kapalı bir mekânda vakit geçir']

  const days: DayPlan[] = plan.days.map((d, i) => {
    switch (weather) {
      case 'rainy':
        return {
          ...d,
          morning: cyc(indoor, i),
          noon: cyc(indoor, i + 1),
          evening: cyc(indoor, i + 2),
        }
      case 'hot':
        return { ...d, noon: `Öğle sıcağında serinle: ${cyc(indoor, i)}` }
      case 'cold':
        return {
          ...d,
          morning: cyc(indoor, i),
          noon: 'Kısa bir yürüyüş + sıcak içecek molası',
          evening: cyc(indoor, i + 1),
        }
      default:
        return { ...d }
    }
  })

  return {
    weather,
    note: NOTES[weather].note,
    tips: NOTES[weather].tips,
    days,
    emphasize: weather === 'hot' ? ['morning', 'evening'] : [],
  }
}
