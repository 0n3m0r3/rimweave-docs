---
title: Add information to a health effect
description: Connect the contribution description to the effect that RimWorld actually stores on a character.
---

# Add information to a health effect

The [first C# example](../getting-started/first-contribution.md) only created an object with descriptive information. A real glove effect also needs to exist in the character's health state. This page connects the two.

## The game types used in this example

RimWorld's names are not always obvious from outside its modding API:

| Game type | Meaning here |
| --- | --- |
| `Pawn` | The character affected. Pawns include humans, animals and other pawn kinds. |
| `Hediff` | One health effect attached to a pawn, such as an injury, condition or implant effect. |
| `HediffDef` | The definition describing a kind of health effect, including which C# class implements it. |
| `BodyPartRecord` | One part in this pawn's body, such as this particular left hand. |

A definition for “hand” and a particular character's left hand are different things. Both hands can share the same kind of part while remaining distinct targets.

## Use a health effect that carries RimWeave information

Configure your mod's `HediffDef` to use <xref:RimWeave.Health.ContributionHediff>, or a subclass of it. This is a native health effect with the metadata described in the earlier pages. The effect remains in the game's health list.

The class refuses native merging so two instances can keep their own identities and lifetimes. It also saves its metadata with the effect. It does not change the behavior of unrelated `Hediff` classes or automatically decide which effects your mod is allowed to add.

The following recipe assumes your mod already has that definition, the pawn and a valid part from that pawn's body. It is not a complete glove mod: deciding when a glove should add an effect is still your mod's work.

## Create, describe, then attach

[!code-csharp[Create and attach](../examples/Recipes/Health.cs#attach)]

`HediffMaker.MakeHediff` asks the game's factory to create the effect described by the definition. The type check catches a definition configured with the wrong class. The two metadata calls describe the new effect. Finally, `AddHediff` attaches it through the game's normal health operation.

That last call is the point where game state changes. Your mod must first decide whether the target is available, whether this effect is allowed and whether another instance should coexist with it. The recipe supplies none of those gameplay decisions.

Use native health operations on the game's simulation thread. Normal API calls from a mod do not require developer mode. The separate developer example requires developer mode because its commands deliberately modify a test colony.

## Find the effect on that hand

[!code-csharp[Resolve one target](../examples/Recipes/Health.cs#query)]

`ContributionQueries.Resolve` reads `ContributionHediff` instances already attached to that pawn and that exact part. It does not search ordinary health effects for guessed ownership.

The answer is `NotPresent`, `Found`, `Ambiguous` or `InvalidMetadata`; their meanings are explained in [When do mods conflict?](../concepts/cooperation.md#read-the-answer-before-making-a-decision). A missing part argument means whole-body effects only, not every body part.

Finding one effect does not keep it alive or reserve it. Use the [removal operation](removal.md) when you are ready to remove it, so presence is checked again.

## Keep a reference when the character moves

Reference tracking is included in the documented framework revision. Its native integration still needs a full-colony check.

Suppose an activity remembers the glove's effect, then the character leaves the map and returns before the activity checks again. The effect may still exist, but its current location alone cannot reveal that interruption. The activity decides whether to stop or resume; RimWeave makes the observed changes available.

<xref:RimWeave.References.NativeReference> names one exact `Pawn` or `Hediff`. Construct a reference to a `Pawn` or `Hediff` only while `Current.Game` is available; otherwise construction throws `InvalidOperationException`. The parameterless constructor remains available for native loading. `Capture()` reads its current state: resolution, direct map presence, death, destruction, discard and exact health-list attachment. A dead character can remain resolved for history; an effect can remain resolved as an object after being detached. Native `Destroyed` is an observed state, not proof of irreversible disappearance: native resurrection can change it. `Unresolved` does not establish permanent disappearance. No state here proves reachability, reservation or permission to act. An old handle also cannot be reused in another game merely because native IDs happen to match.

Call `StartTracking()` on the simulation thread, from `LoadedGame`, `StartedNewGame` or later. Inspect `TrackingCoverage` before depending on notifications:

- Pawn and ordinary health-effect references receive direct native map entry, departure and context-removal events. This does not track every location change of a character carried inside another object.
- An exact `ContributionHediff` also forwards its native death, resurrection, discard and removal callbacks. Subclasses must preserve the base lifecycle callbacks to retain that coverage. Some native removals bypass these callbacks, including effects removed during resurrection; revalidation detects their detachment afterward.
- Arbitrary off-map destruction has no immediate notification guarantee. `Capture()` and `TakeChanges()` revalidate the target and stop obsolete subscriptions when they observe destruction or detachment.

`PendingChanges` retains observed change kinds without clearing them. `TakeChanges()` acknowledges only this consumer's observations. Departure and return both remain visible, even when the final state matches the initial state; repeated kinds are coalesced, without counts or ordering. Native callbacks only record these facts. They do not run an activity's reaction inside the game's health or map processing.

Read the current snapshot before acting. Dispose the reference when observation is no longer needed; this ends its subscription while retaining readable identity and pending observations. Reattaching the same effect does not restart a stopped subscription automatically. Tracking adds no health effect, reservation or rule about which activity can continue. See [saving an exact reference](persistence.md#save-an-exact-reference-separately) for the load boundary.

## Keep the information through a save

`ContributionHediff` participates in the game's saving process. If a subclass overrides `ExposeData`, it must call the base implementation in every save/load phase. Read the [save/load guide](persistence.md) for what is restored and what happens if the information cannot be read.

These recipes are compiled against the framework and game references. The automated suite checks targeting, merging refusal and removal guards. Applying your effect and observing its full behavior in a colony still needs an integration test.
