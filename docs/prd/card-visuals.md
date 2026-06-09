# PRD: Card Visuals for Slash Cards

## Problem Statement

Slash Cards currently teaches slash commands, built-ins, participants, and
future individual skills through text-first cards. The app is useful as a
reference and study tool, but the cards do not yet create a strong visual
memory hook. Each Card Item has distinct value that could be made more
memorable through a consistent, branded Card Visual, but adding visuals without
a clear system risks visual noise, inconsistent style, inaccessible artwork,
and misleading representations for overloaded commands such as `/new`.

The user wants Card Visuals that draw attention, invite interest, and create
meme-worthy recall while preserving the app's dense gallery value, study flow,
host-native theming, and accessibility baseline.

## Solution

Introduce a Card Visual system for Slash Cards. Each semantic Card Item concept
gets a reusable SVG-style doodle: a single-frame scene metaphor using the
recurring Slash Cards cast, controlled rough sketch linework, one Slash Cards
accent color, concise alt text, and a consistent lower-left label chip when
rendered on card fronts.

The first implementation should validate the system through a representative
prototype set before scaling to full coverage. The prototype should exercise
hard cases across item types and semantics: `/fix`, `/compact`, `/new`
scaffolding, `/new` fresh chat, `/yolo`, `@workspace`, `diagnose`, and
`/model`.

## User Stories

1. As a Slash Cards learner, I want each card to have a memorable visual scene,
   so that I can remember what the Card Item does faster than by text alone.
2. As a Slash Cards learner, I want visuals to feel like one branded system, so
   that the app feels cohesive instead of like a random image gallery.
3. As a Slash Cards learner, I want the command or item label to remain readable
   over the visual, so that I can scan the gallery quickly.
4. As a Slash Cards learner, I want the Gallery Thumbnail to stay compact, so
   that browsing many cards remains efficient.
5. As a Slash Cards learner, I want the visual to stay visible in small layouts,
   so that the memory hook survives inline and narrow host displays.
6. As a Slash Cards learner, I want the Study Card front to use the visual as
   the prompt, so that recall is tied to the scene before I flip for details.
7. As a Slash Cards learner, I want the Study Card back to remain text-first, so
   that explanations, when-to-use guidance, and examples stay clear.
8. As a Slash Cards learner, I want the Detail Overlay to include a smaller
   visual reference, so that I can connect the full explanation back to the
   visual memory hook.
9. As a Slash Cards learner, I want visuals to be playful but still functional,
   so that the joke helps me remember the command rather than distracts from it.
10. As a Slash Cards learner, I want abstract items like `/model` or `/usage`
    represented by outcome-based metaphors, so that their value is easier to
    understand than a literal UI control.
11. As a Slash Cards learner, I want overloaded command text like `/new` to
    split into different visual concepts when the behavior differs, so that the
    artwork does not teach the wrong meaning.
12. As a Slash Cards learner, I want equivalent commands across platforms to
    share a visual when they mean the same thing, so that I learn the concept
    once instead of seeing duplicate art.
13. As a Slash Cards learner, I want participants such as `@workspace` to use
    the same visual treatment as slash commands, so that the gallery feels
    coherent across Card Item types.
14. As a Slash Cards learner, I want individual skills such as `diagnose` to get
    their own Card Visuals, so that skills can be learned as first-class Card
    Items.
15. As a Slash Cards learner, I want the app to distinguish the `/skills`
    management command from individual skill cards, so that I do not confuse
    managing skills with using a specific skill.
16. As a Slash Cards learner, I want visuals to respect light and dark themes,
    so that the app remains comfortable in host-native environments.
17. As a Slash Cards learner using assistive technology, I want each Card Visual
    to have concise alt text, so that the visual metaphor is available without
    creating verbose card controls.
18. As a keyboard user, I want Card Visuals and card interactions to preserve
    the existing accessible keyboard flow, so that adding art does not regress
    usability.
19. As a reduced-motion user, I want visuals to be static by default, so that the
    gallery does not become distracting or uncomfortable.
20. As a future learner, I want Card Visuals to support optional event-triggered
    animation later, so that hover, focus, click, or tap can strengthen memory
    without autoplay loops.
21. As a visual designer, I want each scene to follow a simple composition rule,
    so that 100+ visuals can stay consistent at thumbnail size.
22. As a visual designer, I want category-level Metaphor Families, so that
    related Card Items feel connected without sharing generic fallback art.
23. As a visual designer, I want original meme-like scenes rather than copied
    meme templates or mascots, so that the app remains distinctive and safe to
    share.
24. As a developer, I want a separate visual registry keyed by semantic visual
    ID, so that Card Visuals can be reused, split, and tested without
    duplicating SVG metadata across entries.
25. As a developer, I want the Card Visual registry to include scene metadata
    and alt text, so that rendering surfaces can consume one stable interface.
26. As a developer, I want the visual system to be independent of
    platform-specific entries, so that platform metadata remains separate from
    visual identity.
27. As a developer, I want a prototype set before the full library is produced,
    so that layout, data modeling, accessibility, and style can be validated
    with hard cases.
28. As a maintainer, I want Card Visual coverage to eventually include every
    semantic Card Item concept, so that no production card feels unfinished.
29. As a maintainer, I want Gallery Thumbnail metadata to stay minimal, so that
    stack count and availability cues do not clutter the artwork.
30. As a maintainer, I want external or share thumbnails to remain out of scope
    for this phase, so that the first pass focuses on the in-app experience.

## Implementation Decisions

- Build a deep Card Visual registry module keyed by semantic `visualId`. The
  registry owns each Card Visual's SVG component or renderable asset reference,
  alt text, scene brief, Metaphor Family, static launch state, and future
  animation capability metadata.
- Extend Card Item data with an explicit visual identity reference rather than
  deriving visuals from the literal command string. This is required because
  same-text Card Items can have different meanings.
- Preserve equivalent platform behavior by allowing multiple platform-specific
  entries to reference the same visual ID when they share one semantic Card Item
  concept.
- Split overloaded same-text commands into separate semantic visual IDs when
  their behavior differs. The key known example is `/new`: scaffolding is
  separate from fresh-chat/session reset.
- Treat Card Visuals as SVG-style vector doodles. This follows ADR-0001 and
  avoids raster image pipelines, blurry thumbnails, and hard-to-theme assets.
- Use controlled-rough monochrome sketch linework on an adaptive muted
  paper-like surface with one Slash Cards accent color.
- Use original meme-aware scenes with the recurring Slash Cards cast. Do not use
  direct meme templates, copyrighted characters, or platform mascots.
- Apply the same Card Visual treatment to slash commands, built-in commands,
  participants, and individual skills. Item type should be shown through
  metadata, not separate illustration styles.
- Use category-level Metaphor Families to guide unique scenes. Examples: session
  commands use containers, time, and reset metaphors; code-action commands use
  workshop and repair metaphors; planning commands use maps and routes;
  integration commands use bridges, ports, and plugs.
- Enforce the Scene Composition rule: one recurring character, one
  command-specific object, and one action or accent cue.
- Prefer outcome-based metaphors for abstract Card Items instead of literal
  UI-object depictions.
- Keep Card Visuals static at launch, but structure SVGs and the renderer so
  future hover, focus, click, or tap triggered animation loops can be added
  without replacing the asset model. Do not autoplay animations.
- Add a reusable Card Visual renderer that can adapt to three surfaces: Gallery
  Thumbnail, Study Card front, and Detail Overlay hero strip or thumbnail.
- Gallery Thumbnails should use full-bleed Card Visuals with a fixed lower-left
  high-contrast label chip and subtle bottom scrim.
- Gallery Thumbnails should keep only essential overlays: command/item label,
  stack badge, and session availability cue. Platform and category details
  belong in filters or the Detail Overlay.
- Preserve the existing dense gallery sizing and responsive column behavior.
  Compose SVGs to read at the current thumbnail scale instead of making cards
  larger.
- In cramped displays, collapse secondary metadata before hiding Card Visuals.
- Study Card fronts should use the same lower-left label chip grammar as Gallery
  Thumbnails. Study Card backs remain text-first.
- Detail Overlays should show Card Visuals as compact reinforcing hero strips or
  thumbnail previews near the header while preserving the current information
  hierarchy for availability, usage, examples, equivalents, behavior notes, and
  tags.
- Home should receive only light branded doodle treatment: a small
  recurring-cast illustration or empty-state cue, not a dominant illustrated
  landing hero.
- Each Card Visual must include concise alt text, ideally a 6-12 word action
  phrase focused on the scene metaphor rather than restating the command label.
- The first prototype set is exactly: `/fix`, `/compact`, `/new` scaffolding,
  `/new` fresh chat, `/yolo`, `@workspace`, `diagnose`, and `/model`.
- Future full Visual Coverage means every semantic Card Item concept has a
  unique Card Visual before the visual system is considered complete.

## Testing Decisions

- Tests should validate external behavior and accessibility-visible outcomes
  rather than SVG internals or implementation details.
- Test the Card Visual registry as a deep module: given a Card Item or visual
  ID, it returns the expected visual metadata, alt text, scene metadata, and
  renderable asset reference.
- Test semantic visual grouping: equivalent platform entries share visuals when
  meanings match, and overloaded same-text Card Items split when meanings
  differ.
- Test the Gallery Thumbnail behavior: a card with a visual renders the visual,
  readable label chip, stack badge when applicable, and availability cue when
  applicable.
- Test the Study Card behavior: the front renders the visual prompt with label
  chip, while the back remains text-first with description, when-to-use,
  example, and metadata.
- Test the Detail Overlay behavior: the visual appears as a compact reinforcing
  element and does not remove existing platform, equivalent, example, behavior,
  and tag information.
- Test accessible naming: Card Visual alt text is present where needed, concise,
  and does not make button labels overly verbose.
- Test reduced-motion and launch behavior: Card Visuals do not autoplay
  animation loops.
- Test responsive behavior at constrained widths: visual identity remains
  visible while secondary metadata can collapse.
- Prior art in the codebase is component-level behavior testing for React
  surfaces once a test framework exists; if no test harness is present, add the
  minimum project-consistent test setup needed for these UI and registry
  behaviors as part of implementation.

## Out of Scope

- Producing the full Card Visual library for every Card Item in the first
  implementation pass.
- External or social/share thumbnails.
- Persistent looping animations or autoplay visual motion.
- Direct references to existing meme templates, copyrighted characters, or
  platform mascots.
- Separate light and dark SVG asset sets.
- Raster image generation pipelines.
- A category fallback system where many commands share one generic visual.
- Redesigning the entire home screen as an illustrated landing page.
- Changing core card learning behavior beyond adding Card Visual surfaces.

## Further Notes

- The current app is a React-based MCP App with a gallery-first browser,
  flip-card study viewer, Detail Overlay, host-native theming, and accessibility
  goals.
- Existing domain docs define Card Item, Built-in Command, Card Visual, Gallery
  Thumbnail, Doodle Style, Visual Motion, Visual Tone, Scene Composition,
  Metaphor Family, Recurring Cast, Study Card, Detail Overlay, Home Doodle, and
  Visual Coverage.
- ADR-0001 records the SVG Card Visual asset decision.
- ADR-0002 records semantic Card Visual grouping.
- Current grouping logic is command-string based, so implementation needs to
  avoid carrying that assumption into visual identity.
- The prototype should prove the visual language before scaling to approximately
  100 semantic Card Item concepts and the broader 145+ entry catalog.
