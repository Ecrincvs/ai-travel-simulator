import type { TravelPreference } from '../types'

interface PreferenceMeta {
  key: TravelPreference
  label: string
  emoji: string
  /** Lowercase (tr) keywords matched against activity text to rank it. */
  keywords: string[]
  /** Note shown in the plan when this preference is selected. */
  note: string
}

/** Ordered list used to render the selector; also the source for lookups. */
export const TRAVEL_PREFERENCES: PreferenceMeta[] = [
  {
    key: 'museum',
    label: 'Müze / Tarih',
    emoji: '🏛️',
    keywords: [
      'müze', 'tarih', 'saray', 'kale', 'antik', 'tapınak', 'cami',
      'katedral', 'kilise', 'anıt', 'galeri', 'harabe', 'forum', 'kalıntı',
      'sarnıç', 'bazilika', 'manastır', 'meydan',
    ],
    note: 'Tarihi ve kültürel mekanlar öne çıkarıldı.',
  },
  {
    key: 'food',
    label: 'Yemek',
    emoji: '🍽️',
    keywords: [
      'yemek', 'yemeği', 'lokanta', 'restoran', 'kahvaltı', 'tadım',
      'lezzet', 'balık', 'meze', 'tapas', 'ramen', 'suşi', 'pizza', 'gelato',
      'kahve', 'çay', 'street food', 'ceviche', 'gyros', 'pho', 'crêpe',
      'bistro', 'fondü', 'dim sum', 'barbekü',
    ],
    note: 'Yeme-içme durakları önceliklendirildi.',
  },
  {
    key: 'nature',
    label: 'Doğa',
    emoji: '🌿',
    keywords: [
      'park', 'doğa', 'şelale', 'plaj', 'göl', 'bahçe', 'tepe', 'ada',
      'orman', 'sahil', 'manzara', 'gün batımı', 'dağ', 'vadi', 'krater',
      'şnorkel', 'dalış', 'botanik', 'bisiklet', 'yüz',
    ],
    note: 'Doğa ve açık hava rotaları eklendi.',
  },
  {
    key: 'shopping',
    label: 'Alışveriş',
    emoji: '🛍️',
    keywords: [
      'alışveriş', 'çarşı', 'pazar', 'butik', 'avm', 'mağaza', 'souk',
      'market', 'bit pazarı',
    ],
    note: 'Alışveriş noktaları plana dahil edildi.',
  },
  {
    key: 'nightlife',
    label: 'Gece Hayatı',
    emoji: '🌃',
    keywords: [
      'gece', 'bar', 'kulüp', 'rooftop', 'müzik', 'şov', 'eğlence', 'pub',
      'fado', 'tango', 'salsa', 'samba', 'ışık', 'konser', 'opera',
      'müzikal', 'kazino',
    ],
    note: 'Gece hayatı seçenekleri vurgulandı.',
  },
  {
    key: 'family',
    label: 'Aile Dostu',
    emoji: '👨‍👩‍👧',
    keywords: [
      'park', 'bahçe', 'akvaryum', 'hayvanat', 'tekne', 'dönme dolap',
      'plaj', 'tren', 'penguen', 'fil', 'maymun', 'kukla', 'teleferik',
    ],
    note: 'Aile ve çocuk dostu mekanlar önceliklendirildi.',
  },
  {
    key: 'lowwalk',
    label: 'Düşük Yürüyüş',
    emoji: '🧎',
    keywords: [
      'tekne', 'tramvay', 'teleferik', 'vapur', 'feribot', 'metro',
      'araba', 'funiküler', 'gondol', 'abra', 'maglev', 'otobüs',
      'kruvaziyer', 'manzara',
    ],
    note: 'Kısa yürüyüş: ulaşım ağırlıklı, yakın duraklar tercih edildi.',
  },
]

export const PREF_BY_KEY: Record<TravelPreference, PreferenceMeta> =
  Object.fromEntries(TRAVEL_PREFERENCES.map((p) => [p.key, p])) as Record<
    TravelPreference,
    PreferenceMeta
  >

/** How many of the selected preferences an activity matches (0 = none). */
export function scoreActivity(
  activity: string,
  prefs: TravelPreference[],
): number {
  if (prefs.length === 0) return 0
  const text = activity.toLocaleLowerCase('tr')
  let score = 0
  for (const p of prefs) {
    if (PREF_BY_KEY[p].keywords.some((k) => text.includes(k))) score++
  }
  return score
}

/** The display notes for the selected preferences, in selector order. */
export function preferenceNotes(prefs: TravelPreference[]): string[] {
  return TRAVEL_PREFERENCES.filter((p) => prefs.includes(p.key)).map(
    (p) => p.note,
  )
}
