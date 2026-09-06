# Electrician Toolbox

**Fast electrical calculations, right when you need them.**

A fast, mobile-first, installable web utility for electricians, electrical
technicians, apprentices, contractors, and technically competent DIY users.
No account. No API keys. No subscriptions. No AI. Your calculations never
leave your device.

## Feature overview

- **Ohm's Law** — solve for voltage, current, or resistance (V = I × R)
- **Power & Current** — solve for power, current, voltage, or resistance
  (P = V×I, P = I²R, P = V²/R and their rearrangements), with V/mV/kV,
  A/mA/kA, W/kW/MW, and Ω/kΩ/MΩ unit selection
- **Voltage Drop** — transparent, resistance-only estimate for single-phase
  or three-phase circuits, with every assumption stated explicitly
- **Generator / Load Estimator** — add/remove/edit/duplicate devices, get
  total running load and a recommended generator capacity
- **Unit Converter** — voltage, current, power, resistance, energy, charge,
  frequency, length, and temperature
- **Wire Size Calculator** — intentionally a "Coming Soon" placeholder (see
  [Why no wire-size calculator yet](#why-no-wire-size-calculator-yet))
- Local calculation history and favorites (device-only storage)
- Share results via the Web Share API, with clipboard fallback
- Installable PWA with offline support for all calculators
- Light/dark themes, keyboard-navigable, screen-reader-friendly

## Calculation safety notes

This application performs **mathematically transparent, deterministic
calculations**. It does not:

- invent or reference any electrical code, ampacity table, or cable-sizing
  standard
- determine code compliance for any installation
- replace manufacturer specifications, engineering judgment, or qualified
  electrical work

Ohm's Law and the power-triangle relationships are universal physics and are
applied without caveat. The **Voltage Drop** calculator requires you to
supply conductor resistance — either directly (e.g. from a manufacturer
datasheet) or derived from published bulk resistivity constants for copper
and aluminum plus a cross-sectional area you provide. It never assumes a
wiring configuration silently; you choose single-phase or three-phase
explicitly, and every assumption made in the calculation is displayed with
the result. The **Generator Load** estimator uses a clearly stated sizing
method (total running watts + the single largest surge) and any example
appliance wattages are labeled as illustrative only, not authoritative.

A short disclaimer is shown wherever a calculation appears.

### Why no wire-size calculator yet

Conductor (wire) sizing depends on ampacity tables and derating rules that
vary by electrical code and jurisdiction (NEC, IEC/CENELEC, AS/NZS, etc.) —
there is no single table that applies worldwide. Rather than present one
jurisdiction's numbers as a universal default, `/wire-size` is a placeholder
today. The navigation and routing are already in place so this calculator
can be added later with explicit jurisdiction/standard selection.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite, built as a static SPA
  (`dist/client`)
- **Routing**: React Router, with each calculator on its own path for SEO
  (`/ohms-law`, `/power-current`, `/voltage-drop`, `/generator-load`,
  `/unit-converter`, `/wire-size`, `/history`)
- **Calculation engine**: pure, framework-free TypeScript functions in
  `src/calculators/`, fully unit-tested and separated from all UI code
- **Hosting**: Cloudflare Workers with the current **Workers Static Assets**
  architecture (not the deprecated Workers Sites) — the Worker
  (`worker/index.ts`) serves the built SPA via the `ASSETS` binding, exposes
  `GET /health`, and adds baseline security headers. SPA routing falls back
  to `index.html` via `not_found_handling: "single-page-application"` in
  `wrangler.jsonc`
- **State**: no database, no server-side state. All history, favorites, and
  theme preference live in `localStorage` on the user's device
- **PWA**: web manifest, generated icons, and a minimal same-origin,
  cache-first service worker (`public/sw.js`) for offline calculator use

```
src/
  calculators/   pure calculation engines + shared validation/units (tested)
  components/    shared UI (fields, result display, share button, etc.)
  hooks/         useHistory, useFavorites, useTheme (all localStorage-backed)
  lib/           calculator registry, SEO helper, storage, formatting
  pages/         one page per calculator + Home/History/NotFound
  styles/        global.css
  types/         shared TS types
worker/          Cloudflare Worker (health check + asset serving)
tests/
  calculators/   unit tests for every calculation engine
  integration/   homepage, navigation, calculator flows, PWA assets, theme
public/          manifest, icons, robots.txt, sitemap.xml, service worker
scripts/         generate_icons.py (regenerates PWA icons)
```

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
```

## Testing

```bash
npm run test         # Vitest: 74 tests (62 calculator unit tests, 12 integration tests)
npm run test:watch
npm run typecheck
npm run lint
```

All four gates (typecheck, lint, test, build) pass as of this commit.

## Production build

```bash
npm run build         # tsc -b && vite build -> dist/client
npm run preview        # preview the built SPA locally
```

## Cloudflare deployment

This repository is deployment-ready but **has not been deployed**. No
Cloudflare API tokens were created and no deployment was performed as part
of building this repository. To deploy:

1. `npm install`
2. `npm run build` (produces `dist/client`)
3. `npx wrangler login` (authenticate your own Cloudflare account)
4. `npx wrangler deploy`

No secrets, environment variables, or bindings beyond the built-in `ASSETS`
binding are required. `wrangler.jsonc` already sets `not_found_handling` for
correct SPA routing. If you attach a custom domain, update `SITE_URL` in
`src/lib/seo.ts` and the URLs in `public/sitemap.xml` / `public/robots.txt`,
which currently use `electrician-toolbox.example.com` as a placeholder.

To regenerate the PWA icons: `npm run icons` (requires Python 3 + Pillow).

## Decisions made without explicit spec guidance

- **Wrangler major version**: pinned to Wrangler 4.x (current at build
  time) rather than 3.x, since the spec asked for current tooling.
- **History recording**: history entries are saved via an explicit "Save to
  history" action on each result, not automatically on every keystroke —
  this avoids flooding history with intermediate/incomplete values while
  typing.
- **Generator sizing method**: recommended capacity = total running watts +
  the single largest per-device-group surge (starting − running). This is a
  stated, transparent method rather than a claimed industry standard —
  users should still confirm against their generator manufacturer's own
  sizing guidance.
- **Voltage drop reactance**: intentionally resistance-only; inductive
  reactance is disclosed as excluded rather than approximated.
- **Accent color**: a warm amber (`#d97706`) on near-black, chosen to read
  as a physical tool rather than a generic SaaS/AI product.

## Known limitations (V1)

- No Playwright/browser-level E2E tests were added in this pass; the
  integration test suite (Vitest + Testing Library + jsdom) covers
  homepage rendering, navigation, all five calculator flows, invalid-input
  messaging, PWA asset presence, and theme switching, but does not exercise
  a real browser engine.
- The bundle is a single JS chunk (~199 KB / ~63 KB gzipped). It has not
  been route-split; this is acceptable for a five-calculator MVP but is a
  candidate for `React.lazy` route-splitting as more calculators are added.
- `SITE_URL` and sitemap URLs use a placeholder domain until a real
  Cloudflare/custom domain is attached.

## Roadmap (post-V1)

- Wire Size / Conductor Sizing calculator with explicit jurisdiction
  selection (NEC, IEC, AS/NZS, etc.) — not a single worldwide table
- Route-level code splitting
- Playwright E2E coverage
- Native Android app, if the PWA demonstrates real demand
- Privacy-preserving, non-tracking usage analytics (no third-party
  analytics provider; not implemented in V1)
