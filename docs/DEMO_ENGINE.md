# Demo Engine

## Status machine

QUEUED → UPLOADING → INSPECTING → BUILDING → TESTING → STARTING → READY
Any step can go to FAILED (with logs + errorMessage).

Also: STOPPED, EXPIRED (after TTL).

## Modes

| Mode | Behavior |
|------|----------|
| AUTO | Full isolated build + run |
| EXTERNAL_URL | Use admin-provided URL |
| DISABLED | No demo button on product page |

## Supported detection (extensible)

- Next.js
- React + Vite
- Static HTML
- Laravel
- Django
- (register more via `registerDetector`)

## Limitations in this repository

Full Docker-in-Docker isolation + worker requires:
- Redis (or similar queue)
- Separate worker process
- Docker host with security constraints

This codebase implements:
- Schema + status model
- ZIP security validation
- Project type detection
- Admin UI status surface
- EXTERNAL_URL mode fully working
- AUTO mode job enqueue + status updates (worker stub)

For production AUTO demos you must deploy the worker + runner described in ARCHITECTURE.md.
