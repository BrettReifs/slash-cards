# Slash Cards Context

## Card Item
**Definition.** A thing Slash Cards can teach as a card, including slash commands, built-in commands, participants, and individual agent skills.

**Not to be confused with.** The `/skills` command, which manages or lists skills; an individual skill is its own Card Item when the skill itself is being taught.

**Examples.** `/skills` can have a Card Visual about managing skills, while a skill such as `diagnose` or `tdd` can have its own Card Visual about the value of that specific skill.

## Built-in Command
**Definition.** A command or participant supplied by the host or tool by default.

**Not to be confused with.** A user-authored skill, user-created command, or installed extension command; those may be Card Items, but they are not built-ins.

**Examples.** `/clear`, `/help`, `/model`, and `@workspace` count as built-ins when they are provided by the active host or tool.

## Card Visual
**Definition.** A reusable single-frame scene metaphor assigned to a semantic Card Item concept, shared by platform-specific entries that mean the same thing and paired with concise 6-12 word alt text.

**Not to be confused with.** A platform visual, which would create separate art for the same command on different surfaces; a command-text visual, which would assume the same literal command string always means the same thing; a symbolic icon, which labels a command with a simple mark instead of showing a tiny scenario; or verbose illustration narration, which would make card controls noisy. Platform differences remain metadata and styling unless the command meaning changes.

**Examples.** `/fix` gets one repair-themed visual across Copilot VS Code, Visual Studio, JetBrains, and Xcode variants with alt text like "Agent repairing a bug-shaped robot"; `/compact` gets one compression-themed visual across Copilot CLI and Claude Code variants with alt text like "Agent compressing a long chat log"; `/new` for scaffolding and `/new` for starting a fresh chat get separate visuals because they mean different things; `@workspace` and a skill such as `diagnose` use the same visual treatment as slash commands.

## Gallery Thumbnail
**Definition.** The compact card face in the dense browse grid, where the Card Visual appears as full-bleed doodle artwork with the command name overlaid in a fixed lower-left high-contrast label chip and subtle bottom scrim, plus only essential stack and availability metadata.

**Not to be confused with.** The study card, which is a larger flip-card surface for focused review; detail overlay, which explains the selected command after a thumbnail is opened; external/share thumbnails; or secondary metadata like platform/category details, which belongs in filters or the detail overlay instead of crowding the thumbnail.

**Examples.** A `/fix` thumbnail can show the bug-repair scene across the full card while `/fix` remains legible in a lower-left terminal-chip or paper-tape style overlay.

## Doodle Style
**Definition.** The branded illustration style for Card Visuals: controlled-rough monochrome sketch linework on an adaptive muted paper-like surface with one Slash Cards accent color.

**Not to be confused with.** Platform-tinted artwork, where the visual identity changes by host; category-tinted artwork, where command categories own the primary color system; loose messy sketching; fully inverted dark-mode art; separate light/dark SVG sets; or pure meme art, where the joke overwhelms the command meaning.

**Examples.** A `/plan` scene might use rounded strokes, slight wobble, minimal hatching, and a teal path highlight, while Claude and Copilot variants keep their platform identity in badges rather than the illustration itself.

## Visual Motion
**Definition.** The motion policy for Card Visuals: static by default at launch, with the asset and component model designed to allow future simple hover, focus, click, or tap triggered animation loops.

**Not to be confused with.** Autoplay or persistent looping animation, which would make the gallery noisy; or decorative UI hover polish, which belongs to the card shell rather than the Card Visual itself.

**Examples.** A `/compact` visual ships as a static doodle, but its SVG structure should not prevent a future hover or click animation where the chat log squeezes smaller.

## Visual Tone
**Definition.** The humor level for Card Visuals: playful and meme-aware, but grounded in the command's function.

**Not to be confused with.** Pure instructional diagrams, which optimize only for clarity; joke-first memes, which may be memorable but fail to teach the command; direct meme template references; copyrighted characters; or platform mascots.

**Examples.** `/yolo` can show the recurring character launching a tiny rocket past a warning sign, but the scene still needs to communicate permissions and risk without copying an existing meme.

## Scene Composition
**Definition.** The noise budget for a Card Visual: one recurring character, one command-specific object, and one action or accent cue.

**Not to be confused with.** A rich mini-comic scene, which adds multiple props and background details; an ultra-minimal prop sketch, which omits the action beat that makes the command memorable; or literal UI depiction, which draws the control instead of the user outcome.

**Examples.** `/compact` uses the recurring character, a chat log, and a squeezing cue; `/plan` uses the recurring character, a map, and a highlighted route cue; `/model` can show the character choosing the right brain or tool for a job rather than a dropdown.

## Metaphor Family
**Definition.** A category-level visual grammar that guides unique Card Visuals so related commands feel connected without sharing the same scene.

**Not to be confused with.** A category fallback visual, which would reuse one generic image for many commands; or category color-coding, which would make color the primary grouping signal.

**Examples.** Session commands can use containers, time, and reset metaphors; code-action commands can use workshop and repair metaphors; planning commands can use maps and routes; integration commands can use bridges, ports, and plugs.

## Recurring Cast
**Definition.** A small neutral agent-like doodle character or cast that appears across Card Visuals to make the visual system feel memorable and connected.

**Not to be confused with.** A platform mascot, which would imply GitHub, Claude, or another host owns the character; or command-only props, which can vary without creating a recognizable Slash Cards world.

**Examples.** The same tiny agent character can squeeze a long transcript for `/compact`, repair a bug-shaped robot for `/fix`, and unroll a map for `/plan`.

## Study Card
**Definition.** The focused flip-card review surface where the front uses the Card Visual as the prompt with the same lower-left label chip as the Gallery Thumbnail, and the back stays text-first for explanation and usage details.

**Not to be confused with.** The Gallery Thumbnail, which must work in a dense browse grid; or the detail overlay, which supports deeper command inspection after selection.

**Examples.** The front of `/compact` can show the recurring character compressing a chat log, while the back explains when to compact and shows the example command.

## Detail Overlay
**Definition.** The expanded command inspection surface where the Card Visual appears as a compact reinforcing hero strip or thumbnail near the header.

**Not to be confused with.** The Gallery Thumbnail, where the visual is dominant; or the Study Card front, where the visual acts as the review prompt.

**Examples.** Opening `/fix` can show a small bug-repair hero strip above or beside the command title, while the rest of the overlay prioritizes platform availability, usage guidance, and examples.

## Home Doodle
**Definition.** A light branded illustration treatment on the home screen that introduces the Recurring Cast without competing with command-specific visuals.

**Not to be confused with.** A Card Visual, which represents one semantic Card Item concept; or a dominant illustrated landing hero, which would make the home screen feel heavier than the card experience.

**Examples.** The home screen can show a small recurring-cast doodle near the title or empty state while keeping stack presets clean and easy to scan.

## Visual Coverage
**Definition.** The launch requirement that every semantic Card Item concept has a unique Card Visual before the visual system is considered complete.

**Not to be confused with.** Per-platform visual coverage, which would require separate art for duplicate platform entries; or category fallback coverage, which would let several commands share a generic category scene.

**Examples.** `/fix` needs one unique bug-repair visual shared by all equivalent platform entries, while `/tests` and `/setupTests` need separate visuals because they represent different Card Item concepts.
