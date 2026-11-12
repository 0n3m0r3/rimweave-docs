---
title: Check a native prosthetic arm
description: Distinguish an artificial arm from its missing natural hand and follow exact contributions across installation.
---

# Check a native prosthetic arm

Two mods put independent effects on a character's arm and hand. A native bionic arm replaces that arm. The mods need to distinguish effects that the game removed from effects that still belong to the other arm, and decide whether any new effect is appropriate for the prosthesis.

RimWorld owns the installation and the health list. RimWeave preserves exact targeting and observes individual contributions. The consumer owns treatment rules, eligibility on artificial parts and any explicit reapplication.

The direct-placement scenario on this page supplies an `Arm` record to the health tracker. The native `InstallBionicArm` surgery recipe instead selects `Shoulder`, leaving its natural arm and hand descendants missing. Follow [removal and reinstallation through native recipes](native-prosthesis-removal.md) for that layout; the implant's name does not identify its body-part target.

## The arm and its hand are different targets

A `BodyPartRecord` describes an anatomical slot, not the identity of a permanent organ. On the inspected game build, adding `BionicArm` keeps the selected arm slot available. Its native `Hediff_AddedPart` cleanup removes ordinary effects on that slot and its descendants, then marks the natural descendants missing. The hand record still exists in the body definition, but it is no longer an available target.

| Requested target after installation | Addition behavior |
| --- | --- |
| Exact artificial arm slot | An explicit contribution can be added if the other guards pass. |
| Missing natural hand below that arm | `MissingPart`; no fallback to the arm or another hand. |
| Other arm or other hand | Remains a separate target, even with the same contribution identity. |

The native `keepOnBodyPartRestoration` definition flag can exempt effects from cleanup. The two markers used here leave it `false`. This check does not establish the behavior of effects that enable it.

An available slot is not a declaration that a treatment makes sense there. A consumer that requires natural tissue must check that requirement itself; RimWeave does not turn it into a framework-wide rule.

## Follow the effect, not a matching identity

Track the exact native effect with <xref:RimWeave.References.NativeReference>. Native removal stops that effect's subscription. While its removed object is still held in memory, it can remain `Resolved` with `EffectAttached == false`. After loading a save that no longer owns it, its reference is `Unresolved` and retains its diagnostic identity.

A new effect on the artificial arm has a new native effect identity, even if its contribution identity matches the previous one. The old reference does not select it. Loading does not restart tracking or replay the producer's addition. An unresolved reference does not prove permanent destruction.

## Exercise the two-consumer scenario

Use a disposable colony with a native human body, two natural arms and hands, the framework and both [composition examples](composition.md). Run mutations explicitly in developer mode. The producer methods accept the exact part supplied by the caller; the example menu's usual hand selection is not a prosthesis installer.

1. Apply A and B to one exact arm and its hand, plus A and B to the other arm and hand as controls. Record the eight effects' native identities, metadata, targets, severity and creation ticks. Explicitly track each effect. Body-definition order does not promise a particular left/right label.
2. Add the native `BionicArm` definition through the pawn's health tracker on the chosen arm. Verify the actual prosthesis, the available arm slot, the missing hand, four removed contributions and four stopped subscriptions. Confirm that the other side's effects and active subscriptions remain intact.
3. Try both providers on the missing hand. Expect `MissingPart` and an unchanged native health list. Save under a new name and reload. Inspect before any producer action: the prosthesis and controls remain, the removed effects are absent, their saved references have no substitute and tracking has not restarted.
4. Explicitly add A and B to the artificial arm. Verify new native identities and unchanged old references and controls. Refuse additions to the missing hand again, including while matching contributions exist on the arm. Save under another name, reload and inspect before any new application.
5. Compare addition/removal callback counts and both save files. Verify exact references, the prosthesis and control metadata. Passive queries must preserve the simulation random state and native health list. Retain the game build, loaded mods and observations with the result.

## Boundaries

The [recorded run](../compatibility/index.md#native-prosthetic-arm) uses programmatic native health calls and the two example markers. It does not exercise the surgery recipe, a doctor's work, ingredient consumption, operation failure or the manual UI. The [separate recipe-worker run](native-prosthesis-removal.md) covers removal and reinstallation at the native shoulder site. Altered races, third-party prostheses, arbitrary callbacks and provider removal require their own checks. The separate [lost-hand scenario](hand-restoration.md) covers native loss and restoration.
