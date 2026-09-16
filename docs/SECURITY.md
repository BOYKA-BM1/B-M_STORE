# Security Model

## Principles

1. Uploaded project code is **untrusted**.
2. Demos never share production secrets, DB, or host filesystem.
3. Admin routes and APIs are protected server-side (RBAC).
4. ZIP validation before any extraction.

## ZIP protections

- Max archive size & uncompressed size (zip bomb)
- Path traversal / Zip Slip checks
- Null-byte & absolute path rejection
- Blocked executable extensions
- Depth & file-count limits
- SHA-256 hash recorded

## Demo container (required for AUTO mode)

- non-root user
- CPU / memory / pids limits
- ephemeral filesystem
- restricted network (or no outbound)
- no Docker socket / no privileged
- destroy after TTL

## App hardening

- Security headers (X-Frame-Options, nosniff, etc.)
- Rate limiting on login, upload, search, WhatsApp events
- Zod validation on all inputs
- No mass assignment
- Audit log for admin actions
- IDOR checks on project/demo IDs

## Secrets

- Never commit real secrets
- Demo env vars must be test-only
- WhatsApp number lives in Settings table (editable by Admin)
