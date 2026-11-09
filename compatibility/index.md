---
title: Support and evidence
description: What this prototype implements and what its recorded tests establish.
---

# Support and evidence

[!INCLUDE [Documented version](../includes/version.md)]

The framework is experimental. This matrix separates an implemented contract from the scope of its verification. “Not verified” is not a claim that a configuration fails.

## Current evidence

| Area | Evidence | Boundary |
| --- | --- | --- |
| Shared identity, metadata, origin and resolution contracts | Automated framework tests; executable documentation examples | Does not establish arbitrary third-party integration. |
| Native health targeting and guard refusals | Automated checks with minimal native objects | Successful native lifecycle operations need game validation. |
| Exact-instance native removal | Manual prototype check on RimWorld 1.7.5000 rev1275: first removal succeeded, second returned absent, callback deltas were `[1,1]` then `[0,0]` | Specific framework/example configuration, recorded on 8 November 2026. |
| Independent hand targets | Manual prototype check preserved the other hand's marker | Does not establish general transformation reversal. |
| Removal by contribution identity | Automated missing, ambiguous and unreadable-metadata checks, plus guard-delegation checks | Successful native removal through this entry point has not been separately validated in game. |
| Saving contribution metadata | Automated tests using the native Scribe save/load phases for a health effect and a separate data owner | Does not establish full-colony reload behavior or arbitrary provider compatibility. |
| Unreadable saved metadata | Automated rejection of unsupported or malformed metadata, preservation for later saves, and incomplete-query results | Does not repair a damaged save or replace missing third-party classes. |
| Passive inspection | Implemented as native state reads and diagnostic output | Full neutrality across all game configurations is not certified. |

The native example contains two observers in one example mod. It is not proof of compatibility between arbitrary independent mods.

## Native reference tracking

The documented framework revision includes exact native references and per-consumer observations of supported transitions. Automated checks cover current-state inspection, native map event adapters, cooperating health callbacks and native Scribe reference resolution, including rejection of references created or loaded without an owning game. The full framework suite passed 186 tests in both Debug and Release on 9 November 2026, with no build warnings or errors. No game assemblies were copied into the installable mod directories.

These checks use controlled native objects and save graphs. They do not establish a complete colony load, a full movement/death/resurrection sequence in game, or compatibility with arbitrary providers. Some native removals bypass callbacks; direct map presence does not cover every carried or contained pawn, and arbitrary off-map destruction has no immediate notification guarantee. See [the integration boundaries](../guides/health-effects.md#keep-a-reference-when-the-character-moves).

## Explicit limitations

| Capability | Current state |
| --- | --- |
| Contribution metadata after save/load | Implemented for `ContributionHediff`; another object must explicitly use the persistence helper in its own save/load code. See [Keep information through a save](../guides/persistence.md). |
| Migration or provider removal | No general migration or removal/reinstallation guarantee. The initial save/load contract assumes the required classes and definitions remain available. |
| Automatic discovery of other mods' origins | Not implemented. A provider or explicit adapter must supply provenance. |
| General gameplay conflict detection | Not implemented. Queries report declared identities and exclusive claims in their supplied scope. |
| Object, equipment or activity adapters | No native adapter delivered by this preview. Generic test consumers are not such integrations. |
| RJW binary compatibility | Not promised or verified. |
| Multiplayer determinism and performance budgets | Not verified. |

## Target and dependencies

The current target is RimWorld 1.7 with .NET 10. Evidence from older game versions does not certify this target. Neither Harmony nor HugsLib is a required dependency of the present framework project.

Extensions own their compatibility statements and adapters. An effect added through a native API by another mod remains native; it does not automatically acquire RimWeave metadata. An exact-instance operation may still be usable when its documented preconditions hold.

Report a compatibility finding with exact versions, a minimal scenario and observable results. Describe an untested interaction as an investigation rather than asserting either universal compatibility or incompatibility.
