# Emitly — Frontend

The Next.js dashboard for **Emitly**, an AI Marketing Intelligence & Outreach
platform. This package contains the **frontend only** — the app shell plus the
Dashboard screen. All other navigation items render a shared “Coming soon”
placeholder for now.

The frontend talks to a separate FastAPI backend that must be running on
`http://localhost:8000` for live data.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui primitives
- lucide-react icons
- ESLint + Prettier

## Getting started

```bash
# 1. install dependencies
npm install

# 2. configure the backend URL (optional — defaults to http://localhost:8000)
cp .env.local.example .env.local

# 3. start the dev server
npm run dev
```

The app runs at <http://localhost:3000>. Visiting `/` redirects to
`/dashboard`.

## Environment variables

| Variable                   | Default                  | Purpose                                                |
| -------------------------- | ------------------------ | ------------------------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000`  | Base URL of the Emitly FastAPI backend.                |

## Backend dependency

The Dashboard fetches `GET /api/dashboard` on mount. If the backend isn’t
running, the page renders a friendly error state with a **Try again** button —
no fake/sample data is rendered in the success path.

The expected response shape lives in [`lib/types.ts`](./lib/types.ts):

```ts
{
  kpis: { dream_companies, opportunities, emails_generated, ready_to_send },
  recent_campaigns: RecentCampaign[],
  top_opportunities: TopOpportunity[],
  activity_feed: ActivityItem[]
}
```

## Project structure

```
app/
  layout.tsx                  Root layout, font, Toaster, TooltipProvider
  globals.css                 Tailwind + theme tokens
  page.tsx                    Redirects to /dashboard
  (app)/
    layout.tsx                App shell (sidebar + header)
    dashboard/page.tsx        The Dashboard screen
    coming-soon/page.tsx      Shared placeholder
    {dream-companies,campaigns,intelligence,email-workspace,
     contacts,automations,integrations,settings}/page.tsx
                              Re-export the coming-soon placeholder
components/
  layout/{sidebar,header,page-header}.tsx
  shared/{kpi-card,status-badge,score-badge,loading-skeletons}.tsx
  dashboard/{recent-campaigns-table,top-opportunities,activity-feed}.tsx
  ui/                         shadcn/ui primitives
lib/
  types.ts                    Dashboard contract types
  api-client.ts               Typed fetch wrapper + ApiError
  api.ts                      getDashboard()
  utils.ts                    cn(), formatters
```

## Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Run the dev server on `:3000`                |
| `npm run build`    | Production build                             |
| `npm run start`    | Serve the production build                   |
| `npm run lint`     | Next.js / TypeScript lint                    |
| `npm run format`   | Prettier (with Tailwind class sorting) write |
