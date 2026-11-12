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

A definition for “hand” and a particular character's left hand are different things. Both hands can share the same kind of part while remaining distinct targets. Pawns with the same `BodyDef` also share its `BodyPartRecord` objects: target the pawn and part together. A part record alone is not an individual organ identity or proof that it came from one particular pawn.

## Use a health effect that carries RimWeave information

Configure your mod's `HediffDef` to use <xref:RimWeave.Health.ContributionHediff>, or a subclass of it. This is a native health effect with the metadata described in the earlier pages. The effect remains in the game's health list.

An existing `ContributionHediff` refuses native merging so cooperating instances can keep their own identities and lifetimes. An ordinary health effect already on the pawn can still absorb an incoming contribution through its own native merge behavior. `ContributionHediff` saves its metadata with the effect; it does not change unrelated `Hediff` classes or decide which effects your mod is allowed to add.

The following recipe assumes your mod already has that definition, an initialized pawn and an explicit target: a part from that pawn's body, or `null` for the whole body. It is not a complete glove mod: deciding when a glove should add an effect is still your mod's work.

Identity and an optional exclusive claim can also be [declared in XML](xml-declarations.md). The C# recipe below works without that declaration; if both are used, its identity must match the XML identity.

## Create, describe, then attach

[!code-csharp[Create and attach](../examples/Recipes/Health.cs#attach)]

`HediffMaker.MakeHediff` asks the game's factory to create the effect described by the definition. The type check catches a definition configured with the wrong class. The two metadata calls describe the new effect. Finally, <xref:RimWeave.Health.ContributionOperations> validates the prepared target and, when accepted, calls native `pawn.health.AddHediff`. It returns the observed outcome after that complete native call, including merging and callbacks.

`Add` is the point where this recipe requests attachment through the native health tracker. Your mod must first decide whether this effect is allowed and whether another instance should coexist with it. The recipe supplies none of those gameplay decisions.

Use native health operations on the game's simulation thread. Normal API calls from a mod do not require developer mode. The separate developer example requires developer mode because its commands deliberately modify a test colony.

## Observe the addition

The glove mod needs to know whether its effect remains on the left hand while the surgical contribution stays independent. The recipe returns <xref:RimWeave.Health.ContributionAdditionResult>, not an effect assumed to be attached. Read `result.Status` before treating `result.Hediff` as an attached effect. `Added` confirms that a new native call ended with the exact instance on the requested pawn and part; `AlreadyPresent` means it was already there and no new native call ran.

Prepare `effect` with `HediffMaker.MakeHediff(definition, pawn, part)` using the same pawn and exact part passed to `Add`. The part argument is mandatory: explicitly pass `null` for a whole-body request. A definition with `defaultInstallPart` is refused for that request because the native operation would select a part. The adapter does not silently retarget a prepared effect or select another hand.

The <xref:RimWeave.Health.ContributionAdditionStatus> values describe these outcomes. Only `Added`, `NotAttached` and `AttachmentChanged` follow a new native addition; the other results return without calling it.

| Status | Observation or refusal |
| --- | --- |
| `Added` | The exact instance is attached to the requested pawn and part after the native call. |
| `NotAttached` | The exact instance is absent from the requested pawn after the native call. |
| `AttachmentChanged` | The instance is in that pawn's health list, but its owner or part field changed. |
| `AlreadyPresent` | The same instance was already attached to the requested pawn and part. |
| `AlreadyAdding` | An addition of this exact instance is already in progress. |
| `PawnMismatch` | The prepared effect names another pawn or no pawn. |
| `PartMismatch` | The prepared effect's part differs from the explicit target. |
| `InvalidPart` | The part is not an occurrence in this pawn's `BodyDef`. |
| `MissingPart` | The native health tracker excludes this part as missing. |
| `IncompatibleTarget` | A whole-body request would select the definition's default part. |
| `InvalidDefinition` | The prepared effect has no definition. |

`NotAttached` does not identify a cause: an ordinary effect may absorb the incoming instance, or a callback may remove it. It does not mean that nothing happened. `ObservedPawn` and `ObservedPart` capture the instance's fields at return; those fields alone do not prove membership in a health list. The status reports the observed outcome, not a reservation or a promise of continued attachment.

The repetition guard concerns the **same object instance**. A nested request for it returns `AlreadyAdding` without a second native call. After an operation ends and the effect is detached, a later attempt remains possible. Other instances remain independent. Equal contribution identities or exclusive claims do not block addition automatically. They remain inputs to the existing lookup and conflict diagnostics; the extension decides whether coexistence is allowed.

Call on the simulation thread with an initialized pawn and health tracker. Null pawn or effect arguments throw `ArgumentNullException`. Native exceptions propagate and can follow partial changes; the temporary guard is released, without rollback. Native callbacks and legitimate simulation random draws retain their behavior. This API adds no permission rule, observer reaction or transformation engine.

## Find the effect on that hand

[!code-csharp[Resolve one target](../examples/Recipes/Health.cs#query)]

`ContributionQueries.Resolve` reads `ContributionHediff` instances already attached to that pawn and that exact part. It does not search ordinary health effects for guessed ownership.

The answer is `NotPresent`, `Found`, `Ambiguous` or `InvalidMetadata`; their meanings are explained in [When do mods conflict?](../concepts/cooperation.md#read-the-answer-before-making-a-decision). A missing part argument means whole-body effects only, not every body part.

Finding one effect does not keep it alive or reserve it. Use the [removal operation](removal.md) when you are ready to remove it, so presence is checked again.

## Keep a reference when the character moves

Reference tracking is included in the documented framework revision. A [developer verification procedure](debugging.md#verify-native-references-across-a-reload) exercises independent observations, exact-target removal and a real save/reload. Its [recorded in-game run](../compatibility/index.md#in-game-reference-scenario) covers that specific scenario using the published example; it does not establish arbitrary lifecycle or provider compatibility.

Suppose an activity remembers the glove's effect, then the character leaves the map and returns before the activity checks again. The effect may still exist, but its current location alone cannot reveal that interruption. The activity decides whether to stop or resume; RimWeave makes the observed changes available.

<xref:RimWeave.References.NativeReference> names one exact `Pawn` or `Hediff`. Construct a reference to a `Pawn` or `Hediff` only while `Current.Game` is available; otherwise construction throws `InvalidOperationException`. The parameterless constructor remains available for native loading. `Capture()` reads its current state: resolution, direct map presence, death, destruction, discard and exact health-list attachment. A dead character can remain resolved for history; an effect can remain resolved as an object after being detached. Native `Destroyed` is an observed state, not proof of irreversible disappearance: native resurrection can change it. `Unresolved` does not establish permanent disappearance. No state here proves reachability, reservation or permission to act. An old handle also cannot be reused in another game merely because native IDs happen to match.

Call `StartTracking()` on the simulation thread, from `LoadedGame`, `StartedNewGame` or later. Inspect `TrackingCoverage` before depending on notifications:

- Pawn and ordinary health-effect references receive direct native map entry, departure and context-removal events. This does not track every location change of a character carried inside another object.
- An exact `ContributionHediff` also forwards its native death, resurrection, discard and removal callbacks. Subclasses must preserve the base lifecycle callbacks to retain that coverage. Some native removals bypass these callbacks, including effects removed during resurrection; revalidation detects their detachment afterward.
- Arbitrary off-map destruction has no immediate notification guarantee. `Capture()` and `TakeChanges()` revalidate the target and stop obsolete subscriptions when they observe destruction or detachment.

`PendingChanges` retains observed change kinds without clearing them. `TakeChanges()` acknowledges only this consumer's observations. Departure and return both remain visible, even when the final state matches the initial state; repeated kinds are coalesced, without counts or ordering. Native callbacks only record these facts. They do not run an activity's reaction inside the game's health or map processing.

Read the current snapshot before acting. Dispose the reference when observation is no longer needed; this ends its subscription while retaining readable identity and pending observations. Reattaching the same effect does not restart a stopped subscription automatically. Tracking adds no health effect, reservation or rule about which activity can continue. See [saving an exact reference](persistence.md#save-an-exact-reference-separately) for the load boundary.

For a concrete anatomical transition, see [a lost and restored hand](hand-restoration.md). Native cleanup can remove both independent contributions on that slot; restoring the slot does not reapply them or redirect their old exact references.

## Keep the information through a save

`ContributionHediff` participates in the game's saving process. If a subclass overrides `ExposeData`, it must call the base implementation in every save/load phase. Read the [save/load guide](persistence.md) for what is restored and what happens if the information cannot be read.

The recipes are compiled against the documented framework and game references. The [recorded addition checks](../compatibility/index.md#targeted-addition) cover a controlled native scenario. Your mod's complete behavior still needs its own integration test.
