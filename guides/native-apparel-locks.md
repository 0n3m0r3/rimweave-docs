---
title: Understand native apparel locks
description: Read the native lock flag without confusing it with independently owned extension locks.
---

# Understand native apparel locks

Two mods both want to keep the same garment locked. If each calls the native
`Lock(item)` and one later calls `Unlock(item)`, the native tracker does not know
which mod's request ended. Both calls addressed one shared flag. A consumer must
understand that boundary before treating native unlock as removal of its own claim.

## Read the native flag

For the selected pawn's initialized apparel tracker, on the simulation thread:

[!code-csharp[Read the native apparel lock](../examples/Recipes/Equipment.cs#native-apparel-lock)]

The result says whether this tracker lists that exact apparel object as locked.
It does not name the caller that locked it, count outstanding requests or establish
that it is currently worn. Check [native wearing and coverage](native-apparel.md)
separately. A lock flag alone declares neither an actor's permission to remove the
item nor a physical inability to perform unrelated actions.

## Keep independent requests independent

The inspected native behavior is:

| Calls on one tracker | Result |
| --- | --- |
| `Lock(item)` twice | One native lock entry, with no caller identity. |
| `Unlock(item)` after those calls | That native lock entry is removed. |
| Unlock one item while another is locked | The other object's entry remains. |

Consequently, clearing this flag is not a safe implementation of “release only my
extension's lock” when other owners may depend on it. A provider keeps its own lock
identity, target, state and release policy in its authoritative data. Cooperative
providers need an explicit agreement about who controls any shared native flag.
An unknown native caller remains unknown; absence of a known RimWeave contribution
does not prove that clearing the flag is allowed.

The [shared contribution contracts](../concepts/contributions.md) can describe
attribution and report competing claims in a caller-selected scope. They do not
intercept native `Lock`/`Unlock`, coordinate arbitrary mods, supply keys or authorize
release. No such coordinator or equipment-state registry is added by this guide.
Do not infer a cleanup or provider-removal policy from the native flag.

## Verified boundary

Three regression cases call the installed 1.7.5011 rev24 lock-list methods on
isolated native trackers: repeated requests and one unlock, two items with the
same definition, and passive reads of a locked item that is not worn. They preserve
unrelated entries and random state during reads. The read recipe is compiled.
The [retrospective integration audit](../compatibility/index.md#retrospective-integration-audit)
also called the native lock methods on actual worn garments. Repeated locking and
unlocking one garment preserved the other item's flag; a fresh-process load
restored the exact remaining lock and apparel holders. Equipment jobs, keys, actual
removal prevention and third-party locks remain unverified. Extensions own those
integrations and their consequences; RimWeave installs no lock automatically.
