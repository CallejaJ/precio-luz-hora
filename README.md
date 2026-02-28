# PrecioLuzHora

<div align="center">
    <img src="https://img.shields.io/badge/Astro-5.x-FF5D01?style=for-the-badge&logo=astro" alt="Astro" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Recharts-3-22C55E?style=for-the-badge" alt="Recharts" />
    <img src="https://img.shields.io/badge/Data_Source-REE_API-003087?style=for-the-badge" alt="REE API" />
</div>

<p align="center">
    <i>Real-time Spanish PVPC electricity price tracker with hourly breakdowns, interactive charts, and energy-saving recommendations.</i>
</p>

## Price Classification Model

Hourly prices are fetched from the official REE (Red Eléctrica de España) API and classified into three tiers based on the day's distribution. Classification is recalculated fresh on each page load.

| Tier | Condition | Visual |
|---|---|---|
| **Cheap** | Price ≤ 33rd percentile of daily prices | Green |
| **Below average** | Price < daily mean | Amber |
| **Expensive** | Price ≥ daily mean | Rose/Red |

## Data Service

`src/lib/service.ts` is the single data access layer. It fetches the `PVPC` indicator from the REE real-time markets endpoint, converts values from €/MWh to €/kWh, and attaches classification flags to each hour. If the API is unreachable, it transparently falls back to static representative data so the UI always renders.

| Function | Signature | Purpose |
|---|---|---|
| `getPrices` | `() => Promise<PriceInfo[]>` | Fetches and classifies all 24 hourly prices for today |
| `getMonthlyPrices` | `() => Promise<{month, price}[]>` | Returns the last 13 months of average prices |
| `getCurrentPrice` | `(prices) => PriceInfo` | Extracts the entry matching the current wall-clock hour |

## Price Visualizations

The dashboard (`src/pages/index.astro`) composes three distinct visualizations using data from `getPrices()`.

| Component | File | Output |
|---|---|---|
| **PriceBar** | `src/components/PriceBar.astro` | 24-segment heat map bar with current-hour marker and hover tooltips |
| **PriceChart** | `src/components/PriceChart.tsx` | Recharts `AreaChart` with gradient fill, average reference line, and current-hour reference line |
| Hourly table | inline in `index.astro` | Full 24-row table with color-coded price cells |

## Recommendations Engine

`src/components/Recommendations.astro` derives three actionable tips from the daily price array without additional API calls.

| Card | Logic |
|---|---|
| **Electrodomésticos Pro** | Identifies the cheapest single hour and suggests scheduling high-draw appliances then |
| **Smart Office** | Compares the current hour price against the daily average to guide office equipment usage |
| **Zona Crítica** | Identifies the most expensive hour and warns against intensive consumption during it |

## System Architecture

| Component | Role |
|---|---|
| **Astro pages** | Server-rendered HTML shells; fetch price data at request time via `getPrices()` |
| **React islands** | `PriceChart.tsx` runs client-side for interactive hover behavior via `client:load` |
| **Astro components** | `PriceBar`, `Recommendations`, `layout` — pure server-rendered, no JS hydration |
| **service.ts** | Thin wrapper around the REE REST API; owns all data-fetching and classification logic |
| **REE API** | Official `apidatos.ree.es` endpoint providing hourly PVPC prices for the Iberian peninsula |

## Technology Stack

- **Frontend**: Astro 5, React 19, Tailwind CSS 4
- **Charts**: Recharts 3, Framer Motion 12
- **Icons**: Lucide React
- **Language**: TypeScript 5
- **Build**: Vite (via Astro), `@tailwindcss/vite` plugin
- **Data**: REE (Red Eléctrica de España) public REST API

## Key Features

1. **Live PVPC prices** — fetches today's 24-hour price schedule from the official Spanish grid operator on every page load
2. **Automatic price classification** — labels each hour as cheap, below-average, or expensive using percentile thresholds computed from the day's data
3. **Zero-JS heat map** — `PriceBar` renders the full daily overview as a server-side Astro component with no client JavaScript
4. **Interactive area chart** — `PriceChart` highlights the current hour and daily average with reference lines and a custom tooltip
5. **Actionable recommendations** — three derived tips (best appliance hour, office guidance, expensive-hour warning) computed server-side from price data
6. **Graceful fallback** — realistic static price data is used transparently if the REE API is unreachable
7. **SEO-ready** — `robots.txt` and `sitemap.xml` configured for the production domain

## Testing Strategy

The project has no automated test suite. Verification is performed manually: running `npm run dev` and confirming that the dashboard renders the correct current-hour highlight, that all three price tier colors appear in the heat map, and that the recommendations reflect the actual cheapest and most expensive hours. API failure is tested by temporarily blocking the REE endpoint and confirming the fallback data loads without console errors.

## Project Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Visit `http://localhost:4321`

No environment variables are required. The REE API is public and unauthenticated.

---

Built for the Spanish PVPC electricity market.
