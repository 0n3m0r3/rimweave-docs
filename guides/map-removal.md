---
title: Keep references when a map is removed
description: Distinguish a lost local context from a lost pawn, and revalidate exact references before entering a new map.
---

# Keep references when a map is removed

[!INCLUDE [Documented version](../includes/version.md)]

A colonist leaves in a caravan with two independently owned effects. The old map is removed while the colonist is away. A mod still remembers that local context, but the character and both effects remain in the world. After saving and restarting, the caravan can enter a newly generated map at the same world tile.

RimWorld owns map removal, world pawns, caravans and map generation. RimWeave records supported transitions for explicitly tracked references. The consumer decides what losing a local context means for its activity and when its cached data must be replaced.

## Separate context removal from target loss

In the [verified native path](../compatibility/index.md#removal-of-a-former-map), departure first records `LeftContext`. Removing the last map observed by that active subscription then records `ContextRemoved`.

| Observation | Meaning |
| --- | --- |
| `ContextRemoved` | This subscription's last observed local map was removed. |
| `Resolved` with no `Map` or `MapHeld` | The exact pawn remains available outside a local map. |
| Native caravan in `ParentHolder` | The pawn has a current native holder even though its former map is gone. |
| `IsTracking = true` | The valid target's subscription continues; losing a map alone does not stop it. |

The tested pawn stays alive, undestroyed and undiscarded, and its exact A/B effects remain attached. Context removal does not imply target destruction or effect removal. The map component releases its event handlers; the reference can still observe later supported transitions elsewhere.

An old snapshot or a retained C# map object does not establish that the map remains available. Re-read native state before using a local position, room, reservation or other context-dependent data. RimWeave does not clean up an extension's activity resources or decide whether it can continue.

## Respect each subscription's history

Tracking starts from the current direct map, if any, and updates that observed map through supported direct pawn entry and departure notifications. A subscription started while the pawn is already in a caravan has no earlier local-map history. Removing that former map does not invent `ContextRemoved` for it.

A reference that observes entry into another map no longer treats removal of the previous map as loss of its latest context. The native event-adapter tests cover this distinction; the complete-colony scenario below focuses on departure into the world followed by removal of that former map.

Two references to the same effect keep independent pending observations. Acknowledging one B observer's `ContextRemoved` leaves the other intact. A witness tracked only after entering its own caravan receives no historical map-removal observation.

## Reload and enter a new local context

Native saving can retain the world pawns and caravans with no local map in the save. Loading restores the same native identities and exact effects without recreating the removed map. Previously recorded change kinds survive, with `TrackingInterrupted` added for subscriptions saved active. Loading never resumes tracking automatically.

After inspecting the restored state, the consumer may acknowledge its observations and explicitly start tracking again. This begins a new observation interval from the current context; it does not reconstruct the previous subscription's last-map history. Saved pending flags are not a persistent map identity or event log.

The [recorded scenario](../compatibility/index.md#removal-of-a-former-map) explicitly generates a new map at the same world tile. That map has a different native identity. Generation alone does not move the referenced characters; native caravan entry supplies `EnteredContext` when the traveller actually enters. Its effects remain the same objects in that process. A later restart resolves their native saved identities again, without replaying additions or restarting subscriptions.

## Exercise the removal boundary

Use a disposable profile with the framework and both composition examples. Keep versions and definitions fixed. Invoke each mutation explicitly in developer mode, and collect fresh callback counters in every process.

1. **Remove the former map.** Add A/B to a traveller and A to a witness. Put the witness in its own caravan before starting its references. Start the traveller's references on the map, depart through native caravan creation and acknowledge departure. Invoke native `Game.DeinitAndRemoveMap` for that map. Check `ContextRemoved` only on the traveller's references, preserved effects, independent acknowledgement by two B observers and valid world context. Save and exit.
2. **Load without a map, then arrive.** In a fresh process, load directly and verify the native targets before any producer action. Inspect and explicitly resume subscriptions. Generate a new map through the native map utility at the caravan's world tile, select that map as the current local context, and enter through the native caravan utility. Verify the new map identity, entry observations, exact effects and the independent world witness. Save and exit again.
3. **Load the new context.** In another fresh process, verify that only the new map is restored, the traveller is on it and the witness remains in its caravan. Check saved observations, no replayed additions/removals and no implicit subscription restart.

This programmatic scenario keeps the simulation paused. It does not exercise the abandonment interface, establish the fate of characters left on a removed map, or certify pocket maps, third-party maps, provider changes, activity-resource cleanup or arbitrary native relation persistence. See [caravan references](caravan-references.md) for the separate path where the original map remains available.
