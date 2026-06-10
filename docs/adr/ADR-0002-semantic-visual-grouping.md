# ADR-0002: Semantic Visual Grouping via visualId

**Status:** Accepted  
**Date:** 2026-06-09

## Context

The Slash Cards catalog includes entries where the same command string appears on multiple platforms but means different things (e.g., `/new` means "scaffold a project" in Copilot VS Code but "start a fresh chat" in Copilot CLI). It also includes entries where different command strings share the same meaning across platforms (equivalents).

Deriving visual identity from the command string would assign the wrong visual to some entries and duplicate visuals for conceptually identical entries.

Prior grouping logic in `commandUtils.ts` groups by command string for display purposes, but that grouping must not be extended to visual identity.

## Decision

Each `SlashCommand` entry carries an optional `visualId: string` field that **independently** identifies its semantic concept. The `VISUAL_REGISTRY` is keyed by `visualId`.

Rules:

1. **Split overloaded same-text commands** when their behavior differs. Known case: `/new` splits into `new-scaffold` (project scaffolding) and `new-fresh-chat` (session reset).
2. **Share one `visualId`** across platform-specific entries when they represent the same semantic concept, so the same visual reinforces one mental model.
3. **Never derive `visualId` from the command string**. Assignment is explicit and intentional per entry.
4. **`visualId` is optional**. Entries without a `visualId` render without a visual (text-only). This is the correct degraded state for entries not yet covered.

## Consequences

- Visual identity is decoupled from command naming, which can be coincidental or platform-specific.
- The registry can evolve independently of the command catalog.
- Adding a visual to an existing entry is a non-breaking data change.
- The `/new` example establishes the precedent for future overloaded commands.
