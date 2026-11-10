---
title: Check a missing provider
description: Compare an untouched save with a copy saved while one contribution provider is absent.
---

# Check a missing provider

The player removes the mod supplying contribution B, then enables it again. What returns depends on which save is loaded. In the [recorded configuration](../compatibility/index.md#provider-removal-and-return), restoring B and loading the untouched original recovered A and B. Loading a copy saved while B was absent preserved A, but did not recover B. The loads without B emitted native errors; this is not a clean-uninstall guarantee.

RimWorld loads the saved health objects and resolves their definitions. RimWeave restores metadata on objects that can be loaded; it does not supply a missing definition, reconstruct a lost effect or decide which unknown data to delete. The provider owns its gameplay consequences and any supported removal or migration procedure.

This procedure uses the two consumers published in [framework commit 189137c](https://github.com/0n3m0r3/rimweave/commit/189137ca1655ba74a530c646492198de6d0ed1c6), with the unchanged [documented API](../compatibility/versions.md). Follow the [composition setup](composition.md#install-two-separate-consumers) for the separate packages and explicit commands. [Support and evidence](../compatibility/index.md#provider-removal-and-return) records the outcomes separately from the earlier composition checks.

## Fix the configuration and preserve the original

Use a disposable colony. Keep the same game build, framework, consumer versions, other mods and any verification instrumentation throughout. Only B's active-package state changes between the comparison runs. Restart the game after each mod-list change.

B is **RimWeave Example Peer**, package `rimweave.example.peer`. It supplies the definition `RimWeave_CompositionTemporary`. Its effect class is `RimWeave.Health.ContributionHediff`, supplied by the framework, which remains installed. A successful result here cannot establish recovery when a provider's own C# class is unavailable.

1. With A and B active, explicitly add their contributions to the same first native hand. Record the pawn, native effect IDs, definitions, owner-qualified identities, origins, exclusive claim, exact part and counts. The [composition procedure](composition.md#add-reload-then-withdraw-b) identifies those commands and observations.
2. Save, then reload with the same configuration. Inspect before another producer command and confirm that both recorded contributions survived. If this control fails, stop: there is no verified source for the absence comparison.
3. Preserve that save as an untouched master with a recorded file hash. Use distinct working copies for every branch below. Never overwrite the master with a save produced during the experiment; confirm its hash at the end.

Inspect the native health list and declarations before calling either consumer's add or remove operation. Record load errors and unresolved or missing definitions as well as successful lookups. A readable metadata record does not prove that the rest of its native effect is usable.

## Compare the three paths

| Path | Configuration and input | Observation before any producer command |
| --- | --- | --- |
| B absent | A and framework active; a fresh copy of the original | Did loading complete? Is A intact? Are B's native object, definition and metadata present, absent or unreadable? |
| B restored, original | Restore the same B version; another fresh copy of the original | Compare both contributions with the control: native IDs, declarations, targets and counts. |
| B restored, derived save | Restore the same B version; a new save created while B was absent | Compare with both the original and the state observed without B. Distinguish retained information from information lost before this save. |

First run the **B-absent** path without saving. Confirm that B's package, assembly and definition are absent from the running configuration. Keep the framework and A present. If the load fails, record the failing phase and diagnostics; failure is a result, not permission to edit the save or invent a recovery.

For **B restored, original**, restart with B enabled and load a separate copy of the untouched master. Do not issue an add command to make a missing contribution appear. Matching saved identities, declarations, targets and counts establish the observed restored state; they are not a count of every callback executed by the game.

To create the **derived save**, return to a fresh original copy with B absent. If loading completes, inspect first and save under a different name. Restore B, restart and load that derived file. If saving or reloading fails, record that stage as unsupported in this configuration. Never substitute the original-file result for this branch.

## Interpret the result without inventing history

The original and the derived file are independent recovery candidates. Returning to the original with its original dependencies is not a rollback of changes made in a running game. Re-enabling B does not by itself promise to reconstruct data missing from the derived file.

Keep three findings separate: what the file contains, what native loading retains and what RimWeave queries can read. `NotPresent`, unreadable metadata and an incomplete or failed load are different results. An absent or `Unknown` origin is not an instruction to delete an effect; absent historical data does not establish whether an earlier gameplay consequence occurred.

This experiment removes B from the active mod configuration. It does not exercise B's explicit contribution-removal command, disable a gameplay feature through provider settings or migrate arbitrary third-party data. Report an unsupported path as such. Do not generalize these technical markers to irreversible gameplay effects, missing provider classes or every mod combination. Keep the master and its matching configuration available, and restore the intended mod list when finished.
