---
title: Distinguish a missing corpse from a discarded pawn
description: Keep corpse destruction, native world retention and final pawn discard separate when following exact references.
---

# Distinguish a missing corpse from a discarded pawn

[!INCLUDE [Documented version](../includes/version.md)]

A history mod still refers to a dead character after the corpse disappears. The game may keep that character in its world data, then discard it later. Losing the body, losing native ownership and losing a reference after loading are different observations.

RimWorld owns the corpse, `WorldPawns` and cleanup. RimWeave reads those native targets and manages explicit subscriptions. The consumer decides whether to retain its own historical facts and whether a target is usable. Holding a `NativeReference` does not pin the pawn in the native world store.

## Read ownership and resolution separately

In the [verified native path](../compatibility/index.md#corpse-destruction-and-native-discard), destroying the corpse leaves the dead pawn in `WorldPawns`. Its original health effects remain attached. `Map`, `MapHeld` and `ParentHolder` are null, and `Spawned` is false. This absence of a local context does not mean the pawn has been discarded.

| Native state in this scenario | Reference resolution | Tracking |
| --- | --- | --- |
| Dead pawn retained by the world after corpse destruction | `Resolved`, with `Discarded = false` | Can continue or start explicitly |
| Native cleanup has discarded the pawn; existing managed objects are still referenced | `Resolved`, with `Discarded = true` | Stops; restarting is refused |
| A later process loads a save that contains no discarded target | `Unresolved`; diagnostic identities remain | Cannot restart |

`Resolved` identifies the exact object currently available to the handle. It is not permission to use it, a native retention claim or a promise that it can be saved. A snapshot taken after failed resolution has no target from which to read current life flags. Saved change observations and diagnostic identities remain separate from that current state.

## Know when discard is observed

Destroying only the corpse does not produce `Discarded` or stop tracking. Native corpse destruction is not a direct pawn map transition either; a snapshot can change holder context without adding a supported map event.

For an exact cooperating `ContributionHediff`, the inspected native discard path reaches its health callback after the pawn becomes discarded. Its subscribed references record `Discarded` and `TrackingInterrupted` immediately. A pawn-only reference does not borrow that health callback. Its next `Capture()`, `IsTracking` or `TakeChanges()` observes the discarded state and ends its subscription.

Two references to the same effect retain independent pending observations. Acknowledging one leaves the other intact. References to another pawn remain independent even if its contribution has the same declared identity.

## Save historical identity without promising a target

A pawn retained in `WorldPawns` can be restored through native deep serialization, along with its health effects. Loading saved references restores their pending observations but leaves tracking stopped until the consumer explicitly resumes it.

Once native cleanup discards the pawn, the tested save no longer contains that pawn or its effects. Native Scribe omits discarded pawn links with warnings; references to the unsaved effects also produce save/load warnings. RimWeave preserves the diagnostic identities and recorded changes. It neither recreates the objects nor substitutes another pawn's matching contribution. See [reference persistence](persistence.md#save-an-exact-reference-separately).

## Exercise the cleanup boundary

Use a disposable profile, the framework and both composition examples. Keep the game version and mod configuration fixed. Run mutations explicitly in developer mode; collect fresh callback counters and immutable evidence in each process.

1. **Destroy the corpse and save.** Add A/B to a character and A to an independent witness. Track the first pawn, A, two references to B, the witness pawn and its A. Invoke native death, acknowledge those observations, then destroy the corpse. Verify that the original pawn is still in `WorldPawns`, the six subscriptions remain active, no discard was invented and the witness is unchanged. Save and exit.
2. **Load and request native discard.** In a new process, verify all native identities and metadata before any producer action. Explicitly resume the six subscriptions, then invoke the native `RemoveAndDiscardPawnViaGC` entry point for the dead world pawn. Check actual discard, its removal from `WorldPawns`, the callback/inspection distinction, restart refusals and the independent witness. Save and exit again.
3. **Load the result.** In a third process, verify four unresolved references to the discarded targets and two valid witness references. Check saved observations, diagnostic identities, no replayed contributions and no implicit tracking restart. Only the valid witness references can explicitly resume.

The [recorded run](../compatibility/index.md#corpse-destruction-and-native-discard) also audits both native save graphs and restores the installed test files. It explicitly invokes the cleanup entry point: it does not test which pawns the automatic garbage collector selects or when it selects them. Natural decay, combat, arbitrary off-map destruction, third-party cleanup, configuration changes and activity resumption remain outside this proof.
