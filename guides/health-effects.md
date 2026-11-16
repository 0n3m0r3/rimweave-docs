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

The same targeting contract applies to native animal bodies. See [targeting one non-human part](target-repeated-parts.md) for four matching legs, a hoof and a second animal.

## Use a health effect that carries RimWeave information

Configure your mod's `HediffDef` to use <xref:RimWeave.Health.ContributionHediff>, or a subclass of it. This is a native health effect with the metadata described in the earlier pages. The effect remains in the game's health list.

An existing `ContributionHediff` refuses native merging so cooperating instances can keep their own identities and lifetimes. An ordinary health effect already on the pawn can still absorb an incoming contribution through its own native merge behavior. `ContributionHediff` saves its metadata with the effect; it does not change unrelated `Hediff` classes or decide which effects your mod is allowed to add.

The following recipe assumes your mod already has that definition, an initialized pawn and an explicit target: a part from that pawn's body, or `null` for the whole body. It is not a complete glove mod: deciding when a glove should add an effect is still your mod's work.

Identity and an optional exclusive claim can also be [declared in XML](xml-declarations.md). The C# recipe below works without that declaration; if both are used, its identity must match the XML identity.

## Create, describe, then attach

[!code-csharp[Create and attach](../examples/Recipes/Health.cs#attach)]

`HediffMaker.MakeHediff` asks the game's factory to create the effect described by the definition. The type check catches a definition configured with the wrong class. The two metadata calls describe the new effect. Finally, <xref:RimWeave.Health.ContributionOperations> validates the prepared target and, when accepted, calls native `pawn.health.AddHediff`. It returns the observed outcome after that complete native call, including merging and callbacks.

`Add` is the point where this recipe requests attachment through the native health tracker. Your mod must first decide whether this effect is allowed and whether another instance should coexist with it. The recipe supplies none of those gameplay decisions.

Creating an effect with `HediffMaker.MakeHediff` can consume native simulation randomness before the adapter receives it. A later refused attachment does not undo that preparation. Passive inspection uses queries and snapshots, not effect construction.

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

For a character in a casket, distinguish direct map presence from its native holder and held map; see [following a character inside a container](held-references.md).

For a character leaving in a caravan, see [following a character through a caravan](caravan-references.md). The verified path preserves exact targets through world storage and a fresh-process load, with no local map invented while away.

Native death can set both `Dead` and `Destroyed`. A dead pawn that has not been discarded can remain tracked; a destroyed living pawn or detached effect cannot. See [keeping references through death and resurrection](death-and-resurrection.md) for surviving effects, native cleanup and the save boundary.

Read the current snapshot before acting. Dispose the reference when observation is no longer needed; this ends its subscription while retaining readable identity and pending observations. Reattaching the same effect does not restart a stopped subscription automatically. Tracking adds no health effect, reservation or rule about which activity can continue. See [saving an exact reference](persistence.md#save-an-exact-reference-separately) for the load boundary.

For a concrete anatomical transition, see [a lost and restored hand](hand-restoration.md). Native cleanup can remove both independent contributions on that slot; restoring the slot does not reapply them or redirect their old exact references. The [native prosthetic-arm scenario](native-prosthesis.md) distinguishes an available artificial arm from its missing natural hand; a request for the hand never falls back to the arm.

## Release observers when work ends

Suppose a mod finishes a batch of activities that each retained a reference. Call `StopTracking()` or `Dispose()` when an activity no longer needs notifications. Each call ends only that subscription and keeps its pending observations and historical identity readable. Keeping the `NativeReference` object also keeps its native target references; stopping tracking does not erase those fields or ask RimWorld to discard a pawn.

The subscription store uses weak keys. If the consumer drops the entire reference, that subscription alone does not keep the observer or its target alive. Collection timing belongs to the runtime, and native world owners can still retain the pawn. Use explicit disposal for predictable subscription release; do not force garbage collection during gameplay.

After the last observer is disposed or collected, the next notification can still scan the old table once. When it finds no live registrations, RimWeave releases that table. Later empty notifications avoid the enumeration and its managed allocation, until a consumer explicitly starts tracking again. No periodic world scan or live-observer counter is introduced. Map removal uses the same empty-table reconciliation.

Active delivery walks the weak registrations directly instead of copying all observers into an array. If removing an effect stops several subscriptions during delivery, each retained observer of that exact effect still receives its own detachment; other effects and pawns keep their subscriptions. Delivery invokes no extension callback. Keep all reference access on the simulation thread.

The traversal still visits the subscription population in the game, including observers whose targets do not match the event. Removing the temporary array reduces managed allocation; it does not make the work independent of observer count. The [measured active-delivery workload](../compatibility/index.md#active-reference-delivery) compares 0 to 10,000 retained observers, disposal, collection and restart. The [earlier empty-session measurement](../compatibility/index.md#reference-tracking-cost-and-lifetime) explains why the first notification after cleanup still reconciles the old table. These timings describe one synchronous handler on the recorded machine, not a colony tick-rate guarantee or an approved global performance budget.

## Capture the observed body part

The glove mod remembers an effect on the left hand. Later, its own integration explicitly removes that effect and attaches the same instance to the right hand. A reference to the effect still names the same object; it does not reserve the original hand. To compare observations, use <xref:RimWeave.References.NativeReferenceSnapshot.EffectPart>.

`Capture()` copies the current `Hediff.Part` reference into `EffectPart`. An earlier snapshot keeps its observed part even if the effect's `Part` field is reassigned later. Reading `oldSnapshot.Effect.Part` follows a mutable native object and can instead give the new part. The part record itself remains a native object, not a frozen copy of the body.

Always pair the observed part with `snapshot.Pawn`: pawns using the same `BodyDef` share part records. Two hands with the same part definition remain distinct occurrences. A captured slot is neither an individual organ identity nor proof that the anatomy is present or usable.

[!code-csharp[Observe attachment to an explicit target](../examples/Recipes/Health.cs#observe-part)]

This recipe checks the exact referenced effect's observed attachment, pawn and part. It provides no reservation, gameplay permission or guarantee of continued attachment. Explicit `null` means whole body only after a resolved effect has been established. `EffectPart` is also null for a pawn-only reference or an unresolved, loading, mismatched or foreign-game reference; inspect `Resolution` and `Effect` before interpreting it.

A detached but still resolved effect can keep its declared part: `EffectPart` does not replace `EffectAttached`. Neither reading the property nor taking another snapshot retargets anything, starts tracking, or creates a part-change notification. Empty pending flags do not establish that the part stayed unchanged. If removal callbacks ran during a retarget, their existing detachment notifications remain relevant even when the final instance is attached again.

RimWorld saves the effect's current part. RimWeave stores no extra part in its reference and does not serialize snapshots. After loading, take a fresh snapshot of the resolved exact effect; no earlier observed part is reconstructed. The [recorded body-part snapshot scenario](../compatibility/index.md#observed-body-part-snapshots) verifies this distinction with two hand slots, a same-identity witness and a fresh-process load. It does not provide a general anatomical migration or retargeting API.

## Keep the information through a save

`ContributionHediff` participates in the game's saving process. If a subclass overrides `ExposeData`, it must call the base implementation in every save/load phase. Read the [save/load guide](persistence.md) for what is restored and what happens if the information cannot be read.

The recipes are compiled against the documented framework and game references. The [recorded addition checks](../compatibility/index.md#targeted-addition) cover a controlled native scenario. Your mod's complete behavior still needs its own integration test.
