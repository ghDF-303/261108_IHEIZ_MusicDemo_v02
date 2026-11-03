# Projekt-Vorgaben: Astro Street-Tech Audio Page

## Tech-Stack & Architektur
- **Framework:** Astro (SSG), native `.astro`-Komponenten bevorzugen.
- **TypeScript:** `strict: true`. Keine `any`-Typen. `interface Props` immer im Frontmatter typisieren.
- **Styling:** Tailwind CSS v4. Utility-First, keine unnötigen Arbitrary-Werte.
- **Animationen:** GSAP. Achte strikt darauf, dass bestehende DOM-Selektoren für GSAP (`.hud-layer`, `.hero-layer`, `.sliding-panel`, etc.) bei Refactorings nicht verändert werden.
- **SVGs:** Immer `viewBox`, `vector-effect="non-scaling-stroke"` und Farbanbindung über `currentColor`. Keine Layout-Shifts (Container immer mit festen Aspect-Ratios absichern).

## Komponenten-Konventionen
- Props immer über typisierte Interfaces in `src/types/` definieren.
- Bei Änderungen an `TrackArtwork` immer Layer 1 (Nummer), Layer 2 (HUD) und Layer 3 (Emblem) getrennt halten.