---
title: Check a lost and restored hand
description: Follow exact contributions through native body-part loss, restoration and save loading.
---

# Check a lost and restored hand

Two mods put independent effects on one character's hand. The character loses that hand. Later, the hand is restored. The mods need to know what happened to their original effects before deciding whether to apply anything again.

RimWorld owns the health list, missing parts and restoration. RimWeave describes contributions and observes exact effects in that native list. It does not decide that restoring a hand should repeat a treatment or restart a temporary effect.

## An anatomical slot is not an organ identity

A `BodyPartRecord` describes a slot in the native body definition. The slot can still exist while the character is missing that part, and the same slot can become available after restoration. Holding that record does not prove that the original hand is still present.

Pair the slot with its pawn. Use the native health tracker to determine whether it is currently missing. Use a <xref:RimWeave.References.NativeReference> when you need to follow one exact health effect: its native effect identity is distinct from both the body slot and its provider's contribution identity.

## Native removal still applies

On the inspected game build, adding a missing-part effect invokes native restoration cleanup for that slot and its descendants, keeping the new missing-part marker. The native cleanup calls `PostRemoved` on removed health effects. `ContributionHediff` forwards that callback to its active reference observers; a removed effect's subscription stops.

The definition's native `keepOnBodyPartRestoration` flag can exempt an effect from this cleanup. Both composition markers use the default `false`. Refusing to merge contributions does not make them immune to anatomical changes, and this scenario does not establish the behavior of definitions with that flag enabled.

| Observation | Meaning |
| --- | --- |
| Before loss | The exact effect is resolved and attached. |
| After removal, while its object is still held in memory | It can remain `Resolved` with `EffectAttached == false`. Resolution alone does not authorize using it. |
| After loading a save that no longer owns that effect | Its reference is `Unresolved`, retaining the original diagnostic identity. It does not select another matching contribution. |
| After restoration and a new explicit application | The new effect can have the same contribution identity and body slot, but has a different native effect identity. The old reference stays unchanged. |

An unresolved reference does not prove permanent destruction. Tracking must be restarted explicitly after loading, and an unresolved effect reference cannot be restarted. Native warnings about an absent referenced effect are distinct from a warning-free save/load guarantee.

## Exercise the two-consumer scenario

Use a disposable colony with a human pawn, two present hands, the framework and both [composition examples](composition.md). Execute mutations explicitly in developer mode. This procedure exercises native health APIs; it does not certify a surgery recipe, its costs or its chance of success.

1. Add A and B explicitly to one exact hand, and add A and B to the other hand as controls. Capture the four effects' native identities, metadata, severity, creation ticks and targets. Create and explicitly track an exact reference for each effect. Record the selected slots; the first `Hand` in body-definition order is not a promise of the label “left”.
2. Add the native `MissingBodyPart` effect to the chosen hand. Confirm that its two markers detach and their observers stop, while the other hand's two markers remain unchanged. Attempt both providers' additions on the missing hand: expect `MissingPart`, with no fallback to the other hand. Passive inspection must preserve the native health list and simulation random state.
3. Save under a new name and reload. Inspect before any new producer action: the hand is missing, the original effects remain absent, their saved references are unresolved and tracking has not restarted. Confirm both other-hand controls and repeat the refused additions.
4. Restore that same slot through native `Pawn_HealthTracker.RestorePart`. Verify that the slot is available and that neither former contribution was recreated. Save under another new name, reload and check again before adding anything.
5. Apply A and B explicitly to the restored hand. Verify new native effect identities, unchanged old references and preserved other-hand controls. Save and reload once more; observe the same new effects without replaying their addition callbacks.

Count native addition and removal callbacks separately from lookup results. An equal contribution identity does not prove that the same native effect survived. Keep the original inputs, game build, loaded mods and observations with the result.

## Boundaries

The [recorded run](../compatibility/index.md#native-hand-loss-and-restoration) covers the native human body, the two composition markers and native loss/restoration. It does not cover artificial limbs, altered races, arbitrary third-party callbacks, provider removal or a persistent mapping between individual organs. A provider owns any policy that transfers state or reapplies an effect after restoration.
