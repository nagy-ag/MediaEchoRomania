# Media Echo Romania

Analyst-facing Romanian media intelligence platform built on Next.js, Convex, Clerk, and a Railway-oriented Python worker. The application is event-centric, comparison-first, and designed to surface propagation, ghosting, divergence, bias dimensions, and long-term ecosystem patterns from GDELT.

## Frontend and app state

- Next.js App Router frontend with dense analyst dashboards
- Clerk authentication with anonymous public access for shared analytics pages
- Convex for user state, saved views, alerts, notes, dashboard preferences, and GCAM codebook metadata

## Data platform

- BigQuery is the analytical warehouse with `gdelt_raw`, `gdelt_norm`, `gdelt_derived`, `gdelt_serving`, and `gdelt_ops` layers
- `services/gdelt-worker` contains the Railway worker scaffold for masterfile polling, download orchestration, normalization, rollups, morning brief candidate generation, and alert checks
- `scripts/import-gcam-codebook.mjs` imports a GCAM master codebook into Convex and removes the TSV after a successful load

## Useful commands

```bash
npx tsc --noEmit
node scripts/import-gcam-codebook.mjs --dry-run
.\\services\\gdelt-worker\\.venv\\Scripts\\python -m unittest discover services\\gdelt-worker\\tests
```

## Environment

Use `.env.example` as the template for local configuration. The root env file now documents Convex, Clerk, BigQuery, GDELT worker, and Railway settings.