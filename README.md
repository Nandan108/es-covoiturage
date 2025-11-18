# Covoiturage Éveil Spirituel

This bilingual platform curates [Éveil Spirituel](http://eveilspirituel.net) retreats, displays the ridesharing offers contributed by the community, and ships with an admin area to manage events. The repo bundles a Laravel API (content tooling, import pipeline, security) and a React/Vite SPA (public site, forms, admin UI).

## Feature Highlights
- **Event discovery** – chronological list with cover images, rich detail page, interactive map, dynamic meta tags, and aggressive client prefetching.
- **Community ridesharing** – create/update driver or passenger offers, assisted geocoding, Leaflet map visualization, toast notifications, and optimistic updates.
- **Token-based security** – each offer email contains a signed edit link; tokens are persisted in the browser so users can edit/delete without accounts, while admins can override tokens when logged in.
- **Admin workspace** – session-authenticated CRUD for events, including image uploads, offer counts, and quick links, backed by `/api/admin/*`.
- **Contact & support** – public form that delivers messages to `CONTACT_EMAIL`.
- **Automated import** – scraper that pulls eveilspirituel.net, normalizes date ranges, parses Google Maps links, and deduplicates images via CRC32.

## Architecture at a Glance

| Path | Description |
| --- | --- |
| `api/` | Laravel 12 API (PHP 8.2+). Serves `/api/*`, handles admin auth, offers, contact, import, and file/token management. |
| `ui/` | React 19 + Vite + TypeScript SPA using React Router Data APIs, Redux Toolkit Query, Leaflet/React-Leaflet, Tailwind, and Radix UI. |
| `public/` | Hosts the built UI entrypoint and rewrites `/images/events/*` to the stored assets. |

### Backend (api/)
- REST routes (`routes/api.php`): `/events`, `/events/{hash}`, `/events/{event}/offers` (token-protected CRUD), `/contact`, and `/api/admin/*`.
- Event IDs are obfuscated via `deligoez/laravel-model-hashid`.
- Images live in `storage/images` and are exposed under `/images/events/<file>` through web-server rules or a fallback route.
- `php artisan app:import-events [ids…]` syncs retreats from the source site; `EventImporter` reports created/updated/skipped/errors.
- Cache/queue default to database + Redis; adjust via `.env`.
- Quality gates: `php artisan test` / `composer test` plus `vendor/bin/psalm`.

### Frontend (ui/)
- React Router loaders/actions drive fetching and error states with a shared `ErrorBoundary`.
- Redux Toolkit Query (`ui/src/store/api.ts`) centralizes API calls, caching, optimistic updates, and offer-token storage.
- Leaflet + React-Leaflet handle maps; `LocationSearch` and manual coordinate inputs support precise placement.
- Lightweight i18n (`ui/src/i18n/translations.ts`) provides FR/EN translations with a footer switch.
- Admin pages (`ui/src/pages/admin/*`) reuse RTK Query with `/api/admin` endpoints.
- Testing stack: Vitest + React Testing Library (`npm run test`, `npm run test:coverage`).

### Delivery & Ops
- GitHub Actions pipeline (`.github/workflows/deploy.yml`) runs API lint/tests (PHP 8.4), UI tests (Node 20), builds Vite, then deploys sequentially to staging and production over SSH/SCP.
- `FRONTEND_URL` config powers the links embedded in email templates.
- Production requires `CONTACT_EMAIL`, relevant `MAIL_*`, and `ADMIN_*` env vars (see `api/.env.example` + `api/database/seeders/AdminSeeder.php`).

## Local Development

### Prerequisites
- PHP 8.2+, Composer, and Laravel’s recommended extensions (pdo_mysql/pdo_sqlite, fileinfo, etc.).
- Node 20+ with npm.
- MariaDB/MySQL (or SQLite for quick tests).
- Optional: ensure `php` and `npm` are on PATH to run `composer dev`.

### Backend setup (`api/`)
```bash
cd api
cp .env.example .env
composer install
php artisan key:generate
# Configure DB, CONTACT_EMAIL, FRONTEND_URL, MAIL_*, ADMIN_* in .env
php artisan migrate --seed      # creates schema + admin user from env vars
php artisan storage:link        # if you need storage/app/public exposed
php artisan serve               # http://127.0.0.1:8000
php artisan queue:work          # optional unless you dispatch jobs
```
- Tests only: `cp .env.testing .env && php artisan test`.
- **`composer dev`** simultaneously runs `artisan serve`, queue worker/listener, log tailing via `pail`, and `npm run dev` from `ui/`.

### Frontend setup (`ui/`)
```bash
cd ui
npm install
npm run dev   # Vite on http://localhost:5173 with /api proxy -> 127.0.0.1:8000
```
- Update the proxy target in `vite.config.ts` if your API host differs.
- `npm run build` outputs `ui/dist/`, ready to be copied to `public/`.

## Testing & Quality
- API: `cd api && composer test` (or `php artisan test`), plus `vendor/bin/psalm` for static analysis.
- UI: `cd ui && npm run test` (watch) or `npm run test:coverage`; run `npm run lint` for ESLint 9 flat config rules.
- Manual end-to-end: start API (`php artisan serve`) and UI (`npm run dev`), then browse `http://localhost:5173`.

## Importing Events & Managing Content
- **Automated import** – `php artisan app:import-events` (all) or `php artisan app:import-events 42 event_abcd` (filtered). Console output summarizes created/updated/skipped/errors. The `/events/import` web route is for occasional debugging only.
- **Admin portal** – visit `/admin` on the frontend. Credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. From there you can publish/update/delete events, upload posters (PNG/JPG/WEBP up to 500 MB), and adjust coordinates.
- **Offer management** – the confirmation email contains the edit link/token. Logged-in admins may bypass tokens to assist users.

## Deployment Checklist
- Run `npm run build` (UI) and `php artisan optimize` (API) before shipping.
- Sync `ui/dist` into `public/`, then deploy `api/` with `composer install --no-dev`, `php artisan migrate --force`, and `php artisan optimize`.
- Ensure `/images/events/*` is served statically (symlink `storage/images` or configure Apache/Nginx rules) so Laravel isn’t hit for every asset.
- Provide the secrets/variables required by GitHub Actions (`DEPLOY_*`, `DEPLOY_SSH_KEY`, `CONTACT_EMAIL`, etc.) if you use the supplied pipeline.

## Useful References
- `TODO.md` – backlog of remaining and completed work.
- `api/tests/Feature/*.php` – example API contracts and token workflows.
- `ui/src/components/__tests__` – testing patterns for the React layer.
- `api/public/api-index.php` – entry point when hosting the API separately.

Feel free to evolve this README whenever new workflows (Docker, e2e, new providers, …) land. Happy hacking!
