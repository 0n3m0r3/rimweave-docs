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

The [corpse/discard guide](corpse-and-discard.md) covers the separate case where the body is destroyed, the world retains the dead pawn, and native cleanup later discards it. This does not imply that a bodyless pawn is eligible for resurrection.

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

## Quit and reload in a new process

A player can close the game while the character is dead and return in another session. Reloading within one running process does not prove this case: a verification tool might accidentally retain expected objects, subscriptions or counters in static fields.

Use the same game, framework and provider configuration for three separate processes. Native save files must restore the objects. External records may hold expected identities and values for comparison; they must not recreate effects or reconnect references.

1. **Save the dead character and exit.** Create A and B explicitly, start the four references, invoke native death and save. Record the pawn, corpse and effect identities, metadata, pending observations and tracking flags. Wait for the process to end before launching another.
2. **Load, resurrect, save and exit.** Load the dead save directly in a fresh process. Before producer actions, check the original pawn, corpse and effects, saved observations and stopped tracking. With fresh callback counters, loading must add or remove no contribution. Resume explicitly, resurrect, verify A and the detached B references, then create a replacement B and save under a second name. Exit again.
3. **Load the resurrected character.** In a third process, check A and the replacement B against their recorded native identities and metadata. Both old B references must remain unresolved with their diagnostic identities. Check that no producer action or automatic tracking restart occurred during loading.

In every new process, install test observers before native loading and start their counters empty. Compare native `PostLoadInit` callbacks separately from additions and removals. Freeze each diagnostic record when recording it so later counter changes cannot alter earlier evidence. An external record used for comparison is not part of RimWeave's save format.

The [recorded restart check](../compatibility/index.md#references-across-game-restarts) used native developer-mode autostart loading in an isolated profile, with byte-identical copies of the named saves. The two loading processes created no new colony. This is a programmatic persistence check, not a test of menu interactions.

## Boundaries

The [initial recorded run](../compatibility/index.md#native-death-and-resurrection) exercises the native programmatic operations and two reloads in one process. The [restart check](../compatibility/index.md#references-across-game-restarts) separately covers two loads across three processes with the same configuration. Neither tests a fatal attack, a resurrection item, UI interactions, natural corpse decay, caravans, third-party resurrection, configuration changes or interruption while writing a save. Programmatic corpse destruction and explicit native discard have a [separate recorded check](../compatibility/index.md#corpse-destruction-and-native-discard); automatic cleanup policy and destroyed-living-pawn paths are not established by these game runs.
