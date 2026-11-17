---
title: Read native body properties
description: Keep body size, health scaling and extension-defined dimensions separate.
---

# Read native body properties

A renderer wants to choose a visual size, while a medical mod reads the same character.
Using a health effect's severity as a universal body dimension would give those consumers
an agreement that its owner never declared. Start with the native value whose meaning
matches the question; keep any extension-specific measurement with its provider.

## Read size and health scaling separately

For a fully initialized pawn, RimWorld already exposes both values:

[!code-csharp[Read native body factors](../examples/Recipes/Health.cs#native-body-factors)]

`BodySize` multiplies the race's `baseBodySize` by the current life stage's
`bodySizeFactor`. `HealthScale` separately multiplies `baseHealthScale` by
`healthScaleFactor`. These are native game factors, not metres, current hit points,
a particular organ's dimensions or a guarantee of physical ability. Equal body sizes
can have different health scales. An extension owns any conversion to its own units.

A `Hediff.Severity` is a value interpreted by that effect's definition and code.
It does not automatically become a size, damage amount or shared measurement. A mod
that intentionally uses severity as a dimension must declare that meaning and scale
for its consumers; RimWeave does not change it or infer it from a name or texture.

## Read health for one selected part

A medical display can read current and maximum health from the same exact native
part that the player selected:

[!code-csharp[Read native part health](../examples/Recipes/Health.cs#native-part-health)]

Select the record from that pawn's native body first, as in the
[repeated-parts guide](target-repeated-parts.md). A definition shared by left and right
parts is not a selection. The maximum uses the part definition's hit points and the
pawn's health scale, with native rounding. Current health accounts for injuries on
that exact occurrence; arbitrary effect severity is not subtracted as damage.
Native damage floors and explicitly missing parts remain the game's responsibility.

A health number does not establish that a part is present or usable. For example,
an absent ancestor can make a descendant unavailable even without a missing-part
effect on that descendant. Use native presence queries for anatomy and capacity
queries for function; do not infer either from maximum health. Neither reading
reserves the target or applies treatment.

## Read native function without inventing eligibility

A fully healthy replacement can have less or more efficiency than a natural part.
RimWorld already combines the relevant native replacement properties, health and
stage effects for a selected part:

[!code-csharp[Read native part efficiency](../examples/Recipes/Health.cs#native-part-efficiency)]

Keep the native result rather than reconstructing it from a health ratio. The
installed method also accounts for replacement ancestors and a missing direct
parent; an effect's declared stage offset can change efficiency without subtracting
hit points. Mod-defined getters or patches remain the provider's responsibility.

This local efficiency is not the pawn's overall capacity or permission to perform
an activity. For a native capacity, query the initialized pawn's
`health.capacities.GetLevel(capacityDef)` with the relevant native definition.
Extensions still own the mapping from a capacity to their activity, thresholds,
context, willingness and consequences. A number, anatomy label or prosthesis does
not declare fertility or consent.

## Observe an initialized character

Read on the simulation thread after native pawn initialization. Resolving an uncached
life stage can initialize native state and invoke lifecycle callbacks; reading a
partially constructed pawn is not a passive inspection contract. Do not force a life
stage recalculation merely to display these values.

The returned numbers are observations. Native definitions and life stages remain
authoritative and can change; read again before a later decision. Keeping two numbers
does not reserve a body, freeze a native object or establish fertility, willingness,
health, reachability or the ability to perform an activity.

## Verified boundary

The installed RimWorld 1.7.5011 rev24 getters were inspected and exercised in the test
host. Five regression cases cover independent race/life-stage factors, severity
independence, retained observations, unchanged native effect membership and random
state during repeated reads after fixture initialization. The recipe is compiled
with the documentation examples. These initial cases do not certify arbitrary
initialization paths or third-party patches.

Six additional regression cases exercise the installed maximum/current health
methods: rounding, exact occurrence targeting, unrelated severity, native damage
floors, explicit absence and repeated reads without random-state changes. These
are getter fixtures, not native surgery or a loaded colony.

Five efficiency regression cases call the installed native calculation for two
replacement efficiencies, a replacement ancestor, a missing parent and a stage
offset. They check the distinction from current health and preserve the effect
list, severity and random state. Global capacity workers and arbitrary third-party
patches are not certified by these local part checks.

The [retrospective integration audit](../compatibility/index.md#retrospective-integration-audit)
also executed these recipes on initialized pawns in a disposable colony: unrelated
contribution severity, an injury on one hand with an untouched opposite hand,
missing-parent function and a native bionic-arm replacement. A complete restart
preserved the replacement efficiency and independent other-hand effects. Native
health entry points were invoked directly; surgery jobs and arbitrary providers
remain separate integrations.
