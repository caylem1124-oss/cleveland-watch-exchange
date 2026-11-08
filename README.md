# Cleveland Watch Exchange

Storefront for clevelandwatchexchange.com.

- `docs/` — the website (served by GitHub Pages from the `main` branch, `/docs` folder).
- `src/`, `wrangler.jsonc`, `schema.sql` — optional Cloudflare Worker + D1 backend for the online inquiry form (not used by GitHub Pages; without it the form falls back to Instagram).

To edit the catalog, change `docs/data/catalog.js` (and keep `catalog.json` equivalent).
