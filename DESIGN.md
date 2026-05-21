# SthlmFit Design System

A dark, modern, mobile-first running app with neighbourhood-themed color accents.

## Design principles

1. **Stats first** — the user's own progress is always the visual hero
2. **Dark and calm** — navy background, minimal noise, lots of breathing room
3. **Neighbourhood accent** — each user's stadsdel color (`--hood-color`) appears in key highlights, never overwhelms
4. **Touch-friendly** — minimum 44px tap targets, generous padding
5. **No clutter** — show what matters, hide the rest behind expanders or secondary pages

## Color palette

### Base colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `--navy` | `#0D1B2A` | Main background |
| `--navy-light` | `#142435` | Card backgrounds, elevated surfaces |
| `--green` | `#1D9E75` | Primary CTA, success states |
| `--strava-orange` | `#FC4C02` | Strava-related elements only |

### Text colors
| Variable | Value | Usage |
|----------|-------|-------|
| Primary text | `#FFFFFF` | Headlines, big numbers |
| Secondary text | `rgba(255,255,255,0.6)` | Labels, descriptions |
| Tertiary text | `rgba(255,255,255,0.35)` | Hints, metadata, "1h sedan" |
| Disabled text | `rgba(255,255,255,0.2)` | Inactive states |

### Borders
- Default: `1px solid rgba(255,255,255,0.08)`
- Hover/focus: `1px solid rgba(255,255,255,0.18)`
- Accent: `1px solid var(--hood-color)` with `0.3` opacity

### Neighbourhood colors
Used dynamically via `--hood-color`. See `CLAUDE.md` for the full list.

## Typography

- **Font family**: `Inter`, sans-serif
- **Weights used**: 400 (regular), 500 (medium), 700 (bold), 900 (extra bold for big numbers)

### Sizes
| Element | Size | Weight |
|---------|------|--------|
| Big km number (hero stat) | 48px | 900 |
| Section heading | 17px | 700 |
| Body text | 14px | 500 |
| Label (uppercase, tracked) | 11px | 700, letter-spacing 0.06em |
| Hint / metadata | 12px | 500 |
| Small label | 10px | 700 |

### Casing
- **Sentence case** for all body text and headings
- **UPPERCASE** only for small labels with letter-spacing (e.g. "DENNA VECKA")

## Spacing

Use a 4px base scale: 4, 8, 12, 16, 20, 24, 32px.

- Card padding: `16px 20px`
- Section gap (vertical): `20px`
- Component-internal gap: `8px` or `12px`
- Page side margin (mobile): `16px`

## Components

### Card
```
background: var(--navy-light);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 16px;
padding: 16px 20px;
```

### Hero stat block
- Big number (48px, weight 900) in `--hood-color`
- Label below in tertiary text (11px, uppercase, letter-spacing 0.06em)
- Optional comparison line: "Förra veckan: 9,1 km" in secondary text

### Bar chart (week)
- 7 bars (M T O T F L S)
- Bar color: `rgba(29,158,117,0.3)` for inactive days
- Today's bar: solid `--hood-color` or `--green`
- Bar width: equal flex
- Bar gap: 4px
- Day labels: 10px tertiary text, centered below each bar

### Progress bar (gear)
- Background track: `rgba(255,255,255,0.08)`, height 6px, border-radius 99px
- Fill: solid `--green` (or red if >85% used)
- Subtle, no glow or animation

### Pill / badge
```
display: inline-flex;
align-items: center;
gap: 6px;
padding: 4px 10px;
border-radius: 99px;
font-size: 11px;
font-weight: 500;
```
- Neighbourhood pill: `background: rgba(var(--hood-rgb), 0.15)`, border + text in `--hood-color`
- Strava pill: `#FC4C02` background tint, `#FC4C02` text

### Button (primary)
```
background: var(--green);
color: #fff;
border: none;
border-radius: 12px;
padding: 14px 20px;
font-size: 15px;
font-weight: 700;
```

### Button (secondary)
```
background: rgba(255,255,255,0.06);
color: #fff;
border: 1px solid rgba(255,255,255,0.12);
border-radius: 12px;
padding: 12px 16px;
```

### Filter toggle (Vecka / Månad / År)
- Horizontal segmented control
- Background: `rgba(255,255,255,0.06)`, border-radius 10px, padding 3px
- Active segment: `background: var(--navy)` with 1px border `rgba(255,255,255,0.12)`
- Inactive: transparent, text in secondary

### Mini map widget
- Height: ~120px
- Border-radius: 12px
- Overflow: hidden
- Subtle border: `1px solid rgba(255,255,255,0.08)`
- Tap → goes to fullscreen map view or leaderboard

### Activity feed row
- Colored dot (6px) in neighbourhood color, then text
- Format: "Någon i [Stadsdel] loggade X,X km · 8 min sedan"
- Padding: 6px 0
- Border between rows: `0.5px solid rgba(255,255,255,0.05)`

## Animations

- Page transitions: none (instant feels snappier on mobile)
- Counter animations: 0.8s ease-out cubic on stat updates
- Bar chart appears: 0.4s ease-out from 0 height
- Hover/tap feedback: `transform: scale(0.98)` on tap

## Icons

- **Tabler Icons** (outline only, never filled)
- Default size: 18px inline, 24px standalone
- Common icons: `ti-map-pin`, `ti-flame`, `ti-trophy`, `ti-trending-up`, `ti-shoe`, `ti-plus`, `ti-settings`, `ti-user`, `ti-brand-strava`

## Mobile-first rules

- Single column layout, never side-by-side cards on mobile
- Stat grids: max 2 columns
- All tap targets minimum 44x44px
- Safe area insets respected (`env(safe-area-inset-top/bottom)`)
- Bottom of page reserves 80px space so the log button doesn't hide content

## Things to avoid

- Glows, neon effects, drop shadows on cards
- Gradients (use solid colors)
- Pure black (`#000`) — always use `--navy`
- All-caps body text (only small labels)
- Three-column grids on mobile
- Icon-only buttons without aria-label
- Auto-playing animations or sounds (sounds only on user action like logging)
