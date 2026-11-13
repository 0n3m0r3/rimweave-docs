---
title: Follow a character inside a container
description: Distinguish direct map presence from a native holder and its map without changing the character.
---

# Follow a character inside a container

[!INCLUDE [Documented version](../includes/version.md)]

A character enters a cryptosleep casket. Two mods still need to identify their health effects on that character, but a resolved reference does not mean the character is standing on the map or available for an activity.

RimWorld already owns the character, the casket and its contents. A <xref:RimWeave.References.NativeReference> reads that native state; it creates no container, moves no character and decides no access rule.

## Read the pawn's current context

Call `Capture()` and inspect its `Resolution` before using the snapshot's objects. The snapshot separates four observations:

| Property | What it describes |
| --- | --- |
| `Map` | The pawn's directly occupied map, if any. |
| `Spawned` | Whether the pawn is directly spawned on a map. |
| <xref:RimWeave.References.NativeReferenceSnapshot.MapHeld> | The native map occupied directly or reached through the pawn's holder chain, if any. |
| <xref:RimWeave.References.NativeReferenceSnapshot.ParentHolder> | The immediate native holder, not necessarily the outermost holder. |

For an effect reference, these properties describe its **pawn**. The effect remains in that pawn's health list; it is not itself transferred into the casket. `EffectAttached` separately reports exact membership in that list.

On the inspected game build, a directly spawned pawn has its `Map` as its immediate holder. Inside a spawned casket, `Spawned` is false and `Map` is null, while `ParentHolder` identifies the casket and `MapHeld` identifies the casket's map. If the casket is temporarily off-map, the same holder can remain while `MapHeld` becomes null.

A non-null holder therefore does not by itself mean “inside a container”. A null map does not by itself mean “unresolved”. Read the fields together. None establishes reachability, willingness, a reservation or permission to act.

## Recheck after a change

Each capture reads `Pawn.ParentHolder` and `Pawn.MapHeld`. RimWeave keeps no second ownership graph or location cache. Nested holders use the native traversal; the snapshot still reports the immediate holder.

These are observations at one instant, not a new event subscription. Existing map notifications concern direct pawn entry, departure and map removal. A holder can move out and back between two captures without that history being reconstructed. Adding these fields does not expand <xref:RimWeave.References.ReferenceTrackingCoverage>.

The snapshot's native objects remain mutable. Read again before a later action, and let the consuming mod decide whether the observed context is acceptable.

## Save the reference, then reread the context

Persist the `NativeReference` through its owner's native `ExposeData`, as described in [saving an exact reference](persistence.md#save-an-exact-reference-separately). The new context fields add no saved holder graph or copied map. After native loading resolves the pawn and effect, the next capture reads their current native context.

Loading does not restart tracking or reapply contributions. Start tracking explicitly if the consumer still needs the supported notifications. An unresolved or mismatched reference exposes no purportedly valid holder or held map.

## Exercise the casket scenario

Use a disposable human colony with the framework and both [composition examples](composition.md). Run mutations explicitly in developer mode.

1. Apply A and B explicitly to one present hand. Record both native effect identities, metadata, target, severity and creation ticks. Create and track separate references for the pawn and each effect. Observe the direct map context.
2. Despawn the pawn and place it in a native cryptosleep casket through its native acceptance method. Check that all references still resolve, both effects remain attached, direct map presence is absent, and the immediate holder and held map identify the casket and its map.
3. Temporarily despawn and respawn the occupied casket. Capture while it is off-map and after it returns. The holder stays the same, while its held map changes. Inspection must preserve native ownership, the health list, random state and pending observations.
4. Save under a new name and reload with the pawn contained. Inspect before any producer action or tracking restart. Verify native containment, exact identities and unchanged contribution metadata. Restart tracking explicitly, eject through the native casket method and verify direct map presence again.
5. Save under another name and reload after release. Confirm the same two contributions, an empty casket, no replayed additions and no implicit tracking restart. Compare both save files and callback counts.

## Boundaries

The [recorded casket run](../compatibility/index.md#native-holder-context) covers native entry, temporary casket despawning/respawning, two saves and two reloads in one process. Ejection can apply native cryptosleep sickness; preserving the two contributions is not a claim that every health effect remains unchanged.

Nested-holder traversal and unresolved states have automated fixture coverage. Caravans, custom containers, arbitrary destruction, other world transitions and a separate-process reload have not been validated by this run. The programmatic scenario does not exercise the manual loading job or UI.
