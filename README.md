# ✈️ AI Travel Simulator

Yapay zeka destekli seyahat planlama panosu. Modern, SaaS tarzı, mobil uyumlu ve koyu/açık tema destekli bir React + TypeScript uygulaması.

## Özellikler

- 🔎 **Nereye gitmek istiyorsun?** — akıllı arama kutusu (şehir/ülke/etikete göre filtreler)
- 🌍 **Popüler şehirler** — 8 destinasyon, puan ve günlük maliyet kartları
- 🧭 **Seyahat planlayıcı** — tarih, gün, kişi sayısı ve seyahat tarzı ayarları
- 💰 **Bütçe hesaplayıcı** — uçuş, konaklama, yeme-içme, aktivite ve ulaşım kırılımı (canlı güncellenir)
- 🔖 **Kaydedilen seyahatler** — `localStorage` üzerinde kalıcı olarak saklanır
- 🌗 **Koyu / açık tema** — tercih tarayıcıda hatırlanır
- 📱 **Tam responsive** — mobilde daraltılabilir kenar çubuğu

## Teknolojiler

- React 19 + TypeScript
- Vite 8
- CSS değişkenleri ile tema sistemi (harici UI kütüphanesi yok)

## Başlatma

```bash
npm install
npm run dev      # geliştirme sunucusu (http://localhost:5173)
npm run build    # üretim derlemesi
npm run preview  # üretim önizlemesi
```

## Proje yapısı

```
src/
├── components/     # Sidebar, Topbar, SearchHero, PopularCities,
│                   # TravelPlanner, BudgetCalculator, SavedTrips, Icons
├── context/        # ThemeContext (koyu/açık tema)
├── data/           # cities.ts (popüler şehir verisi)
├── hooks/          # useLocalStorage
├── lib/            # budget.ts (bütçe hesaplama)
├── types.ts        # ortak tipler
└── App.tsx         # ana panel düzeni
```
