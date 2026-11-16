---
title: Target one part on a non-human body
description: Choose an exact native occurrence without confusing matching limbs, descendants or another animal.
---

# Target one part on a non-human body

A muffalo has four legs. One mod applies a medical marker to its rear left leg; another adds a temporary marker there. Removing either contribution must leave the other marker and the animal's three other legs alone. A second muffalo must keep its own effects too.

RimWorld already represents these occurrences and saves localized health effects. RimWeave's existing health adapter accepts an exact pawn and native part; it does not need a new animal anatomy model. Your mod decides which limb to select and whether an effect should be reapplied after restoration.

## Select a record, not a definition or label

`BodyPartDef` describes a kind of part. `BodyPartRecord` names one occurrence in a `BodyDef`. The native muffalo body, `QuadrupedAnimalWithHooves`, contains four distinct records using the same `Leg` definition, each with a `Hoof` child.

Use the native health tracker to list present candidates for the part definition your integration actually supports:

[!code-csharp[Read present candidates](../examples/Recipes/Health.cs#repeated-parts)]

Let the player choose an occurrence, or apply your mod's explicit selection policy. Keep the chosen `BodyPartRecord` together with the pawn. The recipe deliberately does not pick the first candidate. Labels help present the choice; a localized label, list position or word in a definition name is not a general anatomical identity or capability test.

Two muffalo using the same body definition share its records. The pawn determines whose health list is being accessed. A record constructed separately with the same definition and label is not the same slot. A leg and its hoof are separate targets, and `null` means a whole-body effect, not every matching limb.

## Apply and remove on that exact occurrence

Pass the selected record to both `HediffMaker.MakeHediff` and `ContributionOperations.Add`, as in [the health-effect recipe](health-effects.md#create-describe-then-attach). Recheck the returned status: the part could have become unavailable since the choice was shown. `MissingPart` refuses the request without choosing another leg.

Use `ContributionQueries.Resolve(pawn, identity, selectedPart)` to inspect one contribution on that scope. Use `ContributionOperations.Remove(pawn, identity, selectedPart)` to remove a uniquely identified contribution there. A duplicate identity on that same occurrence is ambiguous; the framework does not pick a winner. Neither query nor removal searches the other three legs to find a replacement.

Ordinary extension API calls work with developer mode disabled. Explicit verification commands still require developer mode and an intentional action.

## Keep slot identity separate from effect lifetime

A `NativeReference` to a health effect follows that exact effect, not whichever contribution later matches its definition or identity. Its `EffectPart` snapshot exposes the slot observed at capture time. Saving the reference uses native serialization; loading does not resume tracking or replay an operation. See [reference persistence](persistence.md).

Native leg loss also marks the hoof as missing and removes affected localized effects. The old effect can remain resolved but detached while still referenced in memory. After saving without that effect and loading again, the reference may be unresolved. Neither state authorizes substitution with another leg or a newly created matching marker.

Restoring the native part makes its slots available again. It does not reapply the removed contributions. A consumer may deliberately create new effects after restoration; those effects have new native identities. The old reference remains about the old effect. An individual organ identity, transfer policy or third-party body replacement requires a separate explicit contract.

## Recorded verification

The [non-human targeting evidence](../compatibility/index.md#non-human-body-targeting) covers two native muffalo, four leg occurrences, one hoof, a whole-body marker and two independent example providers. It includes process restarts, exact reference recovery, native loss/restoration and explicit reapplication.

The candidate-list recipe above is compiled with the documentation examples. The native scenario selects a known record explicitly; it does not certify a player-operated anatomical selection interface. Modded bodies, body-definition changes between saves, organ transfers and third-party providers remain outside this proof.
