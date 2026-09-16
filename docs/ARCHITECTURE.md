# Software Marketplace – Architecture

## Overview

Production-oriented Software Marketplace for selling ready-made software projects.

**Stack**
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + Radix UI (shadcn-style)
- PostgreSQL via Prisma
- Supabase Auth (or any JWT-compatible auth)
- Supabase Storage / S3-compatible for public + private assets
- Background jobs for Demo builds (Redis/BullMQ recommended)
- Isolated Demo Runner (Docker) – separate service

## High-level components

1. **Storefront** – Public marketing + product pages (SSR/ISR)
2. **Admin CMS** – Protected dashboard for projects, demos, settings, analytics
3. **API / Server Actions** – Project CRUD, upload, analytics events
4. **Demo Engine Worker** – Consumes build queue, runs security scan → detect → build → start container
5. **Demo Runtime** – Ephemeral Docker containers with strict limits

## Database design

See `prisma/schema.prisma`. Core tables:
- users, profiles (RBAC: ADMIN | STAFF | CUSTOMER)
- projects, project_media, project_tags, categories, tags
- project_builds, project_demos, demo_sessions
- project_views, whatsapp_clicks, demo_events, search_queries
- orders, order_items (future payment ready)
- settings, audit_logs

## Authentication & Authorization

- Supabase Auth (email/password + optional OAuth)
- Server-side checks on all `/admin/*` routes and APIs
- Role-based: only ADMIN/STAFF access admin
- No client-only protection

## Storage

| Type | Bucket / Prefix | Access |
|------|-----------------|--------|
| Cover + screenshots | public-assets | Public CDN |
| Project ZIP + source | private-projects | Signed URL only (never public) |
| Build artifacts | private / ephemeral | Worker only |

## Demo Engine

```
Upload ZIP → Security validate → Detect type → Enqueue job
→ Worker: extract (safe) → build → test → start container
→ Status: READY | FAILED
→ TTL cleanup (container + temp DB + files)
```

**Security non-negotiables**
- Never run untrusted ZIP on the main app server
- non-root, read-only FS where possible, CPU/RAM/process limits
- No host mounts, no Docker socket, no production secrets
- Demo credentials only (never production DB/API keys)

**Demo modes**
- AUTO – full pipeline
- EXTERNAL_URL – admin supplies external demo link
- DISABLED – no demo button

## WhatsApp purchase flow

1. Customer clicks “شراء عبر WhatsApp”
2. Analytics event recorded
3. Opens `wa.me` with pre-filled message (name, id, price, URL)
4. Manual payment → Admin confirms order (future: customer download)

## Future payments

Schema already has `orders` / `order_items`. Later integrate Stripe / Paymob / Fawry without schema rewrite.

## Deployment

- App: Vercel / Docker / any Node host
- DB: Managed PostgreSQL
- Worker + Demo Runner: separate Docker host with restricted privileges
- Redis for queue

## Environment variables

See `.env.example`.

## Testing strategy

- Unit: ZIP validator, detector, WhatsApp message builders
- Integration: Prisma CRUD, auth guards
- E2E: Playwright for storefront + admin happy path
