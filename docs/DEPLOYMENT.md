# Deployment

## Local

1. Copy `.env.example` → `.env` and fill values
2. `npm install`
3. Start PostgreSQL
4. `npx prisma db push`
5. `npm run db:seed`
6. `npm run dev`

## Production checklist

- [ ] Real DATABASE_URL
- [ ] Supabase (or Auth) keys
- [ ] Storage buckets + policies
- [ ] Redis for queue
- [ ] Demo worker + Docker runner
- [ ] Domain + HTTPS
- [ ] DEMO_DOMAIN pointing to runner proxy
- [ ] Rate limits & monitoring
- [ ] Backup strategy for PostgreSQL

## Docker (app only)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "start"]
