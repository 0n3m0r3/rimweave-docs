---
title: Keep references through death and resurrection
description: Follow an exact pawn or health effect through native death, corpse storage and resurrection.
---

# Keep references through death and resurrection

[!INCLUDE [Documented version](../includes/version.md)]

Two mods attach independent effects to a character. The character dies, leaving a corpse, and is later resurrected. One effect should remain; the other is removed by a native health rule. Each consumer needs to distinguish the original character, the surviving effect and any newly created replacement.

RimWorld owns death, corpses, resurrection and health cleanup. RimWeave keeps exact references and observations. The extension decides whether a dead character can still be used for history, whether an activity should stop, and which native rules apply to its effects.

## Read death and destruction together

On the verified game build, `Pawn.Kill` sets both `Dead` and `Destroyed`. The corpse still holds the same pawn. A resolved <xref:RimWeave.References.NativeReference> therefore does not become a missing reference merely because the pawn died.

The snapshot reports `Dead = true`, `Destroyed = true` and `Discarded = false`. `Map` is null and `Spawned` is false; `ParentHolder` is the corpse and `MapHeld` reaches its map. These observations describe the native state, not permission to act or a promise that the game will retain the pawn indefinitely.

A dead pawn that has not been discarded can keep or explicitly start tracking. A destroyed living pawn, a discarded pawn or a detached effect cannot remain tracked. The same rule applies when starting a subscription and when reconciling it during inspection. This does not register a native retention claim or prevent world-pawn cleanup.

## Distinguish surviving and removed effects

An exact `ContributionHediff` forwards its native death and resurrection callbacks to its subscribers. A pawn-only reference receives the supported map notifications; it does not borrow health callbacks from effects on that pawn. Acknowledging one consumer's observations leaves another consumer's observations intact.

Native resurrection can remove an effect before notifying surviving effects. In the inspected version, `forceRemoveOnResurrection` removes it without calling `PostRemoved`. `Capture()`, `IsTracking` or `TakeChanges()` then detects that the exact effect is detached and ends its subscription. This reconciliation does not reconstruct a resurrection callback that the removed effect never received.

If another effect with the same contribution identity is added later, it has a different native identity. The old reference continues to name the removed object; it never selects or starts tracking the replacement. The consumer must create a new reference explicitly.

## Save and resume explicitly

A saved reference to a dead pawn can resolve again through the native save graph. Pending observations survive, but loading does not restart tracking. Resume explicitly after native loading if the consumer still needs the supported events.

A removed effect that no owner serializes cannot resolve after loading. Its reference retains the diagnostic identity. Saving and loading that dangling native reference can produce native warnings; a matching replacement does not silence those warnings or become the old target. See [the persistence boundary](persistence.md#save-an-exact-reference-separately).

## Exercise the native scenario

Use a disposable human colony with the framework and both [composition examples](composition.md). Run mutations explicitly in developer mode. The verification temporarily sets `forceRemoveOnResurrection` on B's definition in that test process; the shipped example definition is unchanged.

1. Explicitly add A and B to the same present hand. Record native identities, metadata, target, severity and creation ticks. Track the pawn, A and two independent references to B.
2. Invoke native death. Verify the corpse contains the original pawn, both effects remain attached and inspection preserves health, ownership and random state. Check that death does not stop the subscriptions; only the effect references record the health callback.
3. Save under a new name and reload. Verify the same pawn, corpse and effects before any producer action. Confirm saved observations and interrupted tracking, then restart explicitly.
4. Invoke native resurrection. Verify A is unchanged, B is removed by its native definition flag and the pawn is alive on the map. Only surviving effects report resurrection. Both B references reconcile detachment and stop. Explicitly create a new B and verify neither old reference selects it.
5. Save under another name and reload. Verify A and the new B, unresolved old B references, no replayed additions and no implicit tracking restart. Compare the native save graph and callback counts.

## Boundaries

The [recorded run](../compatibility/index.md#native-death-and-resurrection) exercises the native programmatic operations and two reloads in one process. It does not test a fatal attack, a resurrection item, UI interactions, corpse decay or destruction, caravans, third-party resurrection or a separate-process reload. Discard and destroyed-living-pawn guards have controlled automated coverage; this is not a complete native cleanup test.
