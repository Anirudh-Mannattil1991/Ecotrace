# 🌿 EcoTrace

**Decarbonizing Commerce, One Transaction at a Time.**

> An AI-powered sustainability dashboard that converts financial transaction data into actionable environmental insights for SMEs and conscious consumers.

---

## 🚀 Live Demo

No sign-up required. Click **"🎯 Try Demo Account"** on the login page to instantly explore the full dashboard using pre-loaded data from a fictional tech company, **TechFlow Solutions**.

| Demo Credential | Value |
|---|---|
| **Email** | `demo@ecotrace.app` |
| **Mode** | No password needed — click the demo button |
| **Company** | TechFlow Solutions (Technology sector) |
| **Dataset** | 17 pre-loaded transactions across 7 categories, Jan–Feb 2025 |

> The demo account runs entirely in your browser using `localStorage`. No Supabase account or API keys are required to explore it.

---

## 🎯 The Problem: Carbon Complexity

Most small businesses have zero visibility into how their spending translates to CO₂ emissions. They lack the tools, time, and expertise to calculate, benchmark, or reduce their carbon footprint. EcoTrace eliminates this barrier — upload a CSV of transactions and get a full sustainability picture in seconds.

---

## ✨ Features

### 🔢 Automated Transaction-to-Carbon Engine
- Upload a `.csv` file of financial transactions or load a **Mock Stripe feed**
- The engine maps each spending category to a CO₂ coefficient (kg CO₂ per USD), sourced from the **EPA GHG Protocol**
- CO₂ is calculated automatically on ingestion; no manual input required
- Fuzzy category matching handles messy or inconsistently labelled transaction data

### 📊 Eco-Pulse Dashboard
- **Carbon Grade** (A–F) based on your carbon intensity (kg CO₂ per $1,000 spent)
- **Total footprint** in kg CO₂ alongside total spend tracked
- **Emissions Breakdown** — interactive pie chart by spending category
- **Monthly Trend** — line chart showing CO₂ trajectory month-over-month
- **Transaction Table** — sortable, searchable, paginated; includes per-row emissions intensity colour coding

### 🤖 AI Sustainability Coach *(powered by Claude)*
- Calls the **Anthropic Claude API** (`claude-sonnet-4-20250514`) server-side
- Analyses your highest emission category and returns structured JSON insights including:
  - A punchy headline recommendation
  - 3 specific, effort-rated actions with **Singapore/APAC-specific local context**
  - 3 quick wins with estimated CO₂ savings
  - A benchmark note comparing your carbon intensity to industry average
- Insights are cached in Supabase (or `localStorage` in demo mode) — no redundant API calls

### 📈 Green-Line Benchmark
- Horizontal bar chart comparing your carbon intensity against **industry ideal** and **sector average** targets
- Covers 7 sectors: Air Travel, Road Freight, Retail, Food, IT/Cloud, Energy, Manufacturing
- Includes a **Financial Inclusion callout**: businesses achieving Grade B or above may qualify for sustainability-linked loan programmes from DBS, OCBC, and UOB

### 📄 Exportable Impact Report *(PDF)*
- One-click PDF export via `@react-pdf/renderer`
- Includes: cover page with carbon grade, category breakdown table, AI insight recommendations, and data source attribution
- Downloaded as `EcoTrace_Impact_Report_[YYYY-MM].pdf`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + CSS custom properties |
| **Charts** | Recharts |
| **Database** | Supabase (Postgres + Auth) |
| **AI** | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| **PDF Export** | `@react-pdf/renderer` |
| **CSV Parsing** | `papaparse` |
| **Icons** | `lucide-react` |
| **Deployment** | Vercel |

---

## 🧮 Carbon Coefficients

All coefficients are expressed as **kg CO₂ per USD spent**, sourced from the EPA GHG Protocol and IPCC AR6.

| Category | Key | Coefficient |
|---|---|---|
| ✈️ Air Travel | `air_travel` | 0.400 kg/$  |
| 🚚 Road Freight | `road_freight` | 0.320 kg/$ |
| 🚢 Sea Freight | `sea_freight` | 0.180 kg/$ |
| ⚡ Energy & Utilities | `energy_utilities` | 0.233 kg/$ |
| 🏭 Manufacturing | `manufacturing` | 0.290 kg/$ |
| ☁️ IT & Cloud | `it_cloud` | 0.035 kg/$ |
| 🍽️ Food & Hospitality | `food_hospitality` | 0.120 kg/$ |
| 🛒 Local Groceries | `local_groceries` | 0.050 kg/$ |
| 💼 Professional Services | `professional_svcs` | 0.025 kg/$ |
| 📦 Retail & E-Commerce | `retail_ecommerce` | 0.095 kg/$ |

### Carbon Grade Scale

| Grade | Carbon Intensity | Label |
|---|---|---|
| **A** | < 50 kg per $1,000 | Excellent |
| **B** | 50–120 kg per $1,000 | Good |
| **C** | 120–220 kg per $1,000 | Average |
| **D** | 220–350 kg per $1,000 | Poor |
| **F** | > 350 kg per $1,000 | Critical |

---

## 📁 CSV Upload Format

Your CSV must include these four columns:

```
date,description,category,amount_usd
2025-01-05,Singapore Airlines SQ412,air_travel,1200.00
2025-01-08,AWS Monthly Bill,it_cloud,340.00
2025-01-12,DHL Express Shipment,road_freight,875.00
```

A **downloadable template** is available from the Upload page inside the app.

Valid values for `category` are the keys listed in the Carbon Coefficients table above. The app includes fuzzy matching to suggest the correct category if an unknown value is supplied.

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works) — *only needed for full auth; skip for demo mode*
- An Anthropic API key — *only needed for the live AI Insights feature; demo mode uses cached insights*

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ecotrace.git
cd ecotrace

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Edit .env.local and fill in your keys (see below)

# 4. Set up the Supabase database
# Copy the contents of supabase_schema.sql and run it in your
# Supabase project's SQL Editor at:
# https://supabase.com/dashboard/project/_/sql

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **"🎯 Try Demo Account"** to skip Supabase setup entirely.

### Environment Variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

> ⚠️ `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are **server-side only** and are never exposed to the browser.

---

## 🗄️ Database Schema

Three tables are created in Supabase, all with Row Level Security (RLS) enabled:

- **`profiles`** — company name and industry linked to each authenticated user
- **`transactions`** — individual financial transactions with calculated `co2_kg`
- **`ai_insights`** — cached Claude API responses stored as `JSONB`

An auto-trigger (`on_auth_user_created`) creates a profile row automatically on signup. See [`supabase_schema.sql`](./supabase_schema.sql) for the full SQL.

---

## 🏗️ Project Structure

```
ecotrace/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── auth/
│   │   ├── login/page.tsx            # Login + demo button
│   │   └── signup/page.tsx           # Sign-up with company info
│   ├── dashboard/
│   │   ├── page.tsx                  # Eco-Pulse Dashboard
│   │   ├── upload/page.tsx           # CSV upload + Mock Stripe
│   │   ├── insights/page.tsx         # AI Sustainability Coach
│   │   ├── benchmark/page.tsx        # Green-Line Benchmark
│   │   ├── settings/page.tsx         # Profile settings
│   │   └── layout.tsx                # Sidebar layout wrapper
│   └── api/
│       ├── transactions/bulk/        # Bulk transaction ingestion
│       ├── mock-stripe/              # Mock Stripe feed endpoint
│       └── insights/generate/        # Anthropic Claude API call
├── components/
│   ├── Sidebar.tsx
│   ├── Toast.tsx
│   ├── TransactionTable.tsx
│   ├── ExportPDFButton.tsx
│   ├── EcoTraceReport.tsx            # PDF report template
│   └── charts/
│       ├── EmissionsBreakdownChart.tsx
│       └── MonthlyTrendChart.tsx
├── lib/
│   ├── carbonCoefficients.ts         # Coefficient map + colour palette
│   ├── carbonGrade.ts                # A–F grading logic
│   ├── categoryMatcher.ts            # Fuzzy category matching
│   ├── demoMode.ts                   # Demo data + localStorage helpers
│   ├── authContext.tsx               # Auth state (real + demo mode)
│   └── supabase.ts                   # Supabase client
├── supabase_schema.sql               # Full DB schema with RLS
└── vercel.json                       # Vercel deployment config
```

---

## 🚢 Deployment

The app is pre-configured for **Vercel**. To deploy:

1. Push the repository to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add the four environment variables in the Vercel project settings
4. Deploy — Vercel auto-detects Next.js and uses the config in `vercel.json`

---

## 🔬 Demo Mode — How It Works

Demo mode requires **no Supabase account and no API keys**. It is activated by clicking **"🎯 Try Demo Account"** on the login screen.

Under the hood:

- `enableDemoMode()` writes `ecotrace_demo_mode = true` to `localStorage`
- `AuthContext` detects this flag on load and injects a synthetic `User` object for **TechFlow Solutions**
- The dashboard, upload, and insights pages check `isDemoUser` and swap Supabase calls for the local constants in `lib/demoMode.ts`
- A pre-built AI insight (`DEMO_AI_INSIGHT`) is loaded immediately without calling the Anthropic API
- Demo state persists across page refreshes until the user signs out

To exit demo mode, click **Logout** in the sidebar.

---

## 📊 Demo Dataset — TechFlow Solutions

The demo account comes pre-loaded with 17 transactions across Jan–Feb 2025:

| Category | Transactions | Total Spend | Total CO₂ |
|---|---|---|---|
| ✈️ Air Travel | 3 | $2,400 | 960 kg |
| 🚚 Road Freight | 3 | $970 | 310.4 kg |
| ☁️ IT & Cloud | 3 | $1,350 | 47.25 kg |
| 💼 Professional Services | 2 | $3,500 | 87.5 kg |
| ⚡ Energy & Utilities | 2 | $650 | 151.45 kg |
| 🍽️ Food & Hospitality | 2 | $630 | 75.6 kg |
| 📦 Retail & E-Commerce | 2 | $630 | 59.85 kg |

**Resulting Carbon Grade: B — Good** (carbon intensity: 0.142 kg CO₂/$, which is 18% better than the tech sector average of 0.173 kg CO₂/$)

---

## 📚 Data Sources

- **Carbon coefficients:** [EPA Greenhouse Gas Protocol](https://www.epa.gov/ghgemissions/sources-greenhouse-gas-emissions)
- **Benchmark targets:** IPCC Sixth Assessment Report (AR6), sector-level intensity figures
- **Green financing context:** DBS, OCBC, UOB sustainability-linked loan programme guidelines (Singapore)

