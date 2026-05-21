# SthlmFit

Personal running dashboard with Stockholm neighbourhood competition as a bonus layer.

## Vision

**"Min personliga löpar-dashboard — med Stockholm-tävlingen som en cool bonus"**

The app helps users motivate themselves to run more by tracking personal progress over time. The neighbourhood competition adds a fun social/local layer, but the **primary focus is the user's own stats, gear, and progress** — not the leaderboard.

## What changed from v1

The old version was map-first: a fullscreen Stockholm map with stats hidden in a bottom sheet. This put the neighbourhood competition front and center, but users said they wanted their *own* progress to be the main thing.

The new version is stats-first: personal weekly progress, gear tracking, and a smaller map widget that shows the competition as a secondary element.

## Tech stack

- Plain HTML, CSS, vanilla JavaScript (no frameworks)
- Hosted on Vercel: `sthlmfit.vercel.app`
- Supabase (project: `sthlmfit`, region: `eu-north-1`) for database + auth
- Strava OAuth for automatic km sync (pending API approval — manual logging is the fallback)
- Leaflet.js for the Stockholm map with real GeoJSON boundaries
- GitHub repo: `github.com/Ludmister/sthlmfit`

## Pages

- `login.html` — email/password login
- `onboarding.html` — pick neighbourhood + connect Strava
- `dashboard.html` — **personal running dashboard** (this is the main page)
- `leaderboard.html` — neighbourhood ranking by weekly km
- `profile.html` — user stats + settings + gear management
- `callback.html` — Strava OAuth callback

## Dashboard layout (top to bottom)

1. **Header** — greeting + neighbourhood pill + settings icon
2. **Weekly stats card** — big km number for this week, comparison to last week, +% change
3. **Week bar chart** — M T O T F L S with daily km bars
4. **Time filter** — Vecka / Månad / År toggle for total km view
5. **Mini map widget** — compact Stockholm map (~120px tall), shows user's neighbourhood rank
6. **Gear tracker** — running shoes with purchase date, km used, progress bar showing life left
7. **Manual log button** — always visible, primary CTA
8. **Activity feed** — recent runs at the bottom

## Database

### Existing tables
- `profiles` — user info + neighbourhood_id + strava_connected
- `workouts` — user_id, km, logged_date, created_at
- `neighbourhoods` — id, name, color
- `weekly_km` — aggregated view

### New table needed
- `gear` — id, user_id, name, brand, purchase_date, max_km (default 800), active (bool), created_at
- The km used is calculated from workouts logged after purchase_date for the active gear

## Neighbourhoods (10)

| Name | Color |
|------|-------|
| Södermalm | `#378ADD` |
| Vasastan | `#639922` |
| Östermalm | `#BA7517` |
| Kungsholmen | `#534AB7` |
| Gamla Stan | `#D85A30` |
| Norrmalm | `#888780` |
| Hammarby Sjöstad | `#1D9E75` |
| Liljeholmen | `#D4537E` |
| Lidingö | `#85B7EB` |
| Djurgården | `#3B6D11` |

Each neighbourhood color is applied via the CSS `--hood-color` variable based on the user's selection.

## Current state

- Strava API approval is pending (submitted recently). Manual logging is the primary method until approval comes through.
- The map and competition logic from v1 works well — keep the visual style, just shrink the map to a widget.
- All other pages (login, leaderboard, profile, onboarding) should remain untouched during the dashboard rebuild.

## Design

See `DESIGN.md` for the full design system — colors, typography, components, spacing.
