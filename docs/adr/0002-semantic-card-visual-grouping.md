# ADR-0002 — Semantic Card Visual Grouping
**Status:** Accepted

**Context.** Slash Cards currently has command entries that can share the same literal command text while representing different behaviors. For example, VS Code `/new` scaffolds a workspace or file, while GitHub.com `/new` starts a fresh chat and is equivalent to `/clear`. Card Visuals need to represent meaning, not just syntax, and the same rule must also work for non-command Card Items such as individual skills.

**Decision.** Card Visual identity will be based on semantic Card Item concepts. Platform-specific entries can share one Card Visual when they mean the same thing, but same-text commands must split into separate visual concepts when their behavior differs.

**Consequences.** This prevents misleading artwork for overloaded command names and gives the visual system a stable conceptual model. It means the implementation cannot rely only on the command string as the visual key and will need explicit visual grouping for ambiguous commands.

**Alternatives considered.** Grouping visuals by literal command text was rejected because overloaded commands would share incorrect scenes. Creating a separate visual for every platform-specific entry was rejected because it would duplicate art for commands whose meaning is genuinely shared across platforms.
