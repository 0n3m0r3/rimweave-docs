---
title: Remove and reinstall a prosthetic arm
description: Use native surgery targets and follow exact effects through removal, reinstallation and save loading.
---

# Remove and reinstall a prosthetic arm

A mod attaches an effect to an installed bionic arm. Another mod attaches its own effect at the same site. When the prosthesis is removed, both mods need to observe what the game actually removed. A later replacement must not silently become the old implant or inherit those old effects.

RimWorld owns the surgery recipes, anatomical damage and installation. RimWeave observes exact native effects and guards contribution requests. The extension decides whether and when a new implant should receive a new effect.

## Use the target selected by the recipe

On the inspected game build, `InstallBionicArm` targets **`Shoulder`** in the human body definition. The installed prosthesis occupies that site; its natural `Arm` and `Hand` descendants are marked missing. The recipe's label is not the name of its `BodyPartDef` target.

Obtain candidate parts from the recipe worker's `GetPartsToApplyOn`, then select the intended occurrence explicitly. A match by part definition alone cannot distinguish the two shoulders. Recheck the actual health state after the operation.

| Context | Implant's exact site | Natural descendants marked missing |
| --- | --- | --- |
| Native recipe | `Shoulder` | `Arm`, `Hand` and their descendants |
| Earlier [direct-placement fixture](native-prosthesis.md) | `Arm`, supplied directly to the health tracker | `Hand` and its descendants |

The earlier fixture verifies direct health targeting. It does not establish the recipe's anatomical placement. With the recipe-installed implant, an explicit contribution on the selected shoulder can be added, but requests for its missing natural arm or hand return `MissingPart`. RimWeave does not redirect those requests to the implant.

## Removing an effect is not a surgery recipe

<xref:RimWeave.Health.HediffOperations> removes one exact health effect through the native health tracker. It does not invoke a surgery recipe or request its implant recovery. Native removal callbacks still run.

The inspected `Recipe_RemoveBodyPart` worker applies native surgical damage to the selected site. The installation worker restores the site before adding the new implant. Use the operation that owns the intended transformation instead of assuming that deleting the implant's `Hediff` reproduces the complete operation.

The verification below calls these workers with no surgeon. That path bypasses the surgeon's work, ingredients and failure checks; removal also omits the surgeon-dependent item recovery. It validates the anatomical transitions and contribution lifecycles, not a complete player surgery.

## Observe exact instances

Keep separate <xref:RimWeave.References.NativeReference> objects for the implant and the cooperating contributions. The implant's native identity is different from its body slot and from the contributions' identities.

A removed `ContributionHediff` notifies its active observers through its native removal callback. An ordinary native implant has no RimWeave callback; `Capture()` reevaluates its attachment and records detachment during active tracking. Do not promise an immediate event for every ordinary health effect.

After removal, a held object can still be resolved while `EffectAttached` is false. After loading a save that no longer owns it, the reference becomes unresolved and keeps its diagnostic identity. A new implant on the same slot and new effects with matching contribution identities do not replace those references. Tracking does not restart on load.

## Exercise removal and reinstallation

Use a disposable human colony with the framework and both [composition examples](composition.md). Run mutations explicitly in developer mode. The example producers accept a supplied exact part; their usual hand menu is not a surgery interface.

1. Select one of the installation recipe's two shoulder targets and install `BionicArm` through its native worker. Add A and B to that exact site and A and B to the opposite shoulder as controls. Record native identities, metadata, severity, creation ticks and targets. Track all four contributions and the implant separately. Confirm that additions to the natural arm and hand below the implant are refused.
2. Confirm that the removal recipe offers the implanted site, then invoke its worker. Verify a missing site, no attached implant or targeted contributions, and unchanged controls. Capture the implant reference and inspect all detachment observations. Repeating exact removal for the two absent contributions must return `NotPresent` without repeating callbacks. New additions to the missing site must not select the opposite shoulder.
3. Save under a new name and reload before any new producer action. Verify the missing site, unchanged controls and three unresolved original references. Reinstall through the native installation worker on the same site. Check a new implant identity and no recreated contributions. Save and reload again before applying effects.
4. Add A and B explicitly to the replacement's shoulder site. Check new native identities and unchanged original references. Save under another name and reload a third time. Confirm the same replacement implant and the two new effects, without replaying their additions or restarting tracking.
5. Compare callback counts and all three save files. Check the control metadata and five original reference identities. Passive inspection must preserve the health list and simulation random state. Retain the build, loaded mods and observations with the result.

## Boundaries

The [recorded removal and reinstallation run](../compatibility/index.md#native-prosthesis-removal-and-reinstallation) covers the native human shoulder sites, `BionicArm`, the two cooperating markers and programmatic recipe workers without a surgeon. Both markers use `keepOnBodyPartRestoration = false`.

No general guarantee follows for custom anatomy, third-party recipes or implants, definitions that preserve their effects through restoration, missing providers, or a separate game process. The recovered item, medical costs, failure outcomes and manual surgery UI require their own checks.
