# 🌿 EcoTrace

**Decarbonizing Commerce, One Transaction at a Time.**

> Built for Sustainability· Full-Stack AI Sustainability Dashboard for SMEs

---

## The Problem: Carbon Complexity

Most businesses have **zero visibility** into how their spending translates to CO₂ emissions. They lack the tools to understand, measure, or reduce their carbon footprint — we call this **Carbon Complexity**. EcoTrace eliminates it.

---

## ✨ Features

- 📊 **Eco-Pulse Dashboard** — Real-time carbon grade (A–F), total footprint, spend tracked, top emitter category, emissions pie chart, monthly trend line chart, and sortable/searchable transaction table
- 📤 **CSV Upload** — Drag-and-drop CSV importer with client-side validation, row-level error highlighting, and preview before confirm
- 💳 **Mock Stripe Integration** — One-click import of 10 sample transactions from a simulated payment feed
- 🤖 **AI Sustainability Coach** — Powered by Anthropic Claude; generates a headline insight, top category deep-dive with 3 prioritised actions, quick wins, and a benchmark note — all Singapore/APAC-specific
- 📈 **Green-Line Benchmark** — Horizontal bar chart comparing your carbon intensity to industry averages and best-in-class targets, with a financial inclusion callout for green financing
- 📄 **Exportable Impact Report** — 3-page PDF (Cover, Breakdown, AI Insights) generated client-side with `@react-pdf/renderer`
- 🔐 **Supabase Auth** — Email + password authentication with Row Level Security on all tables

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS + CSS Variables |
| **Charts** | Recharts |
| **Backend / DB** | Supabase (Postgres) |
| **Auth** | Supabase Auth (email + password) |
| **AI Layer** | Anthropic Claude (`claude-sonnet-4-20250514`) |
| **PDF Export** | `@react-pdf/renderer` |
| **CSV Parsing** | `papaparse` |
| **Language** | TypeScript throughout |

---

## 🚀 Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ecotrace.git
cd ecotrace

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Fill in your Supabase and Anthropic API keys

# 4. Run the database schema in Supabase SQL Editor (see below)

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄 Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  industry    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL,
  amount_usd      NUMERIC(10,2) NOT NULL,
  co2_kg          NUMERIC(10,4),
  source          TEXT DEFAULT 'csv',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_insights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  top_category TEXT,
  insight_json JSONB
);

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own profile"       ON profiles      FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own transactions"  ON transactions  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own insights"      ON ai_insights   FOR ALL USING (auth.uid() = user_id);
```

---

## 🌍 Carbon Coefficient Data Sources

Carbon coefficients (kg CO₂ per USD spent) are sourced from:

- **EPA GHG Protocol** — [ghgprotocol.org](https://ghgprotocol.org)
- **IPCC AR6** — Sixth Assessment Report, Working Group III (Mitigation of Climate Change)

| Category | Coefficient (kg CO₂/USD) |
|---|---|
| Air Travel | 0.400 |
| Road Freight | 0.320 |
| Sea Freight | 0.180 |
| Energy & Utilities | 0.233 |
| Manufacturing | 0.290 |
| IT & Cloud Services | 0.035 |
| Food & Hospitality | 0.120 |
| Local Groceries | 0.050 |
| Professional Services | 0.025 |
| Retail & E-Commerce | 0.095 |

---

## 🏆 Hackathon

**Event:** Ignite Hack 2.0
**Category:** Full-Stack AI Sustainability Dashboard
**Target Users:** Small-to-Medium Enterprises (SMEs) and conscious consumers

---

## 📄 License

MIT License — built for Ignite Hack 2.0
