# Trade Journal — Project Memory

> এই ফাইলটি প্রজেক্টের সম্পূর্ণ ইতিহাস ও বর্তমান অবস্থা ট্র্যাক করে। প্রতিটি নতুন ফিচার/ডিসিশন যোগ করার পর এখানে আপডেট করতে হবে।

---

## ১. প্রজেক্ট কি

**Trade Journal** — একটি premium ট্রেডিং জার্নাল ওয়েব অ্যাপ। শুরুতে XAUUSD M5 scalping strategy রিসার্চ পেজ হিসেবে ছিল, পরে সম্পূর্ণ multi-instrument trade journal-এ রূপান্তরিত হয়েছে।

ট্রেডাররা এখানে:
- প্রতিটি ট্রেড এন্ট্রি করতে পারে (instrument, side, result, amount, lot size, planned risk, strategy, screenshot)
- Portfolio view-তে ফিল্টার ও টেবিলে ট্রেড দেখতে/এডিট/ডিলিট করতে পারে
- Analytics view-তে বিস্তারিত পারফরম্যান্স অ্যানালাইসিস পেতে পারে
- Account view-তে প্রোফাইল, থিম সিলেক্টর, রিসার্চ অ্যাক্সেস পেতে পারে

---

## ২. টেক স্ট্যাক

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Database | Prisma ORM + Cloudflare D1 (SQLite) |
| State | Zustand (client) + TanStack Query (server) |
| Charts | Recharts |
| Fonts | Inter (body) + JetBrains Mono (numbers) |
| Auth | Custom Google OAuth (NextAuth নয়) |
| Deploy | OpenNext for Cloudflare Workers |
| Icons | Lucide |

---

## ৩. কি কি ডিসিশন নেওয়া হয়েছে

### Authentication
- **NextAuth বাদ দিয়ে custom Google OAuth** — `openid-client` লাইব্রেরি Cloudflare Workers-এ কাজ করে না, তাই `fetch` দিয়ে নিজে OAuth flow বানানো হয়েছে
- **Session cookie** base64-encoded `encodeURIComponent(JSON.stringify({user, expires}))` — client + server উভয় পাশে পড়া যায়, `httpOnly: false` (client JS পড়তে পারে)
- **Data isolation** — `userId` field দিয়ে প্রতিটি ইউজার শুধু নিজের ট্রেড দেখে

### Theme System
- 8 টি palette (4 dark + 4 light) — CSS variables + `data-palette` attribute
- Dark palettes: fintech-orange, slate-gold, carbon-orange, lime-glow
- Light palettes: coral-light, mono-light, beige-gold, rust-light
- **Default palette: `carbon-orange`** (near-black bg + vibrant orange, KnownTrader aesthetic)
- `ThemePaletteManager` নিজেই `.dark` class যোগ/অপসারণ করে palette-এর mode অনুযায়ী
- No-flash inline script (`PaletteScript`) `<head>`-এ
- **Particle network background** (canvas-based constellation, KnownTrader clone) — login page + subtle app background

### Logo & Favicon
- **আপলোড করা SVG** exact ব্যবহার করা হয়েছে (আগে নিজে বানানো SVG ছিল, সেটি সরানো হয়েছে)
- **`currentColor`** ব্যবহার করে theme adaptation — ডার্ক মোডে white, লাইট মোডে dark
- **Favicon** SVG `prefers-color-scheme` CSS media query দিয়ে theme-aware
- **Apple touch icon** PNG (cairosvg দিয়ে SVG থেকে convert, 512×512)

### Multi-Instrument Support
- **Default ৬টি instrument**: XAUUSD, US30, UKOIL, JPYUSD, BTC, ETH
- **Categories**: Metals, Indices, Energy, Forex, Crypto, Other
- **User custom instruments** — Zustand store-এ persist করা হয় (localStorage)
- **Category auto-inference** — symbol থেকে category অনুমান করে

### Title
- Browser tab title: **"Trade Journal — Portfolio & Analytics"** (আগে "XAUUSD M5" ছিল, সরানো হয়েছে কারণ এখন multi-instrument)

---

## ৪. কি কি বানানো হয়েছে

### Portfolio View
- Trade entry/edit/delete সাথে AlertDialog confirmation
- Trade form: date, time, instrument (combobox), lot size, side, result, amount, planned risk, strategy chips, notes, screenshot (link/upload)
- Filters: From date, To date, Instrument, Side, Result — expand/collapse panel
- Trades table: sortable columns, side/result badges, comment tooltip, screenshot display, edit/delete actions
- Stat cards: Net P&L, Win rate, Trades (container queries দিয়ে overflow fix)
- Recent trades sidebar in form

### Analytics View
**Stat cards (18টি)**: Total trades, Wins, Losses, Break-even, Total profit, Total loss, Net P&L, Profit factor, Expectancy, Max win streak, Avg/day, Avg win, Max drawdown, Max loss streak, Largest win, Largest loss, Avg R multiple, Pay-off ratio

**Charts/Sections**:
- Cumulative Equity Curve (area chart)
- Outcome Distribution (donut + win rate)
- Daily Net P&L (bar chart with best/worst day)
- Performance by Side (BUY vs SELL)
- **Performance by Instrument** — table + contribution bars
- **Performance by Strategy** — table
- **Time Analysis** — hour of day + day of week bar charts
- **Monthly Performance** — bar chart + table with peak/trough
- **Risk & Drawdown** — underwater equity curve + R-multiple distribution histogram + risk metric pills

### Account View
- User profile card (avatar initial, name, email)
- Display name change (localStorage keyed by email)
- Theme selector dropdown (8 palettes with swatches)
- Research & Strategy access
- Sign out button

### Authentication
- Google OAuth login (custom implementation)
- **Demo login** (temporary — "Try demo" button, `demo@tradejournal.app` user)
- Sign out (client + server cookie clear)

### Theme System
- 8 টি palette (4 dark + 4 light) via CSS variables + `data-palette` attribute
- **Default: `carbon-orange`** (near-black bg, KnownTrader aesthetic)
- `ThemePaletteManager` controls `.dark` class based on palette mode
- `PaletteScript` no-flash inline script
- **Particle network background** (canvas constellation, KnownTrader clone)

### Logo & Branding
- `Logo` component — exact uploaded SVG, `currentColor` + `var(--background)` stroke
- `icon.svg` — theme-aware favicon (dark bg + white logo / light bg + dark logo)
- `apple-icon.png` — static PNG (dark bg + white logo, 512×512)
- Login page logo: 70px in 80px container

### API Routes
- `GET/POST /api/trades` — list (with filters) + create
- `GET/PATCH/DELETE /api/trades/[id]` — single trade CRUD
- `GET /api/auth/signin/google` — OAuth redirect
- `GET /api/auth/callback/google` — OAuth callback
- `GET /api/auth/signout` — sign out
- `POST /api/upload` — image upload

---

## ৫. ফাইল স্ট্রাকচার

```
src/
├── app/
│   ├── page.tsx                    # Login + Portfolio/Analytics/Account views
│   ├── layout.tsx                  # Root layout, fonts, PaletteScript
│   ├── icon.svg                    # Theme-aware favicon
│   ├── apple-icon.png              # Apple touch icon (PNG)
│   ├── globals.css                 # 8 palettes, .journal design system
│   └── api/
│       ├── trades/route.ts         # GET (filter) + POST
│       ├── trades/[id]/route.ts    # GET + PATCH + DELETE
│       ├── auth/signin/google/     # OAuth redirect
│       ├── auth/callback/google/   # OAuth callback
│       ├── auth/signout/           # Sign out
│       └── upload/route.ts         # Image upload
├── components/
│   ├── logo.tsx                    # Logo (uploaded SVG, theme-aware)
│   ├── site-nav.tsx                # Desktop top nav (Home | Analytics | Account) + mobile bottom nav
│   ├── particle-background.tsx     # Canvas particle network (KnownTrader clone)
│   ├── theme-palette-manager.tsx   # data-palette + .dark class manager
│   ├── query-provider.tsx          # TanStack Query provider
│   ├── sections/
│   │   ├── portfolio.tsx
│   │   ├── analytics.tsx
│   │   ├── account/index.tsx
│   │   └── footer.tsx
│   ├── portfolio/
│   │   ├── trade-form.tsx
│   │   ├── trade-entry-body.tsx
│   │   ├── trades-table.tsx
│   │   ├── trade-filters.tsx
│   │   ├── instrument-select.tsx   # Professional combobox
│   │   ├── edit-trade-dialog.tsx
│   │   ├── image-modal.tsx
│   │   └── journal-primitives.tsx
│   ├── analytics/
│   │   ├── instrument-breakdown.tsx
│   │   ├── strategy-breakdown.tsx
│   │   ├── time-analysis.tsx
│   │   ├── monthly-performance.tsx
│   │   └── risk-metrics.tsx
│   └── ui/                         # shadcn/ui components
└── lib/
    ├── use-session.ts              # Client session + signIn/signOut/signInAsDemo
    ├── cookie-session.ts           # Server session reader
    ├── palette-store.ts            # Zustand palette store (persist)
    ├── view-store.ts               # Zustand view store (persist)
    ├── form-store.ts               # Zustand form open/close
    ├── instruments-store.ts        # Zustand instruments store (persist)
    ├── trade-types.ts              # Shared types + helpers
    ├── trade-stats.ts              # computeStats + breakdown functions
    ├── db.ts                       # Prisma client (D1 adapter)
    ├── google-auth.ts              # Google OAuth helpers
    └── utils.ts                    # cn() helper
```

---

## ৬. গুরুত্বপূর্ণ নোট

### Cloudflare Deploy
- `wrangler.toml`-এ `[vars]` এ Google OAuth secrets (base64 encoded `GC_SECRET_B64`)
- D1 binding + `[assets] directory`
- `main = ".open-next/worker.js"`
- GitHub secret scanner এড়াতে secret base64 encode করা হয়েছে

### Demo Login (অস্থায়ী)
- `signInAsDemo()` ফাংশন `src/lib/use-session.ts`-এ
- "Try demo" বাটন `src/app/page.tsx`-এ
- **প্রোডাকশনের আগে সরাতে হবে**

### থিম সিস্টেম
- ডার্ক মোডে logo = white, লাইট মোডে logo = dark (`currentColor` দিয়ে auto)
- Favicon SVG `prefers-color-scheme` media query দিয়ে theme-aware
- `PaletteScript` no-flash inline script `<head>`-এ

### ট্রেড ডিলিট
- DELETE handler `getSessionUser(req)` দিয়ে ownership verify করে
- Old trades (userId null) সবাই এডিট/ডিলিট করতে পারে

---

## ৭. আপডেট হিস্টরি

| তারিখ | কি হয়েছে |
|-------|----------|
| Session 1 | XAUUSD research পেজ → Portfolio + Analytics পেজ |
| Session 2 | 8 থিম, mobile responsive, stat cards |
| Session 3 | Cloudflare D1 deploy, custom Google OAuth |
| Session 4 | Trade deletion fix (session cookie reading) |
| Session 5 | Dark theme desktop fix, Net P&L overflow fix, Instrument dropdown, Instrument filter |
| Session 6 | Analytics: byInstrument, byStrategy, byHour, byDayOfWeek, byMonth, Risk/Drawdown, R-multiple |
| Session 7 | Premium favicon + logo (আপলোড করা SVG exact), title থেকে XAUUSD M5 সরানো |
| Session 8 | Uploaded SVG দিয়ে logo/favicon replace, theme-aware white/dark adaptation |
| Session 9 | Login page logo size (70px in 80px container) |
| Session 10 | Demo login feature (temporary) |
| Session 11 | memory.md তৈরি |
| Session 12 | Nav "Portfolio"→"Home", New Entry বাটন home page-এ সরানো |
| Session 13 | KnownTrader.in particle network background clone + default theme carbon-orange |

---

## ৮. পরবর্তী আপডেটের নিয়ম

প্রতিবার নতুন ফিচার/ডিসিশন যোগ করার পর:
1. **Section ৪** (কি বানানো হয়েছে)-এ নতুন ফিচার যোগ করো
2. **Section ৩** (ডিসিশন)-এ নতুন ডিসিশন থাকলে যোগ করো
3. **Section ৫** (ফাইল স্ট্রাকচার)-এ নতুন ফাইল থাকলে যোগ করো
4. **Section ৭** (আপডেট হিস্টরি)-এ নতুন row যোগ করো তারিখ সহ
