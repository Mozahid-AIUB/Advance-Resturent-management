# AI-Powered Restaurant Analytics Dashboard

Multi-branch restaurant analytics platform with revenue forecasting (Prophet), inventory and staffing intelligence, and LLM-generated weekly insights (DeepSeek via OpenRouter).

## Stack

- **Backend:** FastAPI, SQLAlchemy, Prophet, JWT auth, PostgreSQL (SQLite for local/demo)
- **Frontend:** Next.js (App Router, TypeScript), Tailwind CSS, Recharts
- **LLM:** DeepSeek `deepseek-chat-v3-0324:free` via OpenRouter, with a deterministic rule-based fallback when the API is unavailable or rate-limited

## Features

- JWT-based auth, multi-branch management, CSV sales upload
- 14-day revenue forecasting with confidence bounds (Prophet) and accuracy metrics (MAE%, RMSE%)
- Inventory intelligence: stockout-risk and overstock alerts from sales-consumption analysis
- Shift staffing recommendations per time-of-day, with a weekend demand buffer
- Weekly AI-generated insights (summary, key risks, recommendations) cached for an hour per branch
- Dashboard KPI and peak-hour heatmap aggregation endpoints

## Running locally

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # edit DATABASE_URL for local Postgres, or use sqlite:///./demo.db
python -m uvicorn app.main:app --reload --port 8000
```

Run tests:

```bash
cd backend
python -m pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # or set NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/login` (demo credentials pre-filled) or `/dashboard`.

### Docker Compose (Postgres + backend)

```bash
docker compose up --build
```

Starts a Postgres 16 container and the FastAPI backend on port 8000. Run the frontend separately with `npm run dev`.

## Project structure

```
backend/
  app/
    api/        # FastAPI route modules
    services/    # forecasting, inventory, staffing, insight, openrouter client
    schemas/     # Pydantic request/response models
    db/          # SQLAlchemy models and session setup
  tests/
frontend/
  src/
    app/         # Next.js pages (login, dashboard)
    lib/api.ts   # typed API client
    components/  # shared UI components
```
