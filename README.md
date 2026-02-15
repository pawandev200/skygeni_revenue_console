# Revenue Intelligence Console

A single-page dashboard that helps CROs understand quarterly revenue performance and identify actionable insights.

<!-- ![Dashboard Preview](./Screenshot_2026-02-13_at_1_30_42_PM.png) -->

---

## What This Does

Answers the question: **"Why are we behind (or ahead) on revenue this quarter, and what should we focus on right now?"**

**Key Features**:
- Quarter revenue vs target with gap analysis
- Revenue drivers (pipeline, win rate, deal size, sales cycle)
- Risk factors (stale deals, underperforming reps, inactive accounts)
- AI-powered recommendations (top 3-5 actions to take)
- 6-month revenue trend visualization

---

## Quick Start

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/pawandev200/skygeni_revenue_console.git
cd skygeni_revenue_console

# Install backend
cd backend
npm install

# Install frontend (in new terminal)
cd frontend
npm install
```

### 2. Start Backend

```bash
cd backend
npm run dev
# Backend running on http://localhost:5001
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
# Frontend running on http://localhost:5173/
```

## 4. API Endpoints

All endpoints are at `http://localhost:5001/api/`

### 5. Open Dashboard

Visit: **http://localhost:5173/**

---

## Project Structure

```
skygeni_revenue_console/
├── backend/                    # Express + TypeScript API
│   ├── src/
│   │   ├── routes/
│   │   │   └── dashboardRoutes.ts      # API endpoints (/api/summary, /api/drivers, etc.)
│   │   ├── services/
│   │   │   └── analytics.service.ts    # Business logic (revenue calculations)
│   │   ├── controllers/
│   │   │   └── analytics.controller.ts # Request handlers
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interfaces
│   │   └── utils/
│   │       ├── dataLoader.ts           # Load JSON data files
│   │       └── dataAnalysis.ts         # Data analysis utilities
│   │   └── server.ts                   # Express server setup
│   │     
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                   # React + TypeScript + Material-UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Navigation bar
│   │   │   ├── QtdHeader.tsx           # QTD revenue display
│   │   │   ├── RevenueDrivers.tsx      # 4 metric cards
│   │   │   ├── RiskPanel.tsx           # Risk identification
│   │   │   ├── RecommendationPanel.tsx # Action items
│   │   │   └── charts/
│   │   │       ├── RevenueTrendChart.tsx   # 6-month trend (D3.js)
│   │   │       └── SparklineChart.tsx     # Sparkline charts
│   │   ├── hooks/
│   │   │   └── useDashboard.ts    # API data fetching
│   │   ├── pages/
│   │   │   └── Dashboard.tsx      # Main dashboard page
│   │   ├── api/
│   │   │   └── dashboardApi.ts    # API client
│   │   ├── types.ts               # TypeScript types
│   │   ├── theme/
│   │   │   └── theme.ts           # Material-UI dark theme
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   ├── .gitignore
│   └── package.json
│
├── data/                       # Shared data folder
│   ├── deals.json
│   ├── accounts.json
│   ├── reps.json
│   ├── activities.json
│   └── targets.json
│
├── THINKING.md                 # Architecture decisions & tradeoffs
├── README.md                   # This file
└── .gitignore
```

---

## API Endpoints

All endpoints are at `http://localhost:5001/api/`

### `GET /api/summary`
**Returns**: Quarter performance overview
```json
{
  "currentQuarterRevenue": 1420000,
  "target": 2000000,
  "gap": -580000,
  "gapPercentage": -29.0,
  "qoqChange": 15.5
}
```

### `GET /api/drivers`
**Returns**: 4 revenue driver metrics with trends
```json
{
  "pipelineSize": {
    "value": 715799,
    "change": 392531,
    "changePercentage": 121.425875743965,
    "trend": [574744, 904880, ..., 715799]
  },
  "winRate": { ... },
  "averageDealSize": { ... },
  "salesCycleTime": { ... }
}
```

### `GET /api/risk-factors`
**Returns**: Problems needing attention
```json
{
  "staleDeals": [
    { "dealId": "D123", "accountName": "Company_45", "value": 125000, "daysStale": 45 }
  ],
  "underperformingReps": [
    { "repName": "Ankit", "winRate": 11, "dealsWorked": 25 }
  ],
  "lowActivityAccounts": [
    { "accountName": "Company_67", "segment": "Enterprise", "totalValue": 250000 }
  ]
}
```

### `GET /api/recommendations`
**Returns**: 3-5 actionable suggestions
```json
{
  "recommendations": [
    {
      "id": "rec-1",
      "priority": "high",
      "category": "deals",
      "title": "Focus on aging Enterprise deals",
      "description": "23 high-value deals worth $2.1M have been inactive",
      "impact": "Recovering 30% could unlock ~$630K",
      "action": "Schedule executive sponsor reviews for top 5 deals"
    }
  ]
}
```

### `GET /api/trend`
**Returns**: 6-month revenue trend for charts
```json
{
  "months": [
    { "month": "Jul", "revenue": 350000, "target": 400000, "achieved": 87.5 },
    { "month": "Aug", "revenue": 380000, "target": 400000, "achieved": 95.0 },
    ...
  ]
}
```

---

## 🛠️ Technology Stack

### Backend
- **Node.js + Express** - Web server
- **TypeScript** - Type safety
- **dayjs** - Date manipulation
- **In-memory storage** - JSON data loaded at startup

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI v5** - Component library
- **D3.js v7** - Data visualization (sparklines, trend chart)
- **Vite** - Build tool (fast dev server)

---

## How It Works

### Architecture Overview

```
Frontend (React)
      ↓
API Layer (Express)
      ↓
Analytics Service (Business Logic)
      ↓
In-memory JSON data

```
### Data Flow

```
JSON Files → Backend Service → API Endpoints → Frontend Hooks → UI Components
```


### Step-by-Step

1. **Backend starts** → Loads 5 JSON files into memory
2. **Frontend loads** → Makes 5 API calls (summary, drivers, risk, recommendations, trend)
3. **User sees** → Dashboard with all metrics, charts, and recommendations

### Key Business Logic

**Revenue Calculation**:
```typescript
// Only count "Closed Won" deals with amounts in current quarter
deals
  .filter(d => d.stage === "Closed Won" && d.amount != null)
  .reduce((sum, d) => sum + d.amount, 0)
```

**Stale Deals**:
```typescript
// Deals open > 30 days, prioritize Enterprise + high value
deals.filter(d => 
  daysOld > 30 && 
  (segment === "Enterprise" || amount > 50000)
)
```

**Underperforming Reps**:
```typescript
// Win rate below team average, minimum 5 deals
avgWinRate = totalWinRate / repCount
reps.filter(r => r.winRate < avgWinRate && r.dealsWorked >= 5)
```

---

### Reference Date Approach

All time-based calculations use the latest available month in `targets.json`
instead of the system clock (`dayjs()`).

This ensures:

- Deterministic results when working with historical datasets
- Consistent quarter and month calculations
- Stable trend analysis independent of runtime date

This approach prevents mismatches when evaluating past performance data.

---

This project uses in-memory storage for simplicity.
For production scale, PostgreSQL + Redis caching would be recommended.


## Features

### Dashboard Components

**Summary Banner** (Top)
- Current quarter revenue
- Target and gap
- Color-coded status (green/amber/red)
- QoQ change indicator

**Revenue Drivers** (Left Cards)
- Pipeline size with trend
- Win rate with trend
- Average deal size with trend
- Sales cycle time with trend
- Each shows: value, change %, sparkline chart

**Risk Factors** (Middle Column)
- Stale deals table (Enterprise focus)
- Underperforming reps list
- Low activity accounts

**Recommendations** (Right Column)
- 3-5 prioritized actions
- Category tags (deals/reps/accounts/strategy)
- Expected impact
- Clear action steps

**Revenue Trend Chart** (Bottom)
- 6-month bar + line chart
- Bars = revenue vs target
- Line = achievement %
- Built with D3.js

---

## ⚙️ Configuration

### Backend Settings

File: `backend/src/services/analytics.service.ts`

```typescript
const STALE_DAYS = 30;              // Days before deal is "stale"
const LOW_ACTIVITY_DAYS = 30;       // Days of inactivity
const HIGH_VALUE_THRESHOLD = 50000; // High-priority deal value
const MIN_REP_DEALS = 5;            // Minimum deals to judge performance
```

File: `backend/src/controllers/analytics.controller.ts`

```typescript
const RECOVERY_RATE = 0.3;          // Expected recovery % for stale deals
const INDUSTRY_WIN_RATE_MIN = 25;   // Industry benchmark for win rate
const MAX_RECOMMENDATIONS = 5;      // Max recommendations to show
```

<!-- ### Frontend Settings

File: `frontend/src/hooks/useDashboard.ts`

```typescript
const REFRESH_INTERVAL = 60000;     // Auto-refresh every 60 seconds
``` -->

---

## 📝 Development

### Backend Scripts

```bash
npm run dev        # Start development server (with hot reload)
npm run build      # Compile TypeScript to JavaScript
npm start          # Run production build
npm run type-check # Check TypeScript types
```

### Frontend Scripts

```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## Testing the API

### Using curl

```bash
# Get summary
curl http://localhost:5001/api/summary | jq

# Get drivers
curl http://localhost:5001/api/drivers | jq

# Get risk factors
curl http://localhost:5001/api/risk-factors | jq

# Get recommendations
curl http://localhost:5001/api/recommendations | jq

# Get trend
curl http://localhost:5001/api/trend | jq
```

### Using Browser

Visit these URLs directly:
- http://localhost:5001/api/summary
- http://localhost:5001/api/drivers
- http://localhost:5001/api/risk-factors
- http://localhost:5001/api/recommendations
- http://localhost:5001/api/trend

---

## Data Files Explained

### `deals.json` (600 deals)
```json
{
  "deal_id": "D1",
  "account_id": "A85",
  "rep_id": "R7",
  "stage": "Closed Won",      // Prospecting | Negotiation | Closed Won | Closed Lost
  "amount": 60519,             // Can be null for early-stage
  "created_at": "2025-04-08",
  "closed_at": null            // Can be null if not closed yet
}
```

### `accounts.json` (120 accounts)
```json
{
  "account_id": "A1",
  "name": "Company_1",
  "industry": "SaaS",          // SaaS | FinTech | EdTech | Healthcare | Ecommerce
  "segment": "SMB"             // SMB | Mid-Market | Enterprise
}
```

### `reps.json` (15 reps)
```json
{
  "rep_id": "R1",
  "name": "Ankit"
}
```

### `activities.json` (1,500 activities)
```json
{
  "activity_id": "ACT1",
  "deal_id": "D182",
  "type": "email",             // call | email | demo
  "timestamp": "2025-11-11"
}
```

### `targets.json` (12 months)
```json
{
  "month": "2025-01",
  "target": 181715
}
```

---

## Common Issues

### Backend won't start
**Error**: `Cannot find module './data/deals.json'`

**Fix**: Make sure data files are in `data/`
```bash
ls data/  # Should show: deals.json, accounts.json, reps.json, etc.
```

---

### Frontend shows "Error loading data"
**Cause**: Backend not running

**Fix**: Start backend first
```bash
cd backend
npm run dev
```

---

### Port already in use
**Error**: `Port 5001 is already in use`

**Fix**: Kill existing process
```bash
# Find process using port 5001
lsof -ti:5001 | xargs kill -9

# Or use different port
PORT=8001 npm run dev
```

---

## Performance

Designed for small to medium datasets (hundreds of deals).

### At Scale (6,000 deals)
Would need:
- PostgreSQL database (not in-memory)
- Redis caching (5-minute TTL)
- Horizontal scaling (multiple servers)
- See `THINKING.md` for detailed scaling plan

---

## Key Files to Understand

### Backend
1. **`src/routes/dashboardRoutes.ts`** - All API endpoints, start here
2. **`src/services/analytics.service.ts`** - Business logic (revenue calculations)
3. **`src/utils/dataLoader.ts`** - Loads JSON files into memory

### Frontend
1. **`src/pages/Dashboard.tsx`** - Main dashboard page layout
2. **`src/hooks/useDashboard.ts`** - API data fetching
3. **`src/components/QtdHeader.tsx`** - Top revenue banner
4. **`src/components/charts/RevenueTrendChart.tsx`** - D3.js chart

---

## 🤝 Contributing

1. Keep code simple and readable
2. Add TypeScript types for everything
3. Write comments for complex business logic
4. Test with the actual data files
5. Update this README if you add features

---

## 📄 License

MIT

---

## Tips for Reviewers

**Understanding the code**:
1. Start with `backend/src/routes/dashboardRoutes.ts` to see all endpoints
2. Read `backend/src/services/analytics.service.ts` for business logic
3. Check `frontend/src/App.tsx` for UI structure
4. See `THINKING.md` for architecture decisions

**Testing locally**:
1. Install dependencies in both folders
2. Start backend first (port 5001)
3. Start frontend second (port 5173)
4. Open http://localhost:5173

**Key decisions**:
- In-memory storage (simple, fast for MVP)
- No caching (always fresh data)
- Reference date approach (handles historical data)
- Relative thresholds (team average, not hardcoded)

---

**Built with** ❤️ **for the Revenue Intelligence assignment**