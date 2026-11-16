---
title: Follow a character through a caravan
description: Preserve exact native references across caravan departure, a game restart and return to the original map.
---

# Follow a character through a caravan

[!INCLUDE [Documented version](../includes/version.md)]

A mod remembers two effects on a colonist who leaves in a caravan. Another colonist stays home with an independent effect. The player saves while travelling, closes the game and later brings the caravan home. The consumer needs the same targets and their current context before deciding whether its activity can continue.

RimWorld owns the caravan, world pawns, map transitions and health effects. RimWeave observes those native objects through `NativeReference`; it does not copy their state into a parallel world registry. The extension owns any rule about continuing, suspending or stopping its activity.

## Read the available native context

For the directly contained pawn in the [verified caravan path](../compatibility/index.md#caravan-departure-and-return):

| Snapshot field | On the map, before and after | In the caravan |
| --- | --- | --- |
| `Resolution` | `Resolved` | `Resolved` |
| `Map` and `MapHeld` | Original map | Both null |
| `ParentHolder` | Native map | Native `Caravan` |
| `Spawned` | `true` | `false` |
| `EffectAttached` for A/B | `true` | `true` |

The pawn remains alive, undestroyed and undiscarded throughout this path. `Map == null` does not mean that its reference is unresolved. Conversely, a resolved reference does not establish local reachability, a room, visibility, a reservation or permission to act. A consumer that requires those local facts must treat them as unavailable while no map exists.

`ParentHolder` reports the immediate native holder, not a universal world-context classification. In this path it is a `RimWorld.Planet.Caravan`; the native `CaravanUtility.GetCaravan()` query also identifies that caravan. A null map alone cannot distinguish a caravan from every other off-map state. See [held references](held-references.md) for a different native ownership path.

## Observe departure and return

Call `StartTracking()` explicitly after native game initialization. The tested native caravan creation removes the pawn from its map, delivering `LeftContext` to the pawn reference and each exact-effect reference. Native map entry later delivers `EnteredContext`. Removing the now-empty caravan does not destroy its returned pawn or interrupt those subscriptions.

These observations concern direct map transitions. They do not promise notifications for world tile movement, caravan splitting or merging, or every movement of a pawn inside a holder. `TrackingCoverage.Maps` is not a caravan event stream. Pending flags retain change kinds, without counts or ordering.

Two references to B have separate pending observations even though they resolve the same effect. Acknowledging one does not clear the other. The witness remaining on the map receives neither the traveller's departure nor its return.

If the former map is removed while the character is away, distinguish `ContextRemoved` from target loss. See [keeping references when a map is removed](map-removal.md) for subscription history, world-only saves and a new map at the same world tile.

## Reload without replaying the journey

Native saving stores the travelling pawn and its effects in `WorldPawns`; the caravan saves a reference to that pawn. After entry, the pawn is saved on its map and the empty caravan is gone. The [audited saves](../compatibility/index.md#caravan-departure-and-return) contain one native pawn, not a separate copy owned by each consumer.

A fresh process restores new C# objects with the same native identities. Saved `NativeReference` instances resolve those objects; loading does not repeat the producer's additions or the caravan transition. Saved observations remain readable, with `TrackingInterrupted` added for previously active subscriptions. Revalidate the targets, decide the activity's policy and explicitly resume tracking when needed. See [reference persistence](persistence.md#save-an-exact-reference-separately).

## Exercise the complete boundary

Use a disposable profile with the framework and both composition examples. Keep versions and provider configuration fixed. Invoke mutations explicitly in developer mode and keep fresh callback counters in each process.

1. **Depart and save.** Add A/B to one native hand and A to an independent witness. Track the traveller, A, two references to B, the witness and its A. Use native `CaravanMaker.MakeCaravan` with the traveller and the map's world tile. Check exact targets, native holder, absent local maps, departure observations and the untouched witness. Save and exit.
2. **Load and return.** Start a fresh process and load that save directly. Before any producer action, check identities, metadata, health targets, saved observations and stopped subscriptions. Explicitly resume tracking, then use native `CaravanEnterMapUtility.Enter` to return to the original map. Check entry observations, removal of the empty caravan and independent acknowledgement by the two B observers. Save and exit again.
3. **Load the returned state.** In another fresh process, verify the same targets on the original map, no recreated caravan, no replayed additions or removals, and no automatic tracking restart.

The [recorded run](../compatibility/index.md#caravan-departure-and-return) checks inspection against native health and simulation randomness, audits both save graphs and restores the installed files. It exercises programmatic native transition entry points with the simulation paused. Formation UI, a travelling route, caravan simulation over time, splitting or merging, transport pods, third-party holders, changed provider configurations and activity resumption remain outside this proof.
