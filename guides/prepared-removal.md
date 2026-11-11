---
title: Prepare a provider removal
description: Withdraw an example's contribution while its provider is present, then verify the saved state without that provider.
---

# Prepare a provider removal

The player wants to disable the mod supplying temporary contribution B while keeping medical contribution A on the same hand. B's effect can be withdrawn while its definition and provider code are still available. Save that prepared state before changing the active mod list.

RimWorld already removes and saves health effects. RimWeave's existing removal API resolves one contribution on an explicit pawn and part, requests native removal and reports the observed result. The extension decides which effects may be withdrawn and what their removal means. No new API or automatic uninstall service is involved.

This procedure uses the two consumers in [framework commit 189137c](https://github.com/0n3m0r3/rimweave/commit/189137ca1655ba74a530c646492198de6d0ed1c6). It differs from [loading with a provider already missing](provider-removal.md): B is deliberately removed before its definition becomes unavailable. In the [recorded configuration](../compatibility/index.md#prepared-provider-removal), the prepared save loaded without B-related deserialization errors, and returning B did not recreate its effect. A retained its identity, metadata, target and severity; this does not mean every native field was frozen.

## Keep a recoverable original

Use the [composition setup](composition.md#install-two-separate-consumers) in a disposable colony, with A and B on the same first native hand slot. Keep the game build, framework, consumer versions and other mods fixed. The examples require a Debug build for their explicit developer actions.

Save and reload with both providers active. Before any new producer command, record each contribution's native ID, owner-qualified identity, origin, exact target and count. Preserve this verified AB save as an untouched original, with a file hash. Use a separate copy for preparation; a failed or partial removal is not a reason to overwrite the original.

## Withdraw B before disabling its mod

1. With B still active, run **Composition B: remove on first hand** on the recorded pawn. The developer action requires developer mode and an explicit selection. Expect `lookup=Found; removal=Removed`.
2. Inspect the actual state: B must be absent and A must retain its identity, declarations and target. Their shared exclusive claim should now resolve uniquely to A. Repeat B's removal: expect `lookup=NotPresent; removal=not requested`.
3. Save under a new name, then reload that prepared save with both providers still active. Inspect before any add command. A should remain intact and B absent. Inspecting the saved XML should also confirm that B's effect and its metadata are no longer serialized.
4. Disable **RimWeave Example Peer** (`rimweave.example.peer`), restart the game and load a copy of the prepared save. Verify that B's package, assembly and `RimWeave_CompositionTemporary` definition are absent. A should remain intact, with no deserialization error caused by the old B effect. Record any mod-list mismatch warning separately.
5. Enable the same version of B, restart and load another copy of the prepared save. Inspect before calling a producer: A should remain intact and B absent. Enabling the example alone must not recreate its withdrawn effect.

Check the original and input-copy hashes afterward, and restore the intended active-mod list. The original AB save and the prepared A-only save have different purposes: reloading the original with B present restores its previously saved effect; returning B to the prepared save should leave the deliberate withdrawal in place.

## Stop when the removal is not established

A successful lookup alone is insufficient. `StillPresent`, an ambiguous or unreadable lookup, an exception, or an unexpected change to A prevents this procedure from being accepted. Inspect the observed state and retain the original. Native callbacks can have partial consequences; RimWeave does not undo them. See [removal outcomes](removal.md#what-the-result-does-and-does-not-describe).

The verified fixture contains one known B marker on one known pawn and part. Removing that marker is not a search for every object, reference or effect owned by a mod. These examples have no automatic producer that could reapply B; another provider must account for its own producers and persistent references. This procedure does not establish safe removal of arbitrary addons, missing custom classes, irreversible gameplay effects or every mod combination. An unknown origin never authorizes cleanup.
