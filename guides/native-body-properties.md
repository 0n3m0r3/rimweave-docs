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
with the documentation examples. No new colony run, third-party patch compatibility
or arbitrary initialization path is certified by these checks.

Six additional regression cases exercise the installed maximum/current health
methods: rounding, exact occurrence targeting, unrelated severity, native damage
floors, explicit absence and repeated reads without random-state changes. These
are getter fixtures, not native surgery or a loaded colony.
