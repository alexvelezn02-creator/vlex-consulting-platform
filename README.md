# Vlex Consulting Platform

Plataforma multi-tenant para evaluaciones 360° / 180° y diagnóstico organizacional con mapa de dependencias.

## Stack
- Next.js (App Router) + TypeScript
- PostgreSQL + Prisma
- Auth admins: Clerk
- UI: Tailwind CSS
- Charts: Recharts
- PDF: Puppeteer
- Deploy: Vercel

## Estructura
- `app/` rutas de la aplicación
- `prisma/` schema, migraciones y seed

## Configuración inicial
1. **Instala dependencias**
   ```bash
   npm install
   ```
2. **Variables de entorno**
   Crea `.env` con:
   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/vlex"
   ```
3. **Migraciones**
   ```bash
   npm run prisma:migrate
   ```
4. **Seed demo**
   ```bash
   npm run prisma:seed
   ```
5. **Levantar entorno local**
   ```bash
   npm run dev
   ```

## Rutas principales
- `/login`
- `/app`
- `/app/org-units`
- `/app/people`
- `/app/processes`
- `/app/instruments`
- `/app/campaigns`
- `/app/results`
- `/app/reports/[type]/[campaignId]/[targetId]`
- `/r/[token]`

## API de resultados
- `POST /api/results/recompute` `{ campaignId }` para recalcular scores y KPIs.
- `GET /api/results?campaignId=...` para leer resultados computados.

## Roadmap solicitado
- Sprint 1: DB + seed + `/r/[token]` funcional
- Sprint 2: scoring + dashboards básicos
- Sprint 3: dependencias + dashboards riesgos
- Sprint 4: PDFs
