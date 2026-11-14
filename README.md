# Painel Financeiro Pessoal

Site estático (index.html, style.css, app.js). Dados ao vivo: BCB (SGS/Focus), AwesomeAPI, Frankfurter. Abra index.html no navegador ou publique em qualquer host estático.

## Backend (Vercel Functions) + banco (Supabase)
- `GET /api/market` — câmbio, indicadores BCB, Focus e instituições (cache 60 s).
- `GET /api/history?code=USD&days=90` — histórico gravado no banco.
- `GET|POST /api/simulations` — simulações salvas.
- `/api/snapshot` — Vercel Cron em dias úteis às 18h (Brasília), grava cotações/indicadores.

Configurar no projeto Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`. Schema: `supabase/schema.sql`.
