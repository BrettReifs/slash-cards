# ADR-0001 — Card Visuals as SVG Doodles
**Status:** Accepted

**Context.** Slash Cards needs memorable visuals for 145+ slash commands, skills, built-in commands, and participants while keeping a consistent brand across gallery thumbnails, study cards, and detail overlays. The app is bundled as a single MCP App HTML file and adapts to host display modes and themes.

**Decision.** Card Visuals will use SVG-style vector doodles as the source asset format. The doodles will use rough monochrome linework with one Slash Cards accent color, and each asset will map to a semantic Card Item concept rather than a platform-specific entry.

**Consequences.** This keeps artwork crisp across dense thumbnails and larger study cards, supports theming and resizing, and avoids managing a large raster image pipeline. It limits painterly detail and requires visual ideas to be simplified into strong scene metaphors.

**Alternatives considered.** Generated raster images were rejected because they are harder to keep consistent, theme, resize, and bundle cleanly. A hybrid raster-to-SVG workflow was rejected for the initial plan because it adds conversion overhead before the visual language is proven.
