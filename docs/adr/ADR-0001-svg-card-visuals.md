# ADR-0001: SVG Card Visuals as the Card Visual Asset Format

**Status:** Accepted  
**Date:** 2026-06-09

## Context

Slash Cards needs visual memory hooks for Card Items. The options considered were:

- **Raster images** (PNG/WebP/JPEG): familiar tooling but scale poorly, require separate light/dark assets, add network weight, and become blurry in retina displays or when CSS-scaled.
- **SVG files** (external): scalable and theme-adaptive, but add HTTP requests and are harder to inline with per-instance CSS variables.
- **Inline React SVG components**: same fidelity as external SVG, but can directly reference CSS custom properties (`var(--sc-accent)`, `currentColor`), respond to theme changes without re-fetching, are tree-shaken by bundlers, and require no raster pipeline.
- **CSS-only graphics**: possible for simple shapes but impractical for scene-quality doodles.

## Decision

Card Visuals are authored as **inline React SVG components**. Each visual is a `.tsx` file exporting a single React component that renders an `<svg>` element.

## Consequences

- Visuals automatically inherit `currentColor` for stroke color and `var(--sc-accent)` for the accent element, so they adapt to light and dark themes without separate asset sets.
- Visuals are bundled with the app — no separate image requests.
- Authoring requires SVG knowledge but no raster tooling, CDN configuration, or image optimization pipeline.
- SVG structure supports future CSS or SMIL animation without replacing the asset model.
- All visuals share the house style defined in the visual registry scene briefs: viewBox `0 0 120 80`, controlled-rough sketch linework, one accent element, static at launch.
