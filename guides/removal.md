---
title: Remove one effect
description: Remove the intended health effect, handle an already absent effect, and leave other contributions out of the request.
---

# Remove one effect

The player takes off the reinforced glove. Its mod needs to remove the glove effect while leaving the surgical effect on the same hand alone.

There is a second case to handle: the game or another mod may already have removed the glove effect. RimWorld's removal method can still notify removal handlers for an absent instance. Those handlers can do real work, such as clearing a restriction or notifying another system. Repeating them is not merely a logging problem.

RimWeave checks whether the requested effect belongs to the pawn and is still attached before calling native removal. This protection applies to calls through RimWeave. It does not patch other mods' direct calls to the game.

## When you already have the effect object

Pass the exact instance to <xref:RimWeave.Health.HediffOperations>:

[!code-csharp[Remove a native instance](../examples/Recipes/Health.cs#remove-instance)]

This method also accepts ordinary `Hediff` objects without RimWeave metadata. It uses the object you passed, not a search for similar effects.

| Status | What it means | Did this call invoke native removal? |
| --- | --- | --- |
| `Removed` | The effect is absent after native removal returned. | Yes |
| `NotPresent` | The effect was already absent. | No |
| `PawnMismatch` | The effect refers to another pawn. | No |
| `StillPresent` | Native removal returned but the effect is still attached. | Yes; callbacks may already have run |

If the first call removes the effect, another call with the same absent instance returns `NotPresent` without repeating native removal. Reattaching that instance changes the situation: there is no permanent “already removed” flag.

## When you know its identity and target

If Field Gear knows its effect's identity and the left hand rather than retaining the effect object, it can use <xref:RimWeave.Health.ContributionOperations>:

[!code-csharp[Remove by identity](../examples/Recipes/Health.cs#remove-identity)]

The operation first looks for that identity on the chosen pawn and part. Only a unique, readable match reaches the exact-instance removal check.

If the lookup returns `NotPresent`, `Ambiguous` or `InvalidMetadata`, `Removal` is null and no native removal is requested. `InvalidMetadata` means saved information in the selected scope could not be read; another apparently valid match is not enough to establish uniqueness.

When `Removal` is present, inspect its status. “A match was found” does not mean “the effect was removed.” A separate exclusive-responsibility conflict does not prevent removal of a uniquely identified contribution; withdrawing that contribution may be the mod's intended response.

## What the result does and does not describe

The result describes whether that particular effect is attached after a normal return. The game and other mods may run additional code during their callbacks. RimWeave does not undo those callbacks or promise to roll back partial changes if native code throws an exception.

Call on the simulation thread with initialized native objects. Null arguments throw `ArgumentNullException`. The recorded part is the part observed before removal callbacks, not a permanent identity for an organ across replacements.

The operation does not log automatically. Your mod decides whether an already absent effect is expected cleanup or an error worth reporting.

## Check it in the game

The [developer example](debugging.md#verify-repeated-removal) retains one marker instance and removes it twice. Two observers should each run once for the first removal and zero times for the second. Also check that a marker on the other hand remains.

That recorded scenario exercises exact-instance removal. The identity-based entry point has automated lookup and guard checks; its successful native removal needs a separate in-game scenario.
