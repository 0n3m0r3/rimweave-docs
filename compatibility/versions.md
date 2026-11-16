---
title: Versions and changes
description: Identify the documented framework revision and distinguish preview contracts from stable releases.
---

# Versions and changes

[!INCLUDE [Documented version](../includes/version.md)]

This is the first documentation preview. It is not a declaration of a stable framework release or a compatibility promise for future API revisions.

## Identify the right version

The [API snapshot manifest](../api/snapshot.json) records the framework baseline commit, whether local changes were included, the source fingerprint, the DocFX version and checksums for generated API files.

A working-tree preview must be re-exported after the framework changes are committed before it can be publicly published by the prepared workflow. Source links are omitted in that preview so changed line numbers do not point to unrelated committed code.

## Choose required game content

Suppose your mod adds a removable effect to a character's hand and keeps an exact reference through a save. The current contribution and reference contracts do not require a DLC. The framework manifest declares no DLC dependency; the two optional composition examples require only the framework. Their [Core-only verification](index.md#core-only-configuration) covers loading, native health operations and a fresh-process reload with all DLC activation flags false.

Your mod still owns the dependencies of its own gameplay. If a feature uses Biotech or Ideology, declare or guard that dependency through RimWorld's mechanisms before using its APIs. Native `ModsConfig` activation properties, such as `BiotechActive` and `IdeologyActive`, describe the running configuration. An installed expansion is not necessarily active, and an active package alone does not establish compatibility with a particular provider version. RimWeave supplies neither a replacement DLC nor a general provider-version negotiation service.

For a Core-only test, use an isolated native mod configuration and verify the packages actually loaded. On the tested game build, the native `-mod` shortcut also enables installed compatible official expansions; naming only the framework there does not isolate Core. A newly detected expansion can also be enabled by the native configuration loader. Inspect the active flags and saved package list instead of inferring the result from the requested list.

This evidence concerns the documented framework revision and the stated scenarios. It does not certify every DLC combination, third-party race or addon, a physical DLC uninstall, or a mod's own DLC-dependent behavior.

## Contracts covered here

- Shared contribution identity and metadata owned by each contribution.
- Typed lookup and explicit exclusive-responsibility queries.
- Extensible origins with optional source references.
- [Optional XML attribution](../guides/xml-declarations.md) for newly created cooperating health effects, with existing saved metadata kept authoritative.
- Exact pawn/body-part health targeting and independent contribution effects.
- [Targeted native addition](../guides/health-effects.md#observe-the-addition) with an explicit part or whole-body target and the attachment observed after the complete native call.
- Guarded native removal by instance or resolved contribution identity, including an explicit `AlreadyRemoving` result for a reentrant request on the same attached instance.
- Metadata saved through the native Scribe process, with explicit handling of unreadable saved information.

## Native reference tracking

The documented framework revision also includes exact native pawn and health-effect references, current-state inspection, explicitly activated tracking of supported native callbacks, and saved reference resolution with an explicit interruption at load. See [the reference scenario](../guides/health-effects.md#keep-a-reference-when-the-character-moves) and [its save/load boundary](../guides/persistence.md#save-an-exact-reference-separately).

This increment does not supply persistent organ identity, an activity's reservation cleanup or universal lifecycle notifications for every mod.

## Developer diagnostics

The documented revision includes the bounded [health contribution report](../guides/debugging.md#inspect-declared-health-contributions) and passive presentation for both developer reports. The health report reads declared information; it does not establish undeclared provenance or general compatibility. See [the recorded correction checks](index.md#published-corrections) for their verification limits.

## Evolution policy

Documentation for a published revision must describe that revision, including its limits. When a later API changes a contract, update its XML comments, examples, guides and migration guidance together. Keep older published contracts addressable instead of silently replacing their meaning.

Framework API version, saved metadata format and RimWorld version are separate compatibility dimensions. The current metadata format is version `1`. Its save/load support does not provide a general migration mechanism or a guarantee that older framework versions can read future data. See [Keep information through a save](../guides/persistence.md) for the implemented behavior and its limits.

For current evidence rather than intended future behavior, consult [Support and evidence](index.md).
