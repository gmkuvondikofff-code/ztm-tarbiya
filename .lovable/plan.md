
## Maqsad

Loyiha dizaynini o'zgartirmasdan, 2015-2016 yildan keyingi eski kompyuter va brauzerlarda ham ishlashini ta'minlash (masalan Chrome 50+, Safari 10+, Firefox 50+, Edge Legacy).

## Hozirgi muammo

Loyiha juda zamonaviy texnologiyalarga tayanadi:
- **`oklch()` rang funksiyasi** (`src/styles.css`) — faqat 2023+ brauzerlarda ishlaydi. Eski brauzerlarda hech qanday rang ko'rinmaydi (oq/qora ekran).
- **Tailwind v4** + `@import "tailwindcss"` — CSS cascade layers, `@property`, `color-mix()` ishlatadi (2022+).
- **ES2022+ JavaScript** (Vite default `esnext` target) — `??`, optional chaining, top-level await.
- **`backdrop-blur`, CSS Grid `subgrid`, container queries** — turli joylarda.

## Rejasi

### 1. Rang tizimini eski brauzerlarga moslash (`src/styles.css`)
- Har bir `oklch(...)` qiymat uchun **`@supports not (color: oklch(0 0 0))`** fallback bloki qo'shamiz — barcha CSS o'zgaruvchilarni `hsl()` ekvivalentiga aylantiramiz.
- `color-mix()` ishlatilgan joylarda (`shadow-elegant` va soyalar) oddiy `rgba()` fallback beramiz.
- Dizayn aynan o'sha — faqat eski brauzerlar uchun parallel ranglar.

### 2. Build target'ni pasaytirish (`vite.config.ts`)
- `build.target: ['chrome58', 'firefox57', 'safari11', 'edge18']` qo'shamiz.
- `esbuild.target` ham xuddi shu qiymatga.
- Bu `??`, optional chaining va boshqa zamonaviy sintaksisni eski brauzerlar tushunadigan koda aylantiradi.

### 3. Polyfill'lar
- `bun add -d @vitejs/plugin-legacy` qo'shamiz va `vite.config.ts`'ga legacy plugin sozlaymiz. Bu eski brauzerlarga avtomatik ravishda alohida bundle va polyfill yuboradi (Promise.allSettled, fetch, IntersectionObserver, ResizeObserver va h.k.).
- `core-js` polyfilllari avtomatik kiritiladi.

### 4. CSS xususiyatlarini tekshirish
- `backdrop-blur` (Header'da) uchun `@supports not (backdrop-filter: blur(0))` fallback — solid background.
- `aspect-ratio` ishlatilgan joylarda padding-bottom fallback (Tailwind v4 buni qo'llab-quvvatlaydi, lekin tekshiramiz).
- `gap` flexbox'da — Safari 14+, kerak bo'lsa margin fallback (kam ehtimol).

### 5. HTML meta va shrift yuklash
- `index.html`'ga `<meta http-equiv="X-UA-Compatible" content="IE=edge">` qo'shamiz.
- Google Fonts uchun `&display=swap` ishlatilganini tekshiramiz.

### 6. Tekshirish
- Build qilib chiqaramiz va `dist/`'da legacy bundle hosil bo'lganini ko'ramiz.
- Browser konsolida modern bundle'ni vizual tekshiramiz — dizayn bir xil qolishi kerak.

## Texnik tafsilotlar

**Maqsadli brauzerlar:** Chrome 58+ (2017 apr), Firefox 57+ (2017 noy), Safari 11+ (2017 sen), Edge 18+. 2015-2016 IE11/Edge Legacy uchun to'liq qo'llab-quvvatlash juda qimmat (React 19 IE'ni umuman qo'llab-quvvatlamaydi) — shuning uchun amaliy chegara ~2017.

**Eslatma:** React 19 va TanStack Start IE11'ni qo'llab-quvvatlamaydi. Agar haqiqatan ham IE11 (2015 yil Windows 7) kerak bo'lsa, bu butun stack'ni almashtirishni talab qiladi. Sizga 2017+ chegara mos keladimi, yoki haqiqatan IE11/eski Safari 9 kerakmi?

## O'zgaradigan fayllar

- `src/styles.css` — `@supports` fallback bloklari
- `vite.config.ts` — `build.target` va `@vitejs/plugin-legacy`
- `package.json` — yangi dev dependency
- `index.html` — meta tag
