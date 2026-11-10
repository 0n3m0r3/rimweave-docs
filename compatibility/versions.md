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

## Contracts covered here

- Shared contribution identity and metadata owned by each contribution.
- Typed lookup and explicit exclusive-responsibility queries.
- Extensible origins with optional source references.
- Exact pawn/body-part health targeting and independent contribution effects.
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
