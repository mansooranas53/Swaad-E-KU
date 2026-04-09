# CanteenIQ – Smart Canteen System

## Overview

A premium, full-stack SaaS web application for college canteens. Solves food waste, long queues, and manual operations with AI-powered demand prediction, live order tracking, and role-based dashboards.

**Tagline:** Predict. Prepare. Pickup.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion + Recharts
- **Backend**: Express 5 + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Custom JWT-style token auth (session in localStorage as "canteeniq_token")
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

- **canteen-iq** — React + Vite frontend at `/`
- **api-server** — Express backend at `/api`

## User Roles & Demo Accounts

| Role    | Email                  | Password | Dashboard |
|---------|------------------------|----------|-----------|
| Student | student@canteen.dev    | demo123  | /student  |
| Staff   | staff@canteen.dev      | demo123  | /staff    |
| Admin   | admin@canteen.dev      | demo123  | /admin    |

## Database Tables

- `profiles` — Users with email/password/role
- `menu_items` — Canteen menu with categories, pricing, veg types
- `orders` — Orders with token numbers and status tracking
- `order_items` — Individual items within each order
- `predictions` — AI demand forecast data
- `feedback` — User ratings and messages
- `support_tickets` — Support requests

## API Routes

- `POST /api/auth/login` — Login
- `POST /api/auth/signup` — Signup
- `GET /api/auth/me` — Current user (requires auth)
- `GET/POST /api/menu` — Menu items
- `PUT/DELETE /api/menu/:id` — Admin menu CRUD
- `GET/POST /api/orders` — Orders (role-based filtering)
- `PATCH /api/orders/:id` — Update order status (staff/admin)
- `POST /api/orders/:id/cancel` — Cancel order (student)
- `GET /api/predictions` — AI demand predictions
- `GET/POST /api/feedback` — Feedback
- `GET/POST /api/support` — Support tickets
- `GET /api/users` — User management (admin)
- `GET /api/analytics/dashboard` — KPI summary
- `GET /api/analytics/sales` — Sales analytics
- `GET /api/analytics/peak-hours` — Peak hour heatmap
- `GET /api/analytics/sustainability` — Sustainability metrics
- `GET /api/analytics/staff-summary` — Staff daily summary

## Architecture Notes

- Token stored in `localStorage` as `canteeniq_token`
- Auth middleware reads `Authorization: Bearer <token>` header
- Role-based route protection on both frontend and backend
- Frontend uses React Query via generated Orval hooks from `@workspace/api-client-react`
