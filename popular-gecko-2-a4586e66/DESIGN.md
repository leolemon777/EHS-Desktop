---
version: alpha
name: Halo Prism
description: A light, premium SaaS surface language built around an iridescent violet-to-azure halo gradient, pearl-lavender backgrounds, chunky pill radii, and inset highlight depth.
theme: light
colors:
  primary: "#934cff"
  primary-deep: "#7a32f0"
  secondary: "#2f7cf8"
  tertiary: "#78aafa"
  accent: "#975af4"
  neutral: "#6b6f7b"
  surface: "#ffffff"
  surface-dim: "#f5f4fb"
  surface-ink: "#161a20"
  on-surface: "#161a20"
  on-surface-muted: "#6b6f7b"
  on-ink: "#ffffff"
  on-ink-muted: "#bab9b9"
  border: "#e6e4f0"
  border-strong: "#d4d1e4"
  focus: "#2f7cf8"
  success: "#1fb573"
  error: "#e54c5e"
typography:
  font-display: "Manrope, 'Segoe UI', system-ui, sans-serif"
  font-body: "Inter, 'Segoe UI', system-ui, sans-serif"
  display-lg:
    fontFamily: "{typography.font-display}"
    fontSize: "2.75rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  display-md:
    fontFamily: "{typography.font-display}"
    fontSize: "2.125rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline-lg:
    fontFamily: "{typography.font-display}"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  headline-md:
    fontFamily: "{typography.font-display}"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
  price:
    fontFamily: "{typography.font-display}"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body-md:
    fontFamily: "{typography.font-body}"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "{typography.font-body}"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: "{typography.font-body}"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
  eyebrow:
    fontFamily: "{typography.font-body}"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
    textTransform: "uppercase"
rounded:
  none: "0"
  sm: "8px"
  md: "12px"
  input: "14px"
  lg: "18px"
  inner: "24px"
  card: "28px"
  xl: "32px"
  full: "999px"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "28px"
  2xl: "40px"
  3xl: "64px"
elevation:
  low: "0 1px 2px rgba(22,26,32,0.06)"
  mid: "0 10px 30px -12px rgba(47,124,248,0.25)"
  high: "0 18px 40px -16px rgba(22,26,32,0.18)"
  halo: "0 24px 60px -20px rgba(147,76,255,0.45)"
  inset-highlight: "inset 0 2px 4px rgba(255,255,255,0.6)"
gradients:
  halo: "linear-gradient(135deg, #975af4 0%, #2f7cf8 45%, #78aafa 65%, #934cff 100%)"
  halo-button: "linear-gradient(4deg, #975af4 0%, #2f7cf8 40%, #78aafa 65%, #934cff 100%)"
  halo-soft: "linear-gradient(135deg, rgba(151,90,244,0.16) 0%, rgba(47,124,248,0.16) 45%, rgba(120,170,250,0.16) 65%, rgba(147,76,255,0.16) 100%)"
components:
  button-primary:
    backgroundColor: "{gradients.halo-button}"
    textColor: "{colors.on-ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
    elevation: "{elevation.inset-highlight}, {elevation.mid}"
  button-primary-hover:
    backgroundColor: "{gradients.halo-button}"
    textColor: "{colors.on-ink}"
    elevation: "{elevation.inset-highlight}, {elevation.halo}"
    transform: "scale(1.02)"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
    border: "1px solid {colors.border-strong}"
    elevation: "{elevation.low}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.input}"
    padding: "12px 14px"
    border: "1px solid {colors.border}"
    elevation: "{elevation.low}"
  input-field-focus:
    border: "1px solid {colors.focus}"
    elevation: "0 0 0 3px rgba(47,124,248,0.32)"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.border}"
    elevation: "{elevation.low}"
  card-halo:
    backgroundColor: "{gradients.halo}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.card}"
    padding: "4px"
    elevation: "{elevation.halo}"
  card-halo-inner:
    backgroundColor: "{colors.surface-ink}"
    textColor: "{colors.on-ink-muted}"
    rounded: "24px"
    padding: "{spacing.lg}"
  checkbox-unchecked:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border-strong}"
    rounded: "6px"
    size: "20px"
    elevation: "{elevation.low}"
  checkbox-checked:
    backgroundColor: "{gradients.halo-button}"
    textColor: "{colors.on-ink}"
    rounded: "6px"
    size: "20px"
    elevation: "{elevation.inset-highlight}"
  tabs-track:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "4px"
    border: "1px solid {colors.border}"
    elevation: "{elevation.low}"
  tabs-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  tabs-active:
    backgroundColor: "{gradients.halo-button}"
    textColor: "{colors.on-ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    elevation: "{elevation.inset-highlight}"
  chip-soft:
    backgroundColor: "{gradients.halo-soft}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  chip-gradient:
    backgroundColor: "{gradients.halo}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
    elevation: "{elevation.inset-highlight}"
  pricing-tile:
    backgroundColor: "{gradients.halo}"
    rounded: "{rounded.xl}"
    padding: "4px"
    elevation: "{elevation.halo}"
    width: "280px"
  pricing-tile-body:
    backgroundColor: "{colors.surface-ink}"
    textColor: "{colors.on-ink-muted}"
    rounded: "30px"
    padding: "{spacing.lg}"
---

## Overview

Halo Prism is a light-theme SaaS surface language that turns a vivid violet-blue-magenta gradient into a reusable accent system. The gradient behaves like a halo — reserved for borders, calls to action, the active tab pill, and the premium tile — never as a flat wash that competes with content. Around that halo, the system uses pearl-lavender backdrops, white card surfaces, hairline borders, and a single dark ink surface that holds the premium pricing experience.

The visual signature is two-layered: an outer gradient frame wraps an inner soft or ink surface, and that wrapping motif echoes down into every gradient pill through an inset white highlight. The result feels polished, glassy, and product-ready rather than decorative.

## Colors

Halo Prism uses a small, semantically named palette so the gradient stays anchored to clear roles.

| Token | Hex | Role |
| --- | --- | --- |
| `colors.surface-dim` | `#f5f4fb` | Page backdrop, preview canvas, cover |
| `colors.surface` | `#ffffff` | Cards, inputs, tab tracks, chips |
| `colors.surface-ink` | `#161a20` | Premium contrast tile, dark CTA surfaces |
| `colors.on-surface` | `#161a20` | Primary text on light surfaces |
| `colors.on-surface-muted` | `#6b6f7b` | Helper text, inactive tabs, labels |
| `colors.on-ink` | `#ffffff` | Primary text on the ink surface |
| `colors.on-ink-muted` | `#bab9b9` | Secondary copy inside the ink tile |
| `colors.primary` | `#934cff` | Iris — primary accent and gradient anchor |
| `colors.secondary` | `#2f7cf8` | Azure — secondary stop, focus ring |
| `colors.tertiary` | `#78aafa` | Sky Mist — lift highlight in the gradient |
| `colors.accent` | `#975af4` | Violet — opening gradient stop |
| `colors.border` | `#e6e4f0` | Hairline frames, dividers |
| `colors.border-strong` | `#d4d1e4` | Stronger borders on interactive surfaces |
| `colors.focus` | `#2f7cf8` | Focus ring color (32% alpha halo) |

The halo gradient is the only color the system uses to express premium intent, primary action, active state, and selection. The dark ink surface should be used once per layout — typically on the hero pricing or upgrade tile — so it reads as a featured object rather than a theme switch.

Contrast notes: `on-surface` against `surface` reaches above 12:1; `on-ink` against `surface-ink` reaches above 14:1; muted body copy `on-ink-muted` against `surface-ink` stays above 4.5:1 at the body size used in the system.

## Typography

Two Google Fonts carry the type system.

- **Manrope** (display): pricing figures, hero numbers, headlines, tile titles, italic eyebrow chips. Weights 600–800.
- **Inter** (body): paragraphs, descriptions, labels, buttons, helper text. Weights 400–700.

Type ramp:

| Token | Size | Weight | Use |
| --- | --- | --- | --- |
| `typography.display-lg` | 2.75rem / 44px | 800 | Hero headline |
| `typography.display-md` | 2.125rem / 34px | 700 | Section titles |
| `typography.headline-lg` | 1.5rem / 24px | 700 | Card titles |
| `typography.headline-md` | 1.25rem / 20px | 600 | Tile titles |
| `typography.price` | 2.25rem / 36px | 800 | Pricing figures |
| `typography.body-md` | 0.9375rem / 15px | 400 | Default body |
| `typography.body-sm` | 0.8125rem / 13px | 400 | Descriptions, controls |
| `typography.label-sm` | 0.75rem / 12px | 600 | Form labels, chips |
| `typography.eyebrow` | 0.8125rem / 13px | 600 | Uppercase eyebrows |

The italicized uppercase eyebrow (Manrope 600 italic, faint azure text-shadow) is the system's signature label, used inside the halo frame of premium tiles. Regular eyebrow chips on light surfaces use Inter uppercase with +0.08em tracking.

## Layout

Halo Prism leans on comfortable density. Surfaces breathe; controls cluster.

- Page max width: 1120px. Page gutters: 24px mobile, 40px desktop.
- Grid gap between cards: `spacing.lg` (20px) by default, `spacing.xl` (28px) for pricing rows.
- Card interior padding: `spacing.xl` (28px) for standard cards, `spacing.lg` (20px) for the halo tile's ink interior.
- Stack gap inside controls: `spacing.sm` to `spacing.md` (12–16px).
- Control row gap: `spacing.md` (16px).

Spacing tokens follow a 4 → 8 → 12 → 16 → 20 → 28 → 40 → 64 scale, which keeps rhythm predictable when scaling component density up or down.

## Elevation & Depth

Depth is rendered as a four-step material story.

1. **Low** (`elevation.low`) — `0 1px 2px rgba(22,26,32,0.06)`. The default lift on cards, inputs, chips, and tabs. Reads as a print-like contact shadow.
2. **Mid** (`elevation.mid`) — `0 10px 30px -12px rgba(47,124,248,0.25)`. Used on primary buttons; the azure-tinted blur previews the gradient before the user reaches it.
3. **High** (`elevation.high`) — `0 18px 40px -16px rgba(22,26,32,0.18)`. Used for hovered cards, modals, and floating surfaces.
4. **Halo** (`elevation.halo`) — `0 24px 60px -20px rgba(147,76,255,0.45)`. Reserved for the premium pricing tile and primary CTA hover. This is what makes the gradient frame feel like a glow, not a stroke.

The inset highlight `inset 0 2px 4px rgba(255,255,255,0.6)` is layered on every gradient surface (buttons, active tab, checked checkbox, chip-gradient, halo card body). It is the system's most recurring depth signature and the strongest visual link back to the source language.

## Shapes

Halo Prism is a chunky, pill-radius system.

| Token | Value | Use |
| --- | --- | --- |
| `rounded.sm` | 8px | Inner check icon, small chips |
| `rounded.md` | 12px | Buttons |
| `rounded.input` | 14px | Inputs, selects, textareas |
| `rounded.lg` | 18px | Inline pills, info banners |
| `rounded.inner` | 24px | Inner surface of halo card |
| `rounded.card` | 28px | Standard cards |
| `rounded.xl` | 32px | Premium pricing tile outer frame |
| `rounded.full` | 999px | Tabs, chips, pill buttons |

Border weight is hairline (1px) on light surfaces and a 4px gradient frame on hero/premium tiles. The 4px frame, generous radii, and inset highlight are inseparable — together they produce the "halo" identity.

## Components

### Button

Three intents: `primary`, `secondary`, `ghost`. Primary is always a gradient pill with inset white highlight and an azure-tinted mid shadow; on hover it lifts to scale 1.02, swaps in the halo shadow, and gains a white text-shadow glow. Secondary uses a white surface with a strong hairline that brightens to iris on hover. Ghost is a bare button reserved for tertiary actions.

A `--lg` modifier increases padding to 14px / 22px; `--block` makes it span the parent width; `--pill` swaps radius for `rounded.full`. An `on-ink` variant is provided for placing a gradient CTA inside the dark premium tile.

### Input

Inputs share a single recipe: white surface, hairline border, 14px radius, low elevation. Focus shifts the border to azure and adds a 3px halo ring at 32% alpha. The input wrap supports a leading icon at 12px from the leading edge; pair with `hp-input--with-icon` so the text doesn't collide with the glyph.

### Card

Two variants:

- `card` — pearl-light surface with hairline border and low elevation.
- `card-halo` — outer 4px gradient frame wrapping an inner ink surface. Reserved for the premium tier or any signature surface.

### Checkbox

A 20px square with a 6px corner radius. Unchecked is a white surface with a strong hairline; checked switches to the gradient with inset highlight, drawing the check mark as two angled white borders. Focus draws the same azure halo as inputs.

### Tabs

A pill track on a white surface with a 4px interior padding. Inactive tabs are muted Inter 600; the active tab takes the gradient pill with inset highlight, matching the primary button. Use `aria-selected="true"` or `.is-active` to mark the active item.

### Signature — Halo Pricing Tile

The featured pricing experience. An outer 4px gradient frame wraps a dark ink surface. Inside the gradient frame sits the italic uppercase eyebrow and a sparkle icon; inside the ink surface sit the tier title, price, description, a feature list with azure check icons, and a gradient CTA. The whole tile carries the halo shadow so the gradient frame reads as a glow.

### Chip

`chip` is a soft pill on the white surface. `chip--gradient` uses the full halo with inset highlight; `chip--soft` uses the low-alpha halo gradient with iris-deep text for a calm, branded label without weight.

## Do's and Don'ts

**Do**

- Reserve the gradient for halo borders, primary actions, active states, and the premium tile.
- Layer `elevation.inset-highlight` on every gradient surface so it reads as glass.
- Keep the dark ink surface to one object per layout — usually the featured pricing tile.
- Pair the italic uppercase eyebrow with the sparkle icon inside the gradient band.
- Use `colors.focus` plus the 3px halo ring on every focusable control.

**Don't**

- Don't fill large background regions with the halo gradient; it loses its meaning.
- Don't use the dark ink surface for general cards or page sections.
- Don't drop the inset highlight from gradient buttons or pills — without it they look flat.
- Don't mix radius scales within one component; respect the 12 / 14 / 24 / 28 / 32 / 999 ladder.
- Don't introduce additional icon libraries — the system commits to Phosphor regular weight.

## Accessibility

- All focusable interactive elements expose `:focus-visible` styles that paint a 3px azure halo ring at 32% alpha; the underlying background does not change, so hit areas stay legible.
- Body text on the pearl backdrop and on the white surface meets WCAG AA at the default body sizes; muted helper text on the ink surface (`#bab9b9` on `#161a20`) stays above 4.5:1 at 13px.
- The checkbox uses a real `<input type="checkbox">` visually replaced by a styled `__box`; native semantics, keyboard toggling, and screen-reader behavior remain intact.
- Motion is limited to short transforms (scale 1.02) and color transitions, all disabled via `@media (prefers-reduced-motion: reduce)`.

## Framework Adaptation

The system is plain CSS with semantic HTML class hooks (`hp-btn`, `hp-input`, `hp-card`, `hp-tabs`, `hp-pricing`). To port:

- **Tailwind**: lift the `:root` tokens into `theme.extend.colors`, `borderRadius`, `boxShadow`, and `fontFamily`; rebuild components as `@apply` recipes or component classes.
- **CSS Modules / Vanilla Extract**: keep the custom properties as the runtime contract and define the component classes as styled scopes that consume the variables.
- **Design tool**: the YAML front matter is the canonical token source — import token names directly and treat the markdown as rationale.
